import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { colord, extend } from "colord";
import namesPlugin from "colord/plugins/names";
import labPlugin from "colord/plugins/lab";
import lchPlugin from "colord/plugins/lch";

extend([namesPlugin, labPlugin, lchPlugin]);

/**
 * Fixes modern CSS color functions in a cloned document for html2canvas compatibility.
 * We convert oklch, lab, etc., to RGB strings because html2canvas's parser crashes on them.
 */
function fixModernColors(clonedDoc: Document) {
  // 1. Process all elements and their inline/computed styles
  const allElements = clonedDoc.querySelectorAll("*");
  allElements.forEach((el) => {
    if (!(el instanceof HTMLElement)) return;
    
    // We check the most common properties that cause issues
    const colorProps = [
      "color", 
      "backgroundColor", 
      "borderColor", 
      "borderTopColor", 
      "borderBottomColor", 
      "borderLeftColor", 
      "borderRightColor", 
      "fill", 
      "stroke",
      "outlineColor",
      "boxShadow",
      "textShadow"
    ];
    
    // Use getComputedStyle to get the resolved values (which might already be RGB in some browsers,
    // but html2canvas often reads the raw string from somewhere else or gets confused)
    const style = window.getComputedStyle(el);
    
    colorProps.forEach((prop) => {
      const value = (style as any)[prop];
      if (value && (value.includes("oklch") || value.includes("oklab") || value.includes("lab") || value.includes("lch"))) {
        try {
          const converted = colord(value).toRgbString();
          el.style.setProperty(prop.replace(/([A-Z])/g, "-$1").toLowerCase(), converted, "important");
        } catch (e) {
          // If it's a complex value like boxShadow, we might need a more complex regex replacement
          if (prop === "boxShadow" || prop === "textShadow") {
            const fixed = value.replace(/(oklch|oklab|lab|lch)\([^)]+\)/g, (match: string) => {
              try { return colord(match).toRgbString(); } catch { return "transparent"; }
            });
            el.style.setProperty(prop.replace(/([A-Z])/g, "-$1").toLowerCase(), fixed, "important");
          }
        }
      }
    });
  });

  // 2. Process all style tags to replace problematic functions in raw CSS
  // This is a safety net because html2canvas sometimes parses style tags directly
  const styleTags = clonedDoc.querySelectorAll("style");
  styleTags.forEach(tag => {
    try {
      let css = tag.innerHTML;
      if (css.includes("oklch") || css.includes("oklab") || css.includes("lab") || css.includes("lch")) {
        const fixedCss = css.replace(/(oklch|oklab|lab|lch)\([^)]+\)/g, (match) => {
          try {
            return colord(match).toRgbString();
          } catch (e) {
            return "inherit"; 
          }
        });
        tag.innerHTML = fixedCss;
      }
    } catch (e) {
      console.warn("Could not fix style tag:", e);
    }
  });
}

export async function generatePdfFromHtml(htmlElement: HTMLElement, fileName: string) {
  // A4 dimensions in pt
  const pdfWidth = 595.28;
  const pdfHeight = 841.89;
  const margin = 40;

  const pdf = new jsPDF("p", "pt", "a4");

  // We use pdf.html() which handles paging much better than manual canvas slicing.
  // It uses html2canvas internally.
  await pdf.html(htmlElement, {
    callback: (pdf) => {
      pdf.save(`${fileName}.pdf`);
    },
    x: margin,
    y: margin,
    width: pdfWidth - (margin * 2), // Target width in PDF
    windowWidth: 1000, // Virtual window width for rendering (helps with responsiveness)
    autoPaging: "text",
    html2canvas: {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      onclone: (clonedDoc) => {
        fixModernColors(clonedDoc);
      }
    }
  });
}

export function generatePdfFromText(text: string, fileName: string) {
  const pdf = new jsPDF();
  const splitText = pdf.splitTextToSize(text, 180);
  pdf.text(splitText, 10, 10);
  pdf.save(`${fileName}.pdf`);
}
