import { PDFDocument, rgb } from "pdf-lib";

export const savePdfWithWatermarkAndSignature = async (pdfFile, watermarkText, signature, position, sigPosition, userName, currentDate) => {
  if (!pdfFile) return null;

  const pdfDoc = await PDFDocument.load(pdfFile);
  const pages = pdfDoc.getPages();

  if (signature) {
    const signatureImage = await pdfDoc.embedPng(signature);
    const signatureDims = signatureImage.scale(0.3);

    pages.forEach((page) => {
      const { width, height } = page.getSize();

      // Add watermark text before signature image
      page.drawText(watermarkText, {
        x: position.x,
        y: height - position.y,
        size: 12,
        color: rgb(0, 0, 1),
      });

      // Add signature image
      page.drawImage(signatureImage, {
        x: sigPosition.x,
        y: height - sigPosition.y,
        width: signatureDims.width,
        height: signatureDims.height,
      });

      // Add username and date below the signature
      page.drawText(`${userName}\n${currentDate}`, {
        x: sigPosition.x,
        y: height - sigPosition.y - 40,
        size: 12,
        color: rgb(0, 0, 1),
      });
    });
  }

  const modifiedPdfBytes = await pdfDoc.save();
  return URL.createObjectURL(new Blob([modifiedPdfBytes], { type: "application/pdf" }));
};