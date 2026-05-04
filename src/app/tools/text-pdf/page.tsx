"use client";

import React, { useState, useRef } from "react";
import { 
  Trash2, 
  FileDown, 
  AlignLeft,
  AlertCircle,
  Eye,
  Type,
  Printer
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { M3Textarea } from "@/components/ui/m3-ui";
import { toast } from "sonner";
import { generatePdfFromText, printElement } from "@/utility/helpers/pdf";

export default function TextToPdf() {
  const [content, setContent] = useState("");
  const previewRef = useRef<HTMLDivElement>(null);

  const clear = () => setContent("");

  const handlePrint = () => {
    if (!content.trim() || !previewRef.current) {
      toast.error("Please enter some text first");
      return;
    }
    printElement(previewRef.current);
  };

  const downloadPdf = () => {
    if (!content.trim()) {
      toast.error("Please enter some text first");
      return;
    }

    const toastId = toast.loading("Generating PDF...");
    try {
      generatePdfFromText(content, "text-document");
      toast.success("PDF generated successfully", { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate PDF", { id: toastId });
    }
  };

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="flex flex-col md:flex-row items-center justify-between bg-[#161618] p-3 border border-zinc-800 rounded-3xl shadow-lg gap-4">
        <div className="flex items-center gap-3 px-4">
          <AlignLeft className="w-5 h-5 text-primary" />
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Text to PDF</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={clear} className="h-10 px-3 text-zinc-600 hover:text-red-500">
            <Trash2 className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint} className="h-10 px-6 bg-zinc-900 border-zinc-800 text-[10px] font-black uppercase tracking-widest gap-2 rounded-2xl hover:border-primary/30 transition-all text-zinc-400">
            <Printer className="w-4 h-4" /> Print
          </Button>
          <Button onClick={downloadPdf} className="h-10 px-8 bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest gap-2 rounded-2xl shadow-xl shadow-primary/20 text-[10px]">
            <FileDown className="w-4 h-4" /> Export PDF
          </Button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 min-h-0">
        <div className="flex flex-col gap-4 h-full">
          <div className="flex items-center gap-2 px-2">
            <Type className="w-3 h-3 text-zinc-500" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Plain Text Source</span>
          </div>
          <div className="flex-1 bg-zinc-950 border border-zinc-800 rounded-[2rem] overflow-hidden focus-within:border-primary/40 transition-colors">
            <M3Textarea 
              className="w-full h-full bg-transparent border-none font-mono text-sm p-8 resize-none focus-visible:ring-0 text-zinc-300"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter your text here..."
            />
          </div>
        </div>

        <div className="flex flex-col gap-4 h-full">
          <div className="flex items-center gap-2 px-2">
            <Eye className="w-3 h-3 text-primary" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary italic">PDF Text Preview</span>
          </div>
          <div className="flex-1 bg-white border border-zinc-800 rounded-[2rem] overflow-auto p-10 shadow-2xl">
             <div ref={previewRef}>
              <pre className="text-black font-sans whitespace-pre-wrap break-words leading-relaxed bg-white">
                {content || <span className="text-zinc-400 italic">Preview will appear here...</span>}
              </pre>
             </div>
          </div>
        </div>
      </div>

      <div className="p-4 bg-zinc-900/40 border border-zinc-800/50 rounded-2xl flex items-center gap-4">
        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500">
          <AlertCircle className="w-4 h-4" />
        </div>
        <p className="text-[10px] text-zinc-500 leading-relaxed font-medium">
          Simple text conversion wraps long lines and preserves your line breaks. For complex formatting, use the Markdown or HTML to PDF tools.
        </p>
      </div>
    </div>
  );
}
