import jsPDF from "jspdf";

export async function generatePdfFromHtml(htmlElement: HTMLElement, fileName: string) {
  // We use the server-side API to generate the PDF because client-side
  // libraries like html2canvas fail on modern CSS (oklch, lab, etc.)
  try {
    const response = await fetch("/api/pdf", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <style>
                body {
                  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                  margin: 0;
                  padding: 0;
                  color: #18181b;
                  background: #ffffff;
                }
                .pdf-content {
                  width: 100%;
                }
                /* Professional document styles */
                h1, h2, h3, h4, h5, h6 { color: #000; margin-top: 1.5em; margin-bottom: 0.5em; }
                p { margin-bottom: 1em; line-height: 1.6; }
                code { background: #f4f4f5; padding: 2px 4px; border-radius: 4px; font-family: monospace; }
                pre { background: #f4f4f5; padding: 1em; border-radius: 8px; overflow-x: auto; margin-bottom: 1em; }
                blockquote { border-left: 4px solid #e4e4e7; padding-left: 1em; color: #71717a; font-style: italic; margin-bottom: 1em; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 1em; }
                th, td { border: 1px solid #e4e4e7; padding: 8px; text-align: left; }
                th { background: #f8f8f8; font-weight: bold; }
              </style>
            </head>
            <body>
              <div class="pdf-content">
                ${htmlElement.innerHTML}
              </div>
            </body>
          </html>
        `,
        fileName
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to generate PDF");
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileName}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
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
