import { useState, useRef, useEffect } from "react";
import Head from "next/head";
import { PDFDocument, rgb } from "pdf-lib";
import { Textarea } from "@heroui/input";
import { Select, SelectItem, Button } from "@heroui/react";
import { pdfjs } from "react-pdf";
import { Rnd } from "react-rnd";
import dynamic from "next/dynamic";
import fontkit from "@pdf-lib/fontkit";

const Document = dynamic(() => import("react-pdf").then((mod) => mod.Document), { ssr: false });
const Page = dynamic(() => import("react-pdf").then((mod) => mod.Page), { ssr: false });

export const title = [
    { key: "เรียนอธิการบดี", label: "เรียนอธิการบดี" },
    { key: "เรียนคณบดี", label: "เรียนคณบดี" },
];

export default function PdfWatermarkImg() {
    const [pdfFile, setPdfFile] = useState(null);
    const [watermarkedPdf, setWatermarkedPdf] = useState(null);
    const [numPages, setNumPages] = useState(null);
    const [watermarkContent, setWatermarkContent] = useState("Sample Watermark");
    const [signature, setSignature] = useState(null);
    const [userName] = useState("ณัฐพงษ์ ปันธิยะ");
    const [role] = useState("นักศึกษา");
    const currentDate = new Date().toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" });
    const [position, setPosition] = useState({ x: 50, y: 50 });
    const [pdfSize, setPdfSize] = useState({ width: null, height: null });
    const fileInputRef = useRef(null);
    const [watermarkTitle, setWatermarkTitle] = useState(title[0].label);

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
        pdfDoc.registerFontkit(fontkit); // ลงทะเบียน fontkit

        // ฝังฟอนต์ภาษาไทย
        const fontBytes = await fetch('/fonts/THSarabunNew.ttf').then((res) => res.arrayBuffer());
        const thaiFont = await pdfDoc.embedFont(fontBytes);

        const pages = pdfDoc.getPages();
        const { width, height } = pages[0].getSize();
        setPdfSize({ width, height });

        if (signature) {
            const signatureImage = await pdfDoc.embedPng(signature);
            const signatureDims = signatureImage.scale(0.3);

            pages.forEach((page) => {
                const textSize = 14;
                const titleWidth = thaiFont.widthOfTextAtSize(watermarkTitle, textSize);
                const contentWidth = thaiFont.widthOfTextAtSize(watermarkContent, textSize);

                if (!isNaN(position.y) && !isNaN(height)) {
                    page.drawText(watermarkTitle, {
                        x: position.x,
                        y: height - position.y,
                        size: 16,
                        font: thaiFont,
                        color: rgb(0, 0, 1),
                        fontWeight: 'bold',
                    });
                    page.drawText(watermarkContent, {
                        x: position.x,
                        y: height - position.y - 20,
                        size: textSize,
                        font: thaiFont,
                        color: rgb(0, 0, 1),
                    });
                    page.drawImage(signatureImage, {
                        x: position.x,
                        y: height - position.y - 45,
                        width: signatureDims.width,
                        height: signatureDims.height,
                    });
                    page.drawText(`${userName}\n${role}\n${currentDate}`, {
                        x: position.x,
                        y: height - position.y - 20 - signatureDims.height - 20,
                        size: textSize,
                        font: thaiFont,
                        color: rgb(0, 0, 1),
                    });
                }
            });
        }

        const modifiedPdfBytes = await pdfDoc.save();
        setWatermarkedPdf(URL.createObjectURL(new Blob([modifiedPdfBytes], { type: "application/pdf" })));
    };

    return (
        <div>
            <Head>
                <title>Digital CMRU</title>
                <meta name="description" content="ระบบลงนามเอกสารออนไลน์ สำนักดิจิทัล มหาวิทยาลัยราชภัฏเชียงใหม่ หน้าลงนาม" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <div className="max-w-7xl mx-auto p-6 bg-gray-100 rounded-lg shadow-md">
                <h2 className="text-3xl font-bold text-center text-gray-900">PDF Watermark (Image & Text)</h2>
                <h4 className="text-xl text-center text-gray-700">ลงนามเอกสาร</h4>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-6">
                    <div className="relative bg-gray border rounded-lg p-4 shadow-lg w-full h-[800px] flex justify-center items-center">
                        {pdfFile ? (
                            <>
                                <Document file={pdfFile} onLoadSuccess={({ numPages }) => setNumPages(numPages)}>
                                    <Page pageNumber={1} width={500} />
                                </Document>
                                <Rnd size={{ width: 200, height: 150 }} position={position} onDragStop={(e, d) => setPosition({ x: d.x, y: d.y })}>
                                    <div className="bg-transparent border-2 border-radian border-blue-500 p-1 cursor-move">
                                        <label className="text-blue-700 p-1">{watermarkTitle}</label>
                                        <div className="text-blue-700 p-1">{watermarkContent}</div>
                                        {signature && <img src={signature} alt="Signature" className="w-full h-auto" />}
                                        <div className="mt-2 text-sm text-blue-700">{userName}<br />{role}<br />{currentDate}</div>
                                    </div>
                                </Rnd>
                            </>
                        ) : (
                            <div className="align-center text-center">
                                <p className="text-gray-500">Upload a PDF to preview</p>
                                <input type="file" accept="application/pdf" onChange={handleFileUpload} ref={fileInputRef} className="hidden" />
                                <Button onClick={() => fileInputRef.current.click()} className="px-6 py-3 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition">
                                    Upload PDF
                                </Button>
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col items-center justify-center gap-4">
                        <Select className="max-w-xs color-back" label="หัวเรื่อ" onChange={(e) => setWatermarkTitle(e.target.value)}>
                            {title.map((title) => (
                                <SelectItem key={title.key} value={title.label}>{title.label}</SelectItem>
                            ))}
                        </Select>
                        <Textarea className="max-w-xs" type="text" value={watermarkContent} onChange={(e) => setWatermarkContent(e.target.value)} label="Description" placeholder="Enter watermark text" />
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

                {pdfSize.width && pdfSize.height && (
                    <div className="mt-6 text-gray-600">
                        <p>PDF Page Size: {pdfSize.width} x {pdfSize.height} px</p>
                    </div>
                )}
            </div>
        </div>
    );
}
