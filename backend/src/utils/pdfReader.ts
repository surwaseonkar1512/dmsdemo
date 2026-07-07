import fs from 'fs';
const pdfParse = require('pdf-parse');
import { cleanText } from './textCleaner';

export const extractTextFromPDF = async (filePath: string, enableOcr: boolean = false): Promise<string> => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);

    let rawText = pdfData.text;

    console.log('rawText', rawText)
    // If PDF has no extractable text (scanned image) and OCR is enabled
    if (rawText.trim().length < 50 && enableOcr) {
      console.log(`Running OCR for ${filePath}`);
      // Tesseract reads image formats, but for PDFs it requires conversion to images first.
      // Since tesseract.js alone doesn't natively parse multi-page PDFs easily without external tools like poppler/ghostscript or pdf2pic,
      // For a self-hosted purely Node.js setup, we'll try a basic OCR pass if it's a single image wrapper, 
      // but proper PDF-to-Image might be needed for robust OCR. 
      // Note: As an MVP, we will run Tesseract directly, which may fail if the PDF format is not natively supported by Tesseract without conversion.
      // To keep it strictly within the requested stack, we attempt it:
      try {
        const Tesseract = require('tesseract.js');
        const { data: { text } } = await Tesseract.recognize(filePath, 'eng', {
          logger: (m: any) => console.log(m)
        });
        rawText = text;
      } catch (ocrError: any) {
        console.error(`OCR failed for ${filePath}: ${ocrError.message}`);
        // Fallback to empty text if OCR fails
      }
    }

    return cleanText(rawText);
  } catch (error) {
    console.error(`Error reading PDF ${filePath}:`, error);
    return '';
  }
};
