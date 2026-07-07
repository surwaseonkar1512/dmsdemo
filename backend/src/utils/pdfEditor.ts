import fs from 'fs/promises';
import path from 'path';
import { PDFDocument } from 'pdf-lib';

export const addWatermarkToPDF = async (pdfPath: string): Promise<void> => {
  try {
    const existingPdfBytes = await fs.readFile(pdfPath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes, { ignoreEncryption: true });

    const imagePath = path.join(__dirname, '../assets/approved.png');
    const imageBytes = await fs.readFile(imagePath);
    
    // Embed the image, handling the case where a JPG is named .png
    let embeddedImage;
    try {
      embeddedImage = await pdfDoc.embedPng(imageBytes);
    } catch (e) {
      embeddedImage = await pdfDoc.embedJpg(imageBytes);
    }
    
    // Scale image down if necessary (e.g., width 200)
    const pngDims = embeddedImage.scale(0.5);

    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const { width, height } = firstPage.getSize();

    // Draw the image at the top right of the first page
    firstPage.drawImage(embeddedImage, {
      x: width - pngDims.width - 50,
      y: height - pngDims.height - 50,
      width: pngDims.width,
      height: pngDims.height,
      opacity: 0.8,
    });

    const pdfBytes = await pdfDoc.save();
    await fs.writeFile(pdfPath, pdfBytes);
  } catch (error) {
    console.error('Failed to add watermark:', error);
    throw new Error('Failed to watermark document');
  }
};
