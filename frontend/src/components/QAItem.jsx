import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ReactMarkdown from "react-markdown";

function QAItem({ item }) {
  return (
    <div className="qa-block w-full max-w-xl mb-5">
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
  );
}

export default QAItem;
