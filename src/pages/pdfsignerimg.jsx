import { useState, useRef, useEffect } from "react";
import { PDFDocument, rgb, degrees } from "pdf-lib";
import dynamic from "next/dynamic";
import { pdfjs } from "react-pdf";

const Document = dynamic(() => import("react-pdf").then((mod) => mod.Document), { ssr: false });
const Page = dynamic(() => import("react-pdf").then((mod) => mod.Page), { ssr: false });

export default function PdfWatermarkImg() {
  const [pdfFile, setPdfFile] = useState(null);
  const [watermarkedPdf, setWatermarkedPdf] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [watermarkImg, setWatermarkImg] = useState(null);
  const [watermarkPosition, setWatermarkPosition] = useState({ x: 100, y: 100 });
  const canvasRef = useRef(null);

  useEffect(() => {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
  }, []);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onload = () => setPdfFile(reader.result);
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => setWatermarkImg(reader.result);
    }
  };

  const handleSavePdf = async () => {
    if (!pdfFile || !watermarkImg) return;
    const pdfDoc = await PDFDocument.load(pdfFile);
    const pages = pdfDoc.getPages();
    const imgBytes = await fetch(watermarkImg).then((res) => res.arrayBuffer());
    const img = await pdfDoc.embedPng(imgBytes);

    pages.forEach((page) => {
      const { width, height } = page.getSize();
      page.drawImage(img, {
        x: watermarkPosition.x,
        y: height - watermarkPosition.y - 50,
        width: 100,
        height: 50,
        opacity: 0.5,
        rotate: degrees(30),
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
    <div className="max-w-7xl mx-auto p-6 bg-gray-100 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-center text-gray-900">PDF Watermark (Image)</h2>
      <h4 className="text-xl text-center text-gray-700">ตัวลงนามเอกสาร</h4>

      {/* File Upload Inputs */}
      <div className="flex flex-col items-center gap-4 mt-6">
        <input type="file" accept="image/png, image/jpeg" onChange={handleImageUpload} className="file-input" />
      </div>

      {/* PDF Preview & Watermark Placement */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-6">

        <div
          className="relative bg-blue border rounded-lg p-4 shadow-lg w-full h-[800px] flex justify-center items-center"
          onClick={handleCanvasClick}
          ref={canvasRef}
          style={{ cursor: "pointer" }}
        >
          {pdfFile ? (
            <Document file={pdfFile} onLoadSuccess={({ numPages }) => setNumPages(numPages)}>
              <Page pageNumber={1} width={500} />
            </Document>
          ) : (
            <input type="file" accept="application/pdf" onChange={handleFileUpload} className="file-input" />
          )}
          {watermarkImg && (
            <img
              src={watermarkImg}
              alt="Watermark Preview"
              className="absolute opacity-50"
              style={{
                left: `${watermarkPosition.x}px`,
                top: `${watermarkPosition.y}px`,
                width: "100px",
              }}
            />
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col items-center justify-center gap-4">
          <button
            onClick={handleSavePdf}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition"
          >
            Add Watermark & Save PDF
          </button>
          {watermarkedPdf && (
            <a
              href={watermarkedPdf}
              download="watermarked.pdf"
              className="px-6 py-3 bg-green-500 text-white rounded-lg shadow hover:bg-green-600 transition"
            >
              Download Watermarked PDF
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
