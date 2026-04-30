"use client";

import React, { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { TOOLS } from "@/lib/tools-config";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { 
  Trash2, 
  Copy, 
  Eye, 
  Code2, 
  LayoutGrid,
  FileEdit,
  Download,
  FileCode
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { marked } from "marked";

const DEFAULT_MARKDOWN = `# Modern Markdown Previewer

This is a **high-fidelity** markdown previewer. It supports:

## 1. Syntax Highlighting
Professional code blocks with language support:

\`\`\`javascript
async function fetchUser(id) {
  const response = await fetch(\`/api/users/\${id}\`);
  const data = await response.json();
  return {
    success: true,
    user: data
  };
}
\`\`\`

## 2. GFM Features
- [x] Task lists supported
- [ ] Interactive checkboxes
- Tables for data structures:

| Header | Utility | Category |
| :--- | :--- | :--- |
| **react-markdown** | Core | Parsing |
| **prism** | Highlight | Visual |
| **prose** | Typography | Styling |

> "The best way to predict the future is to invent it." — Alan Kay

---
*Created in Developer OS*
`;

export default function MarkdownPreviewClient() {
  const tool = TOOLS.find((t) => t.id === "markdown-preview")!;
  const [content, setContent] = useState(DEFAULT_MARKDOWN);
  const [view, setView] = useState<"split" | "editor" | "preview">("split");

  const copy = () => {
    navigator.clipboard.writeText(content);
    toast.success("Markdown copied");
  };

  const copyHtml = async () => {
    const html = await marked.parse(content);
    navigator.clipboard.writeText(html);
    toast.success("Semantic HTML copied");
  };

  const download = () => {
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "document.md";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clear = () => setContent("");

  return (
    <ToolLayout tool={tool}>
      <div className="flex flex-col h-full gap-6">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row items-center justify-between bg-[#161618] p-3 border border-zinc-800 rounded-3xl shadow-lg gap-4">
           <div className="flex bg-zinc-950 p-1.5 rounded-2xl border border-zinc-900 w-full md:w-auto">
              {[
                { id: "split", icon: LayoutGrid, label: "Split" },
                { id: "editor", icon: FileEdit, label: "Editor" },
                { id: "preview", icon: Eye, label: "Preview" },
              ].map((v) => (
                <Button 
                  key={v.id}
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setView(v.id as any)}
                  className={cn(
                    "flex-1 md:flex-none h-9 text-[10px] uppercase font-black tracking-widest gap-2 px-6 rounded-xl transition-all",
                    view === v.id ? "bg-primary/20 text-primary shadow-lg shadow-primary/5" : "text-zinc-500 hover:bg-zinc-800"
                  )}
                >
                   <v.icon className="w-3.5 h-3.5" />
                   <span className={cn(view !== v.id && "hidden lg:inline")}>{v.label}</span>
                </Button>
              ))}
           </div>

           <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <Button variant="ghost" size="sm" onClick={clear} className="h-10 px-3 text-zinc-600 hover:text-red-500 hover:bg-red-500/5 transition-all">
                <Trash2 className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={copyHtml} className="h-10 px-4 bg-zinc-900 border-zinc-800 text-[10px] font-black uppercase tracking-widest gap-2 rounded-2xl hover:border-primary/30 transition-all text-zinc-400">
                 <FileCode className="w-3.5 h-3.5" /> Copy HTML
              </Button>
              <Button variant="outline" size="sm" onClick={download} className="h-10 px-4 bg-zinc-900 border-zinc-800 text-[10px] font-black uppercase tracking-widest gap-2 rounded-2xl">
                 <Download className="w-3.5 h-3.5" /> Download
              </Button>
              <Button onClick={copy} className="h-10 px-8 bg-primary hover:bg-primary/90 text-white font-black italic uppercase tracking-widest gap-2 rounded-2xl shadow-xl shadow-primary/20 text-[10px]">
                 <Copy className="w-3.5 h-3.5" /> Copy
              </Button>
           </div>
        </div>

        {/* Workspace */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-8 min-h-0 overflow-hidden pb-4">
           {/* Editor Side */}
           {(view === "split" || view === "editor") && (
             <div className={cn(
               "flex flex-col gap-4 group transition-all duration-500 overflow-hidden",
               view === "split" ? "md:col-span-6" : "md:col-span-12"
             )}>
                <div className="flex items-center justify-between px-4">
                   <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-zinc-700" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Editor Engine</span>
                   </div>
                   <div className="text-[9px] font-mono text-zinc-700">{content.length} chars</div>
                </div>
                <div className="flex-1 relative bg-zinc-950 border border-zinc-800 rounded-[2.5rem] overflow-hidden focus-within:border-primary/40 transition-colors shadow-inner flex flex-col">
                   <Textarea 
                     className="flex-1 bg-transparent border-none font-mono text-[13px] p-10 resize-none leading-relaxed focus-visible:ring-0 custom-scrollbar overflow-auto text-zinc-300"
                     value={content}
                     onChange={(e) => setContent(e.target.value)}
                     placeholder="# Start crafting your masterpiece..."
                   />
                </div>
             </div>
           )}

           {/* Preview Side */}
           {(view === "split" || view === "preview") && (
             <div className={cn(
               "flex flex-col gap-4 group transition-all duration-500 overflow-hidden pb-1",
               view === "split" ? "md:col-span-6" : "md:col-span-12"
             )}>
                <div className="flex items-center justify-between px-4">
                   <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary italic">Live Render</span>
                   </div>
                </div>
                <div className="flex-1 bg-[#0F0F10] border border-zinc-800 rounded-[2.5rem] overflow-auto shadow-2xl p-10 prose prose-invert prose-zinc max-w-none custom-scrollbar">
                   <ReactMarkdown 
                     remarkPlugins={[remarkGfm]}
                     components={{
                       code({ node, inline, className, children, ...props }: any) {
                         const match = /language-(\w+)/.exec(className || "");
                         return !inline && match ? (
                           <div className="relative group/code my-6 rounded-2xl overflow-hidden border border-zinc-800">
                             <div className="absolute top-4 right-4 z-10 opacity-0 group-hover/code:opacity-100 transition-opacity">
                                <Button variant="outline" size="sm" onClick={() => {
                                  navigator.clipboard.writeText(String(children).replace(/\n$/, ""));
                                  toast.success("Snippet copied");
                                }} className="h-7 px-3 bg-zinc-900 border-zinc-700 text-[9px] font-bold uppercase rounded-lg">Copy</Button>
                             </div>
                             <SyntaxHighlighter
                               style={vscDarkPlus}
                               language={match[1]}
                               PreTag="div"
                               customStyle={{
                                 margin: 0,
                                 padding: "1.5rem",
                                 fontSize: "0.85rem",
                                 background: "transparent",
                               }}
                               {...props}
                             >
                               {String(children).replace(/\n$/, "")}
                             </SyntaxHighlighter>
                           </div>
                         ) : (
                           <code className={cn("bg-zinc-800 px-1.5 py-0.5 rounded text-primary font-bold text-[0.9em]", className)} {...props}>
                             {children}
                           </code>
                         );
                       },
                       table({ children }: any) {
                         return (
                           <div className="my-8 overflow-hidden border border-zinc-800 rounded-2xl bg-zinc-950/50">
                             <table className="w-full text-sm">{children}</table>
                           </div>
                         );
                       },
                       blockquote({ children }: any) {
                         return (
                           <blockquote className="border-l-4 border-primary bg-primary/5 py-4 px-8 rounded-r-2xl italic text-zinc-400 my-8">
                             {children}
                           </blockquote>
                         );
                       }
                     }}
                   >
                      {content || "*No content to preview*"}
                   </ReactMarkdown>
                </div>
             </div>
           )}
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #27272a;
          border-radius: 10px;
        }
        .prose h1 { margin-top: 0; font-weight: 900; font-style: italic; letter-spacing: -0.05em; color: #fff; }
        .prose h2 { font-weight: 800; border-bottom: 2px solid #27272a; padding-bottom: 0.5rem; margin-top: 3rem; }
        .prose p { color: #a1a1aa; line-height: 1.8; }
        .prose strong { color: #fff; font-weight: 800; }
        .prose a { color: #6366f1; font-weight: 700; text-decoration: none; border-bottom: 2px solid transparent; transition: border 0.2s; }
        .prose a:hover { border-bottom-color: #6366f1; }
        .prose ul, .prose ol { padding-left: 1.5rem; }
        .prose li { margin-bottom: 0.5rem; }
        .prose li::marker { color: #6366f1; font-weight: 900; }
        .prose hr { border-color: #27272a; margin: 4rem 0; }
        
        /* Table Styles */
        .prose thead { background: rgba(99, 102, 241, 0.05); }
        .prose th { color: #6366f1; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; font-size: 0.7rem; padding: 1rem 1.5rem; border-bottom: 2px solid #27272a; }
        .prose td { padding: 1rem 1.5rem; border-bottom: 1px solid #18181b; }
        .prose tr:last-child td { border-bottom: none; }
      `}</style>
    </ToolLayout>
  );
}
