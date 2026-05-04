import jsPDF from "jspdf";
import { toCanvas } from "html-to-image";

export async function generatePdfFromHtml(htmlElement: HTMLElement, fileName: string) {
  // We use html-to-image because it uses SVG foreignObject, which allows the browser's 
  // native rendering engine to handle modern CSS like oklch, lab, etc., perfectly.
  try {
    const canvas = await toCanvas(htmlElement, {
      pixelRatio: 2,
      backgroundColor: "#ffffff",
      style: {
        transform: "scale(1)",
        transformOrigin: "top left",
      }
    });
    
    const imgData = canvas.toDataURL("image/jpeg", 0.95);
    
    // A4 dimensions in pt
    const pdfWidth = 595.28;
    const pdfHeight = 841.89;
    const margin = 40;
    
    const contentWidth = pdfWidth - (margin * 2);
    const ratio = contentWidth / canvas.width;
    const imgHeight = canvas.height * ratio;
    
    const pdf = new jsPDF("p", "pt", "a4");
    
    let heightLeft = imgHeight;
    let position = margin;

    pdf.addImage(imgData, "JPEG", margin, position, contentWidth, imgHeight);
    heightLeft -= (pdfHeight - margin * 2);

    while (heightLeft > 0) {
      position = heightLeft - imgHeight + margin;
      pdf.addPage();
      pdf.addImage(imgData, "JPEG", margin, position, contentWidth, imgHeight);
      heightLeft -= (pdfHeight - margin * 2);
    }
    
    pdf.save(`${fileName}.pdf`);
  } catch (error) {
    console.error("PDF Generation Error:", error);
    throw error;
  }
}

export function generatePdfFromText(text: string, fileName: string) {
  const pdf = new jsPDF();
  const splitText = pdf.splitTextToSize(text, 180);
  pdf.text(splitText, 10, 10);
  pdf.save(`${fileName}.pdf`);
}
