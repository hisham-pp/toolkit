import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export async function generatePdfFromHtml(htmlElement: HTMLElement, fileName: string) {
  const canvas = await html2canvas(htmlElement, {
    scale: 2,
    useCORS: true,
    logging: false,
    onclone: (clonedDoc) => {
      // html2canvas fails on modern CSS color functions like oklch or lab.
      // We try to strip these from the cloned document's stylesheets.
      const styleSheets = Array.from(clonedDoc.styleSheets);
      for (const sheet of styleSheets) {
        try {
          const rules = Array.from(sheet.cssRules);
          for (let i = rules.length - 1; i >= 0; i--) {
            const rule = rules[i];
            if (rule.cssText.includes("oklch(") || rule.cssText.includes("lab(") || rule.cssText.includes("oklab(")) {
              sheet.deleteRule(i);
            }
          }
        } catch (e) {
          // Cross-origin stylesheets may throw errors, we ignore them
          console.warn("Could not process stylesheet for PDF generation:", e);
        }
      }
    }
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
