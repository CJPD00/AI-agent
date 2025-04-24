import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClipboard } from "@fortawesome/free-solid-svg-icons";
import { library } from "@fortawesome/fontawesome-svg-core";

library.add(faClipboard);
import axios from "axios";
import { handleTextareaResize } from "./helpers/handleTextAreaResize";
import { N8N_HOST } from "../env";
import ReactMarkdown from "react-markdown";
import QAItem from "./components/QAItem";
import QueryInput from "./components/QueryInput";
import useSpeechRecognition from "./hooks/useSpeechRecognition";

function App() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { transcript, isListening, toggleListening } = useSpeechRecognition();
  const [history, setHistory] = useState([]);

  const endOfResponsesRef = useRef(null);

  useEffect(() => {
    endOfResponsesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

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

  return (
    <div className="dark:bg-gray-800 dark:text-white min-h-screen flex flex-col items-center">
      <h1 className="text-3xl font-bold text-sky-400">Asistente Virtual</h1>

      <div className="response-areas overflow-y-auto h-[70vh] scrollbar-width-none flex flex-col items-center p-5 mb-5 w-full max-w-2xl">
        {history.map((item, index) => (
          <QAItem key={index} item={item} />
        ))}
        <div ref={endOfResponsesRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="input-area absolute bottom-0 mb-5 w-full max-w-2xl flex items-center"
      >
        <QueryInput
          query={query}
          handleInputChange={handleInputChange}
          handleKeyDown={handleKeyDown}
          handleTextareaResize={handleTextareaResize}
          loading={loading}
          isListening={isListening}
          toggleListening={toggleListening}
          handleSubmit={handleSubmit}
          transcript={transcript}
        />
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
