"use client";

import React, { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { 
  Trash2, 
  FileDown, 
  FileText,
  AlertCircle,
  Eye,
  Type
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { M3Textarea } from "@/components/ui/m3-ui";
import { toast } from "sonner";
import { generatePdfFromHtml } from "@/utility/helpers/pdf";
import { cn } from "@/utility/helpers/utils";

export default function MarkdownToPdf() {
  const [content, setContent] = useState("");
  const previewRef = useRef<HTMLDivElement>(null);

  const clear = () => setContent("");

  const downloadPdf = async () => {
    if (!content.trim()) {
      toast.error("Please enter some content first");
      return;
    }

    if (!previewRef.current) return;

    const toastId = toast.loading("Generating PDF...");
    try {
      await generatePdfFromHtml(previewRef.current, "markdown-document");
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
          <FileText className="w-5 h-5 text-primary" />
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Markdown to PDF</span>
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
            <Type className="w-3 h-3 text-zinc-500" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Source Markdown</span>
          </div>
          <div className="flex-1 relative bg-zinc-950 border border-zinc-800 rounded-[2rem] overflow-hidden focus-within:border-primary/40 transition-colors shadow-inner flex flex-col">
            <M3Textarea 
              className="flex-1 bg-transparent border-none font-mono text-sm p-8 resize-none focus-visible:ring-0 text-zinc-300 custom-scrollbar"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="# Enter markdown here..."
            />
          </div>
        </div>

        <div className="flex flex-col gap-4 h-full">
          <div className="flex items-center gap-2 px-2">
            <Eye className="w-3 h-3 text-primary" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary italic">Live Preview</span>
          </div>
          <div className="flex-1 bg-white border border-zinc-800 rounded-[2rem] overflow-auto shadow-2xl custom-scrollbar-light">
            <div 
              ref={previewRef} 
              className={cn(
                "pdf-preview-root min-h-full p-12 bg-white",
                "prose prose-zinc max-w-none"
              )}
            >
              <ReactMarkdown 
                remarkPlugins={[remarkGfm, remarkBreaks]}
                components={{
                  code({ node, inline, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || "");
                    return !inline && match ? (
                      <div className="my-6 rounded-xl overflow-hidden border border-zinc-200">
                        <SyntaxHighlighter
                          style={oneLight}
                          language={match[1]}
                          PreTag="div"
                          customStyle={{
                            margin: 0,
                            padding: "1.5rem",
                            fontSize: "0.85rem",
                            background: "#f8f9fa",
                          }}
                          {...props}
                        >
                          {String(children).replace(/\n$/, "")}
                        </SyntaxHighlighter>
                      </div>
                    ) : (
                      <code className={cn("bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-900 font-bold text-[0.9em]", className)} {...props}>
                        {children}
                      </code>
                    );
                  }
                }}
              >
                {content || "_Preview will appear here..._"}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 bg-zinc-900/40 border border-zinc-800/50 rounded-2xl flex items-center gap-4">
        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500">
          <AlertCircle className="w-4 h-4" />
        </div>
        <p className="text-[10px] text-zinc-500 leading-relaxed font-medium">
          PDF is generated locally in your browser. Styles in the preview (white background) reflect how the document will look in the exported PDF.
        </p>
      </div>

      <style jsx>{`
        .pdf-preview-root {
          color: #18181b !important;
          background-color: #ffffff !important;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        }
        :global(.pdf-preview-root h1) {
          color: #000000 !important;
          font-style: normal !important;
          border-bottom: 2px solid #000 !important;
          padding-bottom: 0.5rem !important;
          margin-bottom: 1.5rem !important;
          font-weight: 800 !important;
        }
        :global(.pdf-preview-root h2) {
          color: #000000 !important;
          border-bottom: 1px solid #e4e4e7 !important;
          margin-top: 2rem !important;
        }
        :global(.pdf-preview-root h3) {
          color: #000000 !important;
          font-weight: 700 !important;
        }
        :global(.pdf-preview-root p) {
          color: #27272a !important;
          line-height: 1.6 !important;
        }
        :global(.pdf-preview-root strong) {
          color: #000000 !important;
          font-weight: 700 !important;
        }
        :global(.pdf-preview-root ul li::marker) {
          color: #18181b !important;
        }
        :global(.pdf-preview-root blockquote) {
          border-left-color: #18181b !important;
          color: #3f3f46 !important;
          background: #f4f4f5 !important;
        }
        :global(.pdf-preview-root table) {
          border-collapse: collapse !important;
          width: 100% !important;
          margin-bottom: 1.5rem !important;
        }
        :global(.pdf-preview-root th) {
          background-color: #f4f4f5 !important;
          color: #000 !important;
          font-weight: 700 !important;
          padding: 8px !important;
          border: 1px solid #e4e4e7 !important;
        }
        :global(.pdf-preview-root td) {
          padding: 8px !important;
          border: 1px solid #e4e4e7 !important;
          color: #27272a !important;
        }
      `}</style>

      <style jsx global>{`
        .custom-scrollbar-light::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar-light::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar-light::-webkit-scrollbar-thumb {
          background: #e4e4e7;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
