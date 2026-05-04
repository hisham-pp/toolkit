import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export async function generatePdfFromHtml(htmlElement: HTMLElement, fileName: string) {
  const canvas = await html2canvas(htmlElement, {
    scale: 2,
    useCORS: true,
    logging: false,
  });
  
  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "px",
    format: [canvas.width, canvas.height],
  });
  
  pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
  pdf.save(`${fileName}.pdf`);
}

export function generatePdfFromText(text: string, fileName: string) {
  const pdf = new jsPDF();
  const splitText = pdf.splitTextToSize(text, 180);
  pdf.text(splitText, 10, 10);
  pdf.save(`${fileName}.pdf`);
}
