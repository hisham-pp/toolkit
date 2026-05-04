import { NextRequest, NextResponse } from "next/server";
import { chromium } from "playwright-core";
import chromiumMin from "@sparticuz/chromium-min";

export async function POST(req: NextRequest) {
  try {
    const { html, fileName = "document" } = await req.json();

    if (!html) {
      return NextResponse.json({ error: "HTML content is required" }, { status: 400 });
    }

    // Determine if we are running in a serverless environment (e.g. Vercel)
    const isServerless = process.env.VERCEL === "1" || process.env.NODE_ENV === "production";
    
    let browser;
    if (isServerless) {
      browser = await chromium.launch({
        args: chromiumMin.args,
        executablePath: await chromiumMin.executablePath(),
        headless: true,
      });
    } else {
      // Local development fallback
      browser = await chromium.launch({ headless: true });
    }

    const page = await browser.newPage();
    
    // Set content and wait for it to be loaded
    await page.setContent(html, { waitUntil: "networkidle" });
    
    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: "A4",
      margin: {
        top: "40px",
        right: "40px",
        bottom: "40px",
        left: "40px",
      },
      printBackground: true,
    });

    await browser.close();

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error("PDF Generation Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
