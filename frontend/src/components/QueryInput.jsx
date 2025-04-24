import React from "react";

function QueryInput({
  query,
  handleInputChange,
  handleKeyDown,
  handleTextareaResize,
  loading,
  isListening,
  toggleListening,
  handleSubmit,
}) {
  return (
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
            className={`record-button mr-2 w-8 h-8 rounded-full bg-red-600 border-none cursor-pointer flex items-center justify-center shadow-md transition-colors duration-300  ${
              isListening ? "recording" : ""
            }`}
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
  );
}

export default QueryInput;
