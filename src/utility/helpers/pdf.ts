import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { colord, extend } from "colord";
import namesPlugin from "colord/plugins/names";

extend([namesPlugin]);

/**
 * Fixes modern CSS color functions in a cloned document for html2canvas compatibility.
 * Instead of stripping, we convert them to RGB.
 */
function fixModernColors(clonedDoc: Document) {
  const allElements = clonedDoc.querySelectorAll("*");
  allElements.forEach((el) => {
    if (!(el instanceof HTMLElement)) return;
    const style = window.getComputedStyle(el);
    
    // Properties that often use colors
    const colorProps = ["color", "backgroundColor", "borderColor", "borderTopColor", "borderBottomColor", "borderLeftColor", "borderRightColor", "fill", "stroke"];
    
    colorProps.forEach((prop) => {
      const value = (style as any)[prop];
      if (value && (value.includes("oklch") || value.includes("oklab") || value.includes("lab"))) {
        try {
          // colord can often handle these if the browser supports them in computed style
          // or we can try to parse them. If the browser already converted them to rgb
          // in getComputedStyle, we are good.
          const converted = colord(value).toRgbString();
          el.style.setProperty(prop, converted, "important");
        } catch (e) {
          // Fallback to black or inherit if conversion fails
          el.style.setProperty(prop, "inherit", "important");
        }
      }
    });
  });
}

export async function generatePdfFromHtml(htmlElement: HTMLElement, fileName: string) {
  const canvas = await html2canvas(htmlElement, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: "#ffffff",
    onclone: (clonedDoc) => {
      fixModernColors(clonedDoc);
    }
  });
  
  const imgData = canvas.toDataURL("image/png");
  
  // A4 dimensions in px at 72 DPI (approximate)
  const pdfWidth = 595.28;
  const pdfHeight = 841.89;
  
  // Calculate scaling to fit width with margins (40px on each side)
  const margin = 40;
  const contentWidth = pdfWidth - (margin * 2);
  const ratio = contentWidth / canvas.width;
  const imgHeight = canvas.height * ratio;
  
  const pdf = new jsPDF("p", "pt", "a4");
  
  let heightLeft = imgHeight;
  let position = margin; // Start with top margin

  pdf.addImage(imgData, "PNG", margin, position, contentWidth, imgHeight);
  heightLeft -= (pdfHeight - margin * 2);

  // Add extra pages if needed
  while (heightLeft > 0) {
    position = heightLeft - imgHeight + margin;
    pdf.addPage();
    pdf.addImage(imgData, "PNG", margin, position, contentWidth, imgHeight);
    heightLeft -= (pdfHeight - margin * 2);
  }
  
  pdf.save(`${fileName}.pdf`);
}

export function generatePdfFromText(text: string, fileName: string) {
  const pdf = new jsPDF();
  const splitText = pdf.splitTextToSize(text, 180);
  pdf.text(splitText, 10, 10);
  pdf.save(`${fileName}.pdf`);
}
