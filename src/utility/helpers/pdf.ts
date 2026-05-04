import jsPDF from "jspdf";
import { toCanvas } from "html-to-image";

export async function generatePdfFromHtml(htmlElement: HTMLElement, fileName: string) {
  try {
    // Temporarily adjust styles to ensure the full content is captured
    const originalHeight = htmlElement.style.height;
    const originalOverflow = htmlElement.style.overflow;
    const originalMaxHeight = htmlElement.style.maxHeight;

    htmlElement.style.height = "auto";
    htmlElement.style.maxHeight = "none";
    htmlElement.style.overflow = "visible";

    // Small delay to ensure all assets/fonts are rendered
    await new Promise(resolve => setTimeout(resolve, 500));

    // 1. Capture the element as one large canvas
    const totalCanvas = await toCanvas(htmlElement, {
      pixelRatio: 2,
      backgroundColor: "#ffffff",
      cacheBust: true,
      style: {
        transform: "scale(1)",
        transformOrigin: "top left",
      }
    });

    // Restore original styles
    htmlElement.style.height = originalHeight;
    htmlElement.style.overflow = originalOverflow;
    htmlElement.style.maxHeight = originalMaxHeight;
...
    // A4 dimensions in pt
    const pdfWidth = 595.28;
    const pdfHeight = 841.89;
    const margin = 40;
    const contentWidth = pdfWidth - (margin * 2);
    const contentHeight = pdfHeight - (margin * 2);

    // Calculate how many pixels on the canvas correspond to one page in the PDF
    const ratio = contentWidth / totalCanvas.width;
    const canvasPageHeight = contentHeight / ratio;

    const pdf = new jsPDF("p", "pt", "a4");

    let currentY = 0;
    let pageNumber = 1;

    while (currentY < totalCanvas.height) {
      if (pageNumber > 1) {
        pdf.addPage();
      }

      const remainingHeight = totalCanvas.height - currentY;
      const currentPageHeight = Math.floor(Math.min(canvasPageHeight, remainingHeight));

      if (currentPageHeight <= 0) break;

      // Create a temporary canvas for the current page
      const pageCanvas = document.createElement("canvas");
      pageCanvas.width = totalCanvas.width;
      pageCanvas.height = currentPageHeight;

      const ctx = pageCanvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(
          totalCanvas,
          0, Math.floor(currentY), totalCanvas.width, currentPageHeight, // Source
          0, 0, totalCanvas.width, currentPageHeight // Destination
        );
      }

      const pageImgData = pageCanvas.toDataURL("image/jpeg", 0.95);
      pdf.addImage(
        pageImgData,
        "JPEG",
        margin,
        margin,
        contentWidth,
        currentPageHeight * ratio
      );

      currentY += currentPageHeight;
      pageNumber++;
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
