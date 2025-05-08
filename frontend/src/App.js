import React, { useState } from "react";
import PDFViewer from "./components/PDFViewer";
import axios from "axios";

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [spans, setSpans] = useState([]);
  const [filename, setFilename] = useState("");

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleSendPDF = async () => {
    if (!selectedFile) return alert("Selecione um PDF");

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await axios.post("https://frodo-backend.onrender.com/upload", formData);
      setSpans(response.data.spans);
      setFilename(response.data.filename);
    } catch (err) {
      console.error("Erro ao enviar PDF:", err);
      alert("Erro ao enviar o PDF. Verifique o backend.");
    }
  };

  const handleDownload = async () => {
    if (!filename || spans.length === 0) return;

    try {
      const response = await axios.post(
        "https://frodo-backend.onrender.com/download",
        { spans, filename },
        { responseType: "blob" }
      );

      const url = URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "pdf_editado.pdf");
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      console.error("Erro ao baixar PDF:", err);
      alert("Erro ao baixar o PDF.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 p-8">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4 text-center">Frodo PDF</h1>
        <p className="text-center text-sm text-gray-500 mb-4">
          Envie um PDF, edite campos diretamente na tela e baixe com as alterações.
        </p>

        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="mb-4"
        />

        <div className="flex gap-4">
          <button
            onClick={handleSendPDF}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg"
          >
            Enviar PDF
          </button>

          {spans.length > 0 && (
            <button
              onClick={handleDownload}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg"
            >
              Baixar PDF
            </button>
          )}
        </div>

        {spans.length > 0 && (
          <div
            className="mt-6 mx-auto border border-gray-300 rounded-md bg-gray-50 relative"
            style={{
              width: '100%',
              maxWidth: '100%',
              height: '90vh',
              overflow: 'auto',
              padding: '1rem',
              boxShadow: '0 0 10px rgba(0,0,0,0.1)'
            }}
          >
            <PDFViewer
              spans={spans}
              setSpans={setSpans}
              pdfUrl={`https://frodo-backend.onrender.com/uploads/${filename}`}
            />
          </div>
        )}

      </div>
    </div>
  );
}

export default App;
