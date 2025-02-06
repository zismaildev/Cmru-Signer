import { useState, useRef, useEffect } from "react";
import { PDFDocument, rgb } from "pdf-lib";
import { Textarea } from "@heroui/input";
import dynamic from "next/dynamic";
import { pdfjs } from "react-pdf";
import { Button } from "@heroui/react";
import { saveAs } from "file-saver";

const Document = dynamic(() => import("react-pdf").then((mod) => mod.Document), { ssr: false });
const Page = dynamic(() => import("react-pdf").then((mod) => mod.Page), { ssr: false });

export default function PdfWatermarkImg() {
  const [pdfFile, setPdfFile] = useState(null);
  const [watermarkedPdf, setWatermarkedPdf] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [selectedPage, setSelectedPage] = useState(1);
  const [watermarkImg, setWatermarkImg] = useState(null);
  const [watermarkText, setWatermarkText] = useState("Sample Watermark");
  const [watermarkPosition, setWatermarkPosition] = useState({ x: 100, y: 100 });
  const [signature, setSignature] = useState(null);
  const [userName] = useState("Zismail Dev");
  const currentDate = new Date().toLocaleDateString("th-TH");
  const fileInputRef = useRef(null);

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
    const page = pages[selectedPage - 1];

    if (signature) {
      const signatureImage = await pdfDoc.embedPng(signature);
      const signatureDims = signatureImage.scale(0.3);
      const combinedText = watermarkText || ''; // เพิ่มตัวแปร combinedText สำหรับข้อความ watermark


      // เพิ่ม combinedText ก่อนรูปภาพ
      page.drawText(`${combinedText}`, {
        x: watermarkPosition.x,
        y: watermarkPosition.y,
        width: signatureDims.width,
        height: signatureDims.height,
      });
      page.drawImage(signatureImage, {
        x: watermarkPosition.x,
        y: watermarkPosition.y,
        width: signatureDims.width,
        height: signatureDims.height,
        color: rgb(0, 0, 1),
      });
      page.drawText(`${userName}\n${currentDate}`, {
        x: watermarkPosition.x,
        y: watermarkPosition.y - 30,
        size: 12,
        color: rgb(0, 0, 1),
      });
    }

    const modifiedPdfBytes = await pdfDoc.save();
    setWatermarkedPdf(URL.createObjectURL(new Blob([modifiedPdfBytes], { type: "application/pdf" })));
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-100 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-center">PDF Watermark & Signature</h2>
      <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-6 mt-6">
        <div className="relative bg-white border rounded-lg p-4 shadow-lg w-full h-[800px] flex justify-center items-center">
          {pdfFile ? (
            <Document file={pdfFile} onLoadSuccess={({ numPages }) => setNumPages(numPages)}>
              <Page pageNumber={selectedPage} width={500} />
            </Document>
          ) : (
            <div className="text-center">
              <input type="file" accept="application/pdf" onChange={handleFileUpload} ref={fileInputRef} className="hidden" />
              <Button onClick={() => fileInputRef.current.click()} className="bg-blue-500 text-white">Upload PDF</Button>
            </div>
          )}
        </div>

        <div className="flex flex-col items-center gap-4">
          <Textarea className="max-w-xs" value={watermarkText} onChange={(e) => setWatermarkText(e.target.value)} placeholder="Enter watermark text" />
          <input type="file" accept="image/png, image/jpeg" onChange={handleSignatureUpload} />
          <label>Select Page: </label>
          <input type="number" min={1} max={numPages} value={selectedPage} onChange={(e) => setSelectedPage(Number(e.target.value))} />
          <Button onClick={handleSavePdf} className="bg-blue-500 text-white">Add Watermark & Save PDF</Button>
          {watermarkedPdf && <a href={watermarkedPdf} download="watermarked.pdf" className="bg-green-500 text-white">Download PDF</a>}
        </div>
      </div>
    </div>
  );
}
