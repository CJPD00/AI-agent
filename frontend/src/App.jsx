import React, { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";
import { handleTextareaResize } from "./helpers/app/handleTextareaResize";
import { N8N_HOST } from "../env";

function App() {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [history, setHistory] = useState([]);

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
    } else {
      console.log("Speech Recognition Not Available");
    }
  }, []);

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

      setResponse(output);
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

      setResponse(output);
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
    <div className="container">
      <h1>Asistente Virtual</h1>

      <div className="response-areas">
        {history.map((item, index) => (
          <div key={index}>
            <div className="query-area">
              <span className="query-text">{item.query}</span>
            </div>
            <div className="response-area">
              <h2>Respuesta:</h2>
              <pre className="response-output">{item.response}</pre>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="input-area">
        <textarea
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onInput={handleTextareaResize}
          className="query-input"
          rows={3}
          placeholder="Escribe tu consulta aquí (ej. Buscar libros de ciencia ficción)"
          disabled={isListening}
        />
        <button
          type="submit"
          disabled={loading || isListening}
          className="submit-button"
        >
          {loading ? "Cargando..." : "Enviar"}
        </button>
        <button
          type="button"
          className={`record-button ${isListening ? "recording" : ""}`}
          onClick={toggleListening}
          title={isListening ? "Detener Grabación" : "Iniciar Grabación"}
        >
          <div className="record-icon"></div>
        </button>
      </form>

      {error && <div className="error-message">Error: {error}</div>}
    </div>
  );
}

export default App;
