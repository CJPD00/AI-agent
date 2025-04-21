import React, { useState } from "react";
import "./App.css"; // Importa tu archivo de estilos CSS
import axios from "axios";
import { handleTextareaResize } from "./helpers/app/handleTextareaResize";

function App() {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (event) => {
    setQuery(event.target.value);
  };

  const handleKeyDown = (event) => {
    if (event.ctrlKey && event.key === "Enter") {
      event.preventDefault();
      if (!query.trim()) {
        return;
      }
      handleSubmit(event);
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
       const result = await axios.post("http://n8n:5678/webhook/ask", {
        query: query,
      });
      console.log(result);
      // const result =
      //   "Lorem ipsum es el texto que se usa habitualmente en diseño gráfico en demostraciones de tipografías o de borradores de diseño para probar el diseño visual antes de insertar el texto";
      setResponse(result.data.output);
      console.log(response)
      //setResponse(result);
      const responseArea = document.querySelector(".response-areas");
      responseArea.scrollIntoView({ behavior: "smooth" });

      const newResponseArea = document.createElement("div");
      newResponseArea.className = "response-area";
      newResponseArea.innerHTML = `
        <h2>Respuesta:</h2>
        <pre class="response-output">${response}</pre>
      `;

      const queryArea = document.createElement("div");
      queryArea.className = "query-area";
      queryArea.innerHTML = `
        <span className="query-text">${query}</span>
      `;

      responseArea.appendChild(queryArea);
      responseArea.appendChild(newResponseArea);
      responseArea.scrollTo({
        top: responseArea.scrollHeight,
        behavior: "smooth",
      });
    } catch (err) {
      setError(err.message);
      // setResponse("");
    } finally {
      setLoading(false);
    }

    setQuery("");
    document.querySelector(".query-input").style.height = "auto";
  };

  return (
    <div className="container">
      <h1>Asistente Virtual</h1>

      <div class="response-areas">
        {/* {response && (
          <div className="response-area">
            <h2>Respuesta:</h2>
            <pre className="response-output">{response}</pre>
          </div>
        )} */}
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
        />
        <button type="submit" disabled={loading} className="submit-button">
          {loading ? "Cargando..." : "Enviar"}
        </button>
      </form>
      {error && <div className="error-message">Error: {error}</div>}
    </div>
  );
}

export default App;
