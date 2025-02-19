import { useState, useRef, useEffect } from "react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { Textarea } from "@heroui/input";
import dynamic from "next/dynamic";
import { Button } from "@heroui/react";
import { pdfjs } from "react-pdf";
import { Rnd } from "react-rnd";

const Document = dynamic(() => import("react-pdf").then((mod) => mod.Document), { ssr: false });
const Page = dynamic(() => import("react-pdf").then((mod) => mod.Page), { ssr: false });

export default function PdfWatermarkImg() {
    const [pdfFile, setPdfFile] = useState(null);
    const [watermarkedPdf, setWatermarkedPdf] = useState(null);
    const [numPages, setNumPages] = useState(null);
    const [watermarkText, setWatermarkText] = useState("Sample Watermark");
    const [signature, setSignature] = useState(null);  // For signature image
    const [userName] = useState("Nattapong");
    const currentDate = new Date().toLocaleDateString("th-TH"); // Current date

    const [position, setPosition] = useState({ x: 50, y: 50 });
    const fileInputRef = useRef(null);
    const renderTaskRef = useRef(null); // Reference to keep track of the render task

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
        const customFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

        const pages = pdfDoc.getPages();

        if (signature) {
            const signatureImage = await pdfDoc.embedPng(signature);
            const signatureDims = signatureImage.scale(0.3);

            pages.forEach((page) => {
                const { width, height } = page.getSize();

                // Add watermark text and signature
                page.drawText(watermarkText, {
                    x: position.x,
                    y: height - position.y,
                    size: 12,
                    font: customFont,
                    color: rgb(0, 0, 1),
                });

                page.drawImage(signatureImage, {
                    x: position.x,
                    y: height - position.y - 20,
                    width: signatureDims.width,
                    height: signatureDims.height,
                });

                // Add username and date below the signature
                page.drawText(`${userName}\n${currentDate}`, {
                    x: position.x,
                    y: height - position.y - 20 - signatureDims.height - 20,
                    size: 12,
                    font: customFont,
                    color: rgb(0, 0, 1),
                });
            });
        }

        const modifiedPdfBytes = await pdfDoc.save();
        setWatermarkedPdf(URL.createObjectURL(new Blob([modifiedPdfBytes], { type: "application/pdf" })));
    };

    const handleRenderSuccess = (numPages) => {
        setNumPages(numPages);
        renderTaskRef.current = null; // Clear the render task reference after success
    };

    const handleRenderError = (error) => {
        console.error(error);
        renderTaskRef.current = null; // Clear the render task reference after error
    };

    return (
        <div className="max-w-7xl mx-auto p-6 bg-gray-100 rounded-lg shadow-md">
            <h2 className="text-3xl font-bold text-center text-gray-900">PDF Watermark (Image & Text)</h2>
            <h4 className="text-xl text-center text-gray-700">ลงนามเอกสาร</h4>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-6">
                <div className="relative bg-blue border rounded-lg p-4 shadow-lg w-full h-[800px] flex justify-center items-center">
                    {pdfFile ? (
                        <Document
                            file={pdfFile}
                            onLoadSuccess={({ numPages }) => handleRenderSuccess(numPages)}
                            onLoadError={handleRenderError}
                        >
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

                    <Rnd
                        size={{ width: 200, height: 150 }}
                        position={position}
                        onDragStop={(e, d) => setPosition({ x: d.x, y: d.y })}
                    >
                        <div className="bg-transparent border-2 border-dashed border-blue-500 p-1 cursor-move">
                            <div className="text-blue-700 p-1">
                                {watermarkText}
                            </div>
                            {signature && (
                                <div className="mt-2">
                                    <img src={signature} alt="Signature" className="w-full h-auto" />
                                </div>
                            )}
                            <div className="mt-2 text-sm text-blue-700">
                                {userName}<br />
                                {currentDate}
                            </div>
                        </div>
                    </Rnd>
                </div>

                <div className="flex flex-col items-center justify-center gap-4">
                    <Textarea
                        className="max-w-xs"
                        type="text"
                        value={watermarkText}
                        onChange={(e) => setWatermarkText(e.target.value)}
                        label="Description"
                        placeholder="Enter watermark text"
                    />

                    {/* Upload signature */}
                    <input type="file" accept="image/png, image/jpeg" onChange={handleSignatureUpload} className="file-input" />

                    <button onClick={handleSavePdf} className="px-6 py-3 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition">
                        Add Watermark & Save PDF
                    </button>

                    {/* Download button after watermark is applied */}
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