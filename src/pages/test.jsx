import { useState, useRef, useEffect } from "react";
import { PDFDocument, rgb } from "pdf-lib";
import { Textarea } from "@heroui/input";
import dynamic from "next/dynamic";
import { Button } from "@heroui/react";
import { saveAs } from "file-saver";
import { Rnd } from "react-rnd"; // Import Rnd
import * as pdfjs from 'pdfjs-dist';  // ใช้ pdfjs จาก pdfjs-dist

const Document = dynamic(() => import("react-pdf").then((mod) => mod.Document), { ssr: false });
const Page = dynamic(() => import("react-pdf").then((mod) => mod.Page), { ssr: false });

export default function PdfWatermarkImg() {
  const [pdfFile, setPdfFile] = useState(null);
  const [watermarkedPdf, setWatermarkedPdf] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [watermarkImg, setWatermarkImg] = useState(null);
  const [watermarkText, setWatermarkText] = useState("Sample Watermark");
  const [watermarkPosition, setWatermarkPosition] = useState({ x: 100, y: 100 });
  const [signature, setSignature] = useState(null);
  const [userName] = useState("Zismail Dev");
  const currentDate = new Date().toLocaleDateString("th-TH");
  const fileInputRef = useRef(null);

  useEffect(() => {
    // กำหนด workerSrc สำหรับ pdfjs
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

  const handleSignatureUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => setSignature(reader.result);
    }
  };

  const handleSavePdf = async () => {
    if (!pdfFile) return;

    const pdfDoc = await PDFDocument.load(pdfFile);
    const pages = pdfDoc.getPages();
    const combinedText = watermarkText || ''; 

    if (signature) {
      const signatureImage = await pdfDoc.embedPng(signature);
      const signatureDims = signatureImage.scale(0.3);
      pages.forEach((page) => {
        const { width, height } = page.getSize();

        // Add watermark text
        page.drawText(`${combinedText}`, {
          x: watermarkPosition.x,
          y: watermarkPosition.y,
          size: 12,
          color: rgb(0, 0, 1),
        });

        // Add signature image
        page.drawImage(signatureImage, {
          x: watermarkPosition.x + 100, // Adjust this position as needed
          y: watermarkPosition.y - 100, // Adjust this position as needed
          width: signatureDims.width,
          height: signatureDims.height,
        });

        // Add name and date
        page.drawText(`${userName}\n${currentDate}`, {
          x: watermarkPosition.x,
          y: watermarkPosition.y - 150, // Adjust this position as needed
          size: 12,
          color: rgb(0, 0, 1),
        });
      });
    }

    const modifiedPdfBytes = await pdfDoc.save();
    setWatermarkedPdf(URL.createObjectURL(new Blob([modifiedPdfBytes], { type: "application/pdf" })));
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-100 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-center text-gray-900">PDF Watermark (Image & Text)</h2>
      <h4 className="text-xl text-center text-gray-700">ลงนามเอกสาร</h4>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-6">
        <div className="relative bg-blue border rounded-lg p-4 shadow-lg w-full h-[800px] flex justify-center items-center">
          {pdfFile ? (
            <Document file={pdfFile} onLoadSuccess={({ numPages }) => setNumPages(numPages)}>
              <Page pageNumber={1} width={500} />
            </Document>
          ) : (
            <div className="align-center text-center">
              <p className="text-gray-500">Upload a PDF to preview</p>
              <input type="file" accept="application/pdf" onChange={handleFileUpload} ref={fileInputRef} className="hidden" />
              <Button onClick={() => fileInputRef.current.click()} className="px-6 py-3 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition">
                Upload PDF
              </Button>
            </div>
          )}

          {/* Watermark with Rnd */}
          {watermarkText && (
            <Rnd
              size={{ width: 200, height: 50 }}
              position={{ x: watermarkPosition.x, y: watermarkPosition.y }}
              onDragStop={(e, d) => setWatermarkPosition({ x: d.x, y: d.y })}
            >
              <div className="text-sm font-bold text-gray-700">{watermarkText}</div>
            </Rnd>
          )}
        </div>

        <div className="flex flex-col items-center justify-center gap-4">
          <Textarea className="max-w-xs" type="text" value={watermarkText} onChange={(e) => setWatermarkText(e.target.value)} label="Description" placeholder="Enter watermark text" />

          <input type="file" accept="image/png, image/jpeg" onChange={handleSignatureUpload} className="file-input" />

          <button onClick={handleSavePdf} className="px-6 py-3 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition">
            Add Watermark & Save PDF
          </button>

          {watermarkedPdf && (
            <a href={watermarkedPdf} download="watermarked.pdf" className="px-6 py-3 bg-green-500 text-white rounded-lg shadow hover:bg-green-600 transition">
              Download Watermarked PDF
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
