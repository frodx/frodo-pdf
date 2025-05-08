import { useEffect, useRef } from "react";
import { getDocument } from "pdfjs-dist";
import "pdfjs-dist/web/pdf_viewer.css";

const PDFViewer = ({ fileUrl }) => {
  const canvasRef = useRef();

  useEffect(() => {
    const renderPDF = async () => {
      const pdf = await getDocument(fileUrl).promise;
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({ canvasContext: context, viewport }).promise;
    };

    if (fileUrl) renderPDF();
  }, [fileUrl]);

  return (
    <div>
      <canvas ref={canvasRef} style={{ border: "1px solid #ccc" }} />
    </div>
  );
};

export default PDFViewer;
