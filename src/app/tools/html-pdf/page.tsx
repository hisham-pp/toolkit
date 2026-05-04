"use client";

import React, { useState, useRef } from "react";
import { 
  Trash2, 
  FileDown, 
  FileCode,
  AlertCircle,
  Eye,
  Code
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { M3Textarea } from "@/components/ui/m3-ui";
import { toast } from "sonner";
import { generatePdfFromHtml } from "@/utility/helpers/pdf";

export default function HtmlToPdf() {
  const [content, setContent] = useState("");
  const previewRef = useRef<HTMLDivElement>(null);

  const clear = () => setContent("");

  const downloadPdf = async () => {
    if (!content.trim()) {
      toast.error("Please enter some HTML first");
      return;
    }

    if (!previewRef.current) return;

    const toastId = toast.loading("Generating PDF...");
    try {
      await generatePdfFromHtml(previewRef.current, "html-document");
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
          <FileCode className="w-5 h-5 text-primary" />
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">HTML to PDF</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={clear} className="h-10 px-3 text-zinc-600 hover:text-red-500">
            <Trash2 className="w-4 h-4" />
          </Button>
          <Button onClick={downloadPdf} className="h-10 px-8 bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest gap-2 rounded-2xl shadow-xl shadow-primary/20 text-[10px]">
            <FileDown className="w-4 h-4" /> Export PDF
          </Button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 min-h-0">
        <div className="flex flex-col gap-4 h-full">
          <div className="flex items-center gap-2 px-2">
            <Code className="w-3 h-3 text-zinc-500" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Source HTML</span>
          </div>
          <div className="flex-1 bg-zinc-950 border border-zinc-800 rounded-[2rem] overflow-hidden focus-within:border-primary/40 transition-colors">
            <M3Textarea 
              className="w-full h-full bg-transparent border-none font-mono text-sm p-8 resize-none focus-visible:ring-0 text-zinc-300"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="<h1>Hello World</h1><p>Enter HTML here...</p>"
            />
          </div>
        </div>

        <div className="flex flex-col gap-4 h-full">
          <div className="flex items-center gap-2 px-2">
            <Eye className="w-3 h-3 text-primary" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary italic">Live Preview</span>
          </div>
          <div className="flex-1 bg-white border border-zinc-800 rounded-[2rem] overflow-auto p-10 shadow-2xl">
            <div 
              ref={previewRef} 
              className="text-black overflow-hidden"
              dangerouslySetInnerHTML={{ __html: content || "<p style='color: #888; font-style: italic;'>Preview will appear here...</p>" }}
            />
          </div>
        </div>
      </div>

      <div className="p-4 bg-zinc-900/40 border border-zinc-800/50 rounded-2xl flex items-center gap-4">
        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500">
          <AlertCircle className="w-4 h-4" />
        </div>
        <p className="text-[10px] text-zinc-500 leading-relaxed font-medium">
          PDF is generated locally in your browser. Ensure your HTML is valid for best results. External assets like images might not load if they don't support CORS.
        </p>
      </div>
    </div>
  );
}
