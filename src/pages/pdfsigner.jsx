import { useState, useRef, useEffect } from "react";
import { PDFDocument, rgb, degrees } from "pdf-lib"; // ใช้ degrees() เพื่อกำหนดการหมุน
import dynamic from "next/dynamic";
import { pdfjs } from "react-pdf";

// ใช้ dynamic import เพื่อปิด SSR
const Document = dynamic(() => import("react-pdf").then((mod) => mod.Document), { ssr: false });
const Page = dynamic(() => import("react-pdf").then((mod) => mod.Page), { ssr: false });

export default function PdfWatermarkText() {
  const [pdfFile, setPdfFile] = useState(null);
  const [watermarkedPdf, setWatermarkedPdf] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [watermarkText, setWatermarkText] = useState("Watermark Text");
  const [watermarkPosition, setWatermarkPosition] = useState({ x: 100, y: 100 });
  const canvasRef = useRef(null);

  useEffect(() => {
    // ตั้งค่า pdf.worker.mjs
    pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
  }, []);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onload = () => {
        setPdfFile(reader.result);
      };
    }
  };

  const handleSavePdf = async () => {
    if (!pdfFile) return;
    const pdfDoc = await PDFDocument.load(pdfFile);
    const pages = pdfDoc.getPages();
  
    pages.forEach(page => {
      page.drawText(watermarkText, {
        x: watermarkPosition.x,
        y: page.getHeight() - watermarkPosition.y - 30,
        size: 40,
        color: rgb(0.75, 0.75, 0.75),
        rotate: degrees(45), // ใช้ degrees() เพื่อกำหนดการหมุน
        opacity: 0.5, // Set watermark opacity
      });
    });
  
    const modifiedPdfBytes = await pdfDoc.save();
    setWatermarkedPdf(URL.createObjectURL(new Blob([modifiedPdfBytes], { type: "application/pdf" })));
  };

  const handleCanvasClick = (event) => {
    const rect = canvasRef.current.getBoundingClientRect();
    setWatermarkPosition({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen flex flex-col items-center">
      <h1 className="text-xl font-bold mb-4">PDF Watermark</h1>
      
      {/* Input for PDF Upload */}
      <input type="file" accept="application/pdf" onChange={handleFileUpload} className="mb-4" />
      
      {/* Watermark Text */}
      <input
        type="text"
        value={watermarkText}
        onChange={(e) => setWatermarkText(e.target.value)}
        className="mb-4 p-2 border rounded"
        placeholder="Enter watermark text"
      />

      {/* Display PDF */}
      <div className="relative border p-2" onClick={handleCanvasClick} ref={canvasRef} style={{ cursor: 'pointer' }}>
        {pdfFile && (
          <Document file={pdfFile} onLoadSuccess={({ numPages }) => setNumPages(numPages)}>
            {/* Show first page of the PDF */}
            <Page pageNumber={1} width={600} />
          </Document>
        )}
        
        {/* Show Watermark Position */}
        <div
          className="absolute bg-blue-500 text-white px-2 py-1 rounded cursor-pointer"
          style={{ left: `${watermarkPosition.x}px`, top: `${watermarkPosition.y}px` }}
        >
          Watermark Here
        </div>
      </div>

      {/* Save PDF with Watermark */}
      <button onClick={handleSavePdf} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">
        Add Watermark and Save PDF
      </button>

      {/* Download Watermarked PDF */}
      {watermarkedPdf && (
        <a href={watermarkedPdf} download="watermarked.pdf" className="mt-4 bg-green-500 text-white px-4 py-2 rounded">
          Download Watermarked PDF
        </a>
      )}
    </div>
  );
}
