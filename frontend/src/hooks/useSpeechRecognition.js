import { useState, useEffect } from "react";

function useSpeechRecognition({ onSubmit }) {
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    if ("webkitSpeechRecognition" in window) {
      const newRecognition = new window.webkitSpeechRecognition();
      newRecognition.continuous = true;
      newRecognition.interimResults = true;
      newRecognition.lang = "es-ES";

      newRecognition.onresult = (event) => {
        let finalTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          finalTranscript += event.results[i][0].transcript;
        }
        setTranscript(finalTranscript);
      };

      newRecognition.onstart = () => setIsListening(true);
      newRecognition.onend = () => setIsListening(false);
      newRecognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      setRecognition(newRecognition);
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognition?.stop();
      if (onSubmit) {
        onSubmit();
      }
    } else {
      recognition?.start();
    }
  };

  return {
    transcript,
    isListening,
    toggleListening,
    setTranscript,
    recognition,
  };
}

export default useSpeechRecognition;
