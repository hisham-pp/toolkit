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
  const colorRegex = /(oklch|oklab|lab|lch)\([^)]+\)/g;

  // 1. Process all stylesheets
  // html2canvas parses document.styleSheets. We need to clean them.
  const styleSheets = Array.from(clonedDoc.styleSheets);
  styleSheets.forEach((sheet) => {
    try {
      const rules = Array.from(sheet.cssRules);
      for (let i = rules.length - 1; i >= 0; i--) {
        const rule = rules[i];
        if (colorRegex.test(rule.cssText)) {
          try {
            const fixedRule = rule.cssText.replace(colorRegex, (match) => {
              try { return colord(match).toRgbString(); } catch { return "inherit"; }
            });
            sheet.deleteRule(i);
            sheet.insertRule(fixedRule, i);
          } catch (e) {
            // If we can't fix the rule, delete it to prevent the parser from crashing
            sheet.deleteRule(i);
          }
        }
      }
    } catch (e) {
      // Handle cross-origin or other stylesheet access issues
    }
  });

  // 2. Process all style tags
  const styleTags = clonedDoc.querySelectorAll("style");
  styleTags.forEach(tag => {
    if (colorRegex.test(tag.innerHTML)) {
      tag.innerHTML = tag.innerHTML.replace(colorRegex, (match) => {
        try { return colord(match).toRgbString(); } catch { return "inherit"; }
      });
    }
  });

  // 3. Process all elements (inline styles and attributes)
  const allElements = clonedDoc.querySelectorAll("*");
  allElements.forEach((el) => {
    if (!(el instanceof HTMLElement)) return;
    
    // Check style attribute
    const styleAttr = el.getAttribute("style");
    if (styleAttr && colorRegex.test(styleAttr)) {
      const fixedStyle = styleAttr.replace(colorRegex, (match) => {
        try { return colord(match).toRgbString(); } catch { return "inherit"; }
      });
      el.setAttribute("style", fixedStyle);
    }

    // Fix specific SVG attributes
    ["fill", "stroke"].forEach(attr => {
      const val = el.getAttribute(attr);
      if (val && colorRegex.test(val)) {
        try { el.setAttribute(attr, colord(val).toRgbString()); } catch { el.removeAttribute(attr); }
      }
    });
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
