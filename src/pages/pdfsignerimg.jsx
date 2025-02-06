import { useState, useRef, useEffect } from "react";
import { PDFDocument, rgb, degrees } from "pdf-lib";
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
  const [watermarkImg, setWatermarkImg] = useState(null);
  const [watermarkText, setWatermarkText] = useState("Sample Watermark");
  const [watermarkPosition, setWatermarkPosition] = useState({ x: 100, y: 100 });
  const [signature, setSignature] = useState(null);  // เพิ่ม state สำหรับลายเซ็น
  const [userName] = useState("Zismail Dev");  // ชื่อผู้ใช้
  const currentDate = new Date().toLocaleDateString("th-TH"); // วันที่ปัจจุบัน
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
    const combinedText = watermarkText || ''; // เพิ่มตัวแปร combinedText สำหรับข้อความ watermark

    // ถ้ามีลายเซ็น เพิ่มลายเซ็นลงใน PDF
    if (signature) {
      const signatureImage = await pdfDoc.embedPng(signature);
      const signatureDims = signatureImage.scale(0.3);
      pages.forEach((page) => {
        const { width, height } = page.getSize();
        
        // เพิ่ม combinedText ก่อนรูปภาพ
        page.drawText(`${combinedText}`, {
          x: width - 250,
          y: height - 320,  // ปรับตำแหน่งให้ชิดขึ้น
          size: 12,
          color: rgb(0, 0, 1),
        });
    
        // เพิ่มรูปภาพลายเซ็น
        page.drawImage(signatureImage, {
          x: width - 250,
          y: height - 380,  // ปรับตำแหน่งให้ชิดขึ้น
          width: signatureDims.width,
          height: signatureDims.height,
        });
    
        // เพิ่มชื่อและวันที่หลังรูปภาพ
        page.drawText(`${userName}\n${currentDate}`, {
          x: width - 250,
          y: height - 450,  // ปรับตำแหน่งให้ชิดขึ้น
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

          {/* แสดงภาพ watermark ถ้ามี */}
          {watermarkImg && (
            <img src={watermarkImg} alt="Watermark Preview" className="absolute opacity-50" style={{ left: `${watermarkPosition.x}px`, top: `${watermarkPosition.y}px`, width: "100px" }} />
          )}
        </div>

        <div className="flex flex-col items-center justify-center gap-4">
          <Textarea className="max-w-xs" type="text" value={watermarkText} onChange={(e) => setWatermarkText(e.target.value)} label="Description" placeholder="Enter watermark text" />

          {/* อัปโหลดลายเซ็น */}
          <input type="file" accept="image/png, image/jpeg" onChange={handleSignatureUpload} className="file-input" />

          <button onClick={handleSavePdf} className="px-6 py-3 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition">
            Add Watermark & Save PDF
          </button>

          {/* ปุ่มดาวน์โหลด PDF หลังจากทำการเพิ่ม watermark */}
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
