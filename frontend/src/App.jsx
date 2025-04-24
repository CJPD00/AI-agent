import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClipboard } from "@fortawesome/free-solid-svg-icons";
import { library } from '@fortawesome/fontawesome-svg-core';

library.add(faClipboard);
import axios from "axios";
import { handleTextareaResize } from "./helpers/handleTextAreaResize";
import { N8N_HOST } from "../env";
import ReactMarkdown from "react-markdown";

function App() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [history, setHistory] = useState([]);

  const endOfResponsesRef = useRef(null);

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

  useEffect(() => {
    endOfResponsesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const toggleListening = () => {
    if (isListening) {
      recognition?.stop();
      handleSubmitWithTranscript();
    } else {
      recognition?.start();
    }
  };

  const handleInputChange = (event) => setQuery(event.target.value);

  const handleKeyDown = (event) => {
    if (event.ctrlKey && event.key === "Enter") {
      setQuery(query + "\n");
      event.preventDefault();
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      if (query.trim()) handleSubmit(event);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    if (!query.trim()) {
      setLoading(false);
      return;
    }

    try {
      const result = await axios.post(`${N8N_HOST}`, { query });
      const output = result.data.output;

      setHistory((prev) => [...prev, { query, response: output }]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }

    setQuery("");
    document.querySelector(".query-input").style.height = "auto";
  };

  const handleSubmitWithTranscript = async () => {
    setLoading(true);
    setError(null);

    if (!transcript.trim()) {
      setLoading(false);
      return;
    }

    try {
      const result = await axios.post(`${N8N_HOST}`, { query: transcript });
      const output = result.data.output;

      setHistory((prev) => [...prev, { query: transcript, response: output }]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }

    setTranscript("");
    setQuery("");
    document.querySelector(".query-input").style.height = "auto";
  };

  return (
    <div className="dark:bg-gray-800 dark:text-white min-h-screen flex flex-col items-center">
      <h1 className="text-3xl font-bold text-sky-400">Asistente Virtual</h1>

      <div className="response-areas overflow-y-auto h-[70vh] scrollbar-width-none flex flex-col items-center p-5 mb-5 w-full max-w-2xl">
        {history.map((item, index) => (
          <div key={index} className="qa-block w-full max-w-xl mb-5">
            <div className="query-area w-3/5 text-sky-300 text-sm mr-2 ml-[45%] bg-gray-700 p-5 border border-gray-600 rounded-xl overflow-wrap-break-word">
              <span className="query-text">{item.query}</span>
            </div>
            <div className="response-area w-3/5 bg-gray-700 p-5 border border-gray-600 rounded-xl mt-5 flex flex-col items-start">
              <h2 className="text-sky-400 mt-0 mb-2">Respuesta:</h2>
              <div className="response-output markdown-body bg-gray-700 p-2 rounded-md whitespace-pre-wrap text-sm text-sky-300 border-none w-full">
                <ReactMarkdown>{item.response}</ReactMarkdown>
              </div>
              <button
                className="copy-button bg-sky-700 text-white border-none rounded-md cursor-pointer w-20 h-8 flex items-center justify-center transition-colors duration-300 disabled:bg-gray-700 copy-button-animated"
                onClick={() => navigator.clipboard.writeText(item.response)}
              >
                <FontAwesomeIcon icon="clipboard" />
              </button>
            </div>
          </div>
        ))}
        <div ref={endOfResponsesRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="input-area absolute bottom-0 mb-5 w-full max-w-2xl flex items-center"
      >
        <div className="w-full">
          <div className="relative w-full">
            <textarea
              value={query}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onInput={handleTextareaResize}
              className="query-input flex-grow p-2 border border-gray-600 rounded-md resize-none text-sm outline-none bg-gray-700 text-sky-300 overflow-y-auto max-h-24 w-full pr-10"
              rows={3}
              placeholder="Escribe tu consulta aquí (ej. Buscar libros de ciencia ficción)"
              disabled={isListening}
            />
            <div className="flex items-center justify-end">
              <button
                type="button"
                className={`record-button mr-2 w-8 h-8 rounded-full bg-red-600 border-none cursor-pointer flex items-center justify-center shadow-md transition-colors duration-300  ${isListening ? "recording" : ""}`}
                onClick={toggleListening}
                title={isListening ? "Detener Grabación" : "Iniciar Grabación"}
              >
                <div className="record-icon w-4 h-4 rounded-full bg-white"></div>
              </button>
              <button
                type="submit"
                disabled={loading || isListening}
                className="bg-sky-700 text-white border-none rounded-full cursor-pointer w-8 h-8 flex items-center justify-center transition-colors duration-300 disabled:bg-gray-700"
                title="Enviar consulta"
              >
                {loading ? "..." : "→"}
              </button>
            </div>
          </div>
        </div>
      </form>

      {error && (
        <div className="error-message text-red-500 mt-2 absolute bottom-0">
          Error: {error}
        </div>
      )}
    </div>
  );
}

export default App;
