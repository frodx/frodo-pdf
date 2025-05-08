import React, { useState } from "react";
import './PDFViewer.css';

function PDFViewer({ spans, setSpans, pdfUrl }) {
  const [editingIndex, setEditingIndex] = useState(null);
  const zoom = 1.8; // ajuste o fator de zoom aqui

  const handleTextClick = (index) => setEditingIndex(index);

  const handleChange = (index, value) => {
    const updated = [...spans];
    updated[index].text = value;
    setSpans(updated);
  };

  const handleBlur = () => setEditingIndex(null);

  return (
    <div
  className="pdf-container"
  style={{
    transform: 'scale(2.5)',
    transformOrigin: 'top left',
    minWidth: '1200px', // isso garante espaço horizontal
  }}
>
      
      {spans.map((span, index) => {
        const [x0, y0, x1, y1] = span.bbox;
        const width = x1 - x0;
        const height = y1 - y0;

        const style = {
          position: 'absolute',
          top: y0,
          left: x0,
          width,
          height,
          fontSize: span.size,
          fontWeight: span.bold ? "bold" : "normal",
          fontStyle: span.italic ? "italic" : "normal",
          fontFamily: "Helvetica",
          backgroundColor: editingIndex === index ? "rgba(255,255,255,0.9)" : "transparent",
          border: editingIndex === index ? "1px solid #999" : "none",
          padding: 0,
          margin: 0,
          lineHeight: 1,
          overflow: "hidden",
          zIndex: 10,
          cursor: "pointer",
        };

        return editingIndex === index ? (
          <input
            key={index}
            type="text"
            value={span.text}
            autoFocus
            onChange={(e) => handleChange(index, e.target.value)}
            onBlur={handleBlur}
            style={style}
          />
        ) : (
          <div
            key={index}
            onClick={() => handleTextClick(index)}
            style={style}
          >
            {span.text}
          </div>
        );
      })}
    </div>
  );
}

export default PDFViewer;
