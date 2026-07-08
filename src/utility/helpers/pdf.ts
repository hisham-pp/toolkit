import jsPDF from "jspdf";
import { toCanvas } from "html-to-image";
import { MdTextRender, type RenderOption } from "jspdf-md-renderer";

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

/**
 * Renders a Markdown string directly into a text-based (selectable) PDF using
 * the jspdf-md-renderer library (https://github.com/JeelGajera/jspdf-md-renderer),
 * rather than rasterizing the HTML preview. Supports headings, lists, tables,
 * code blocks, blockquotes, links and images.
 */
export async function generatePdfFromMarkdown(markdown: string, fileName: string) {
  // A4 portrait in millimetres (210 x 297).
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });

  const options: RenderOption = {
    cursor: { x: 12, y: 15 },
    page: {
      format: "a4",
      unit: "mm",
      orientation: "portrait",
      maxContentWidth: 186,
      maxContentHeight: 275,
      lineSpace: 1.6,
      defaultLineHeightFactor: 1.25,
      defaultFontSize: 11,
      defaultTitleFontSize: 20,
      topmargin: 15,
      xpading: 12,
      xmargin: 12,
      indent: 5,
    },
    font: {
      regular: { name: "helvetica", style: "normal" },
      bold: { name: "helvetica", style: "bold" },
      light: { name: "helvetica", style: "normal" },
      italic: { name: "helvetica", style: "italic" },
      boldItalic: { name: "helvetica", style: "bolditalic" },
      code: { name: "courier", style: "normal" },
    },
    footer: {
      showPageNumbers: true,
    },
    // Required by the renderer; we don't need the final cursor position.
    endCursorYHandler: () => {},
  };

  await MdTextRender(doc, markdown, options);
  doc.save(`${fileName}.pdf`);
}

export function generatePdfFromText(text: string, fileName: string) {
  const pdf = new jsPDF();
  const splitText = pdf.splitTextToSize(text, 180);
  pdf.text(splitText, 10, 10);
  pdf.save(`${fileName}.pdf`);
}

export function printElement(element: HTMLElement) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow pop-ups to print");
    return;
  }

  // Copy all styles from the main document
  const styles = Array.from(document.querySelectorAll("style, link[rel='stylesheet']"))
    .map(style => style.outerHTML)
    .join("");

  printWindow.document.write(`
    <html>
      <head>
        <title>Print</title>
        ${styles}
        <style>
          body { 
            background: white !important; 
            color: black !important;
            padding: 2rem !important;
          }
          /* Ensure the printed content takes full width */
          .print-content { width: 100% !important; }
          @page { margin: 1cm; }
        </style>
      </head>
      <body>
        <div class="print-content">
          ${element.innerHTML}
        </div>
        <script>
          // Wait for all images/fonts to load
          window.onload = () => {
            setTimeout(() => {
              window.print();
              window.close();
            }, 500);
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}
