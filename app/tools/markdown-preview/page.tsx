"use client";

import React, { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { TOOLS } from "@/lib/tools-config";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { 
  FileText, 
  Trash2, 
  Copy, 
  Eye, 
  Code2, 
  LayoutGrid,
  FileEdit,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const DEFAULT_MARKDOWN = `# Markdown Preview

Discover the power of our real-time **Markdown Editor**. 

## Features
- **GFM Support** (GitHub Flavored Markdown)
- Strikethrough ~~example~~
- [Links](https://google.com)
- Tables

| Syntax | Description |
| :--- | :--- |
| Header | Title |
| Paragraph | Text |

> "Simplicity is the soul of efficiency."

### Code Block
\`\`\`javascript
function hello() {
  console.log("Hello Developer OS!");
}
\`\`\`

- [x] Item completed
- [ ] Item pending
`;

export default function MarkdownPreview() {
  const tool = TOOLS.find((t) => t.id === "markdown-preview")!;
  const [content, setContent] = useState(DEFAULT_MARKDOWN);
  const [view, setView] = useState<"split" | "editor" | "preview">("split");

  const copy = () => {
    navigator.clipboard.writeText(content);
    toast.success("Markdown copied");
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
        <div className="flex items-center justify-between bg-[#161618] p-3 border border-zinc-800 rounded-2xl shadow-lg">
           <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-900">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setView("split")}
                className={cn("h-8 text-[10px] uppercase font-bold gap-2 px-4 rounded-lg", view === "split" && "bg-zinc-800 text-primary")}
              >
                 <LayoutGrid className="w-3.5 h-3.5" /> Split
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setView("editor")}
                className={cn("h-8 text-[10px] uppercase font-bold gap-2 px-4 rounded-lg", view === "editor" && "bg-zinc-800 text-primary")}
              >
                 <FileEdit className="w-3.5 h-3.5" /> Editor
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setView("preview")}
                className={cn("h-8 text-[10px] uppercase font-bold gap-2 px-4 rounded-lg", view === "preview" && "bg-zinc-800 text-primary")}
              >
                 <Eye className="w-3.5 h-3.5" /> Preview
              </Button>
           </div>

           <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={clear} className="h-9 px-3 text-zinc-500 hover:text-red-400">
                <Trash2 className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={download} className="h-9 px-4 bg-zinc-900 border-zinc-800 text-xs font-bold gap-2 rounded-xl">
                 <Download className="w-3.5 h-3.5" /> Download
              </Button>
              <Button onClick={copy} className="h-9 px-6 bg-primary hover:bg-primary/90 text-white font-bold gap-2 rounded-xl text-xs">
                 <Copy className="w-3.5 h-3.5" /> Copy
              </Button>
           </div>
        </div>

        {/* Workspace */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-6 min-h-0">
           {/* Editor Side */}
           {(view === "split" || view === "editor") && (
             <div className={cn(
               "flex flex-col gap-3 group transition-all duration-500",
               view === "split" ? "md:col-span-6" : "md:col-span-12"
             )}>
                <div className="flex items-center gap-2 px-2">
                   <Code2 className="w-3.5 h-3.5 text-zinc-600" />
                   <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Markdown Source</span>
                </div>
                <div className="flex-1 bg-zinc-950 border border-zinc-800 rounded-[2.5rem] overflow-hidden focus-within:border-primary/30 transition-colors shadow-inner">
                   <Textarea 
                     className="w-full h-full bg-transparent border-none font-mono text-xs p-8 resize-none leading-relaxed focus-visible:ring-0"
                     value={content}
                     onChange={(e) => setContent(e.target.value)}
                     placeholder="# Start writing..."
                   />
                </div>
             </div>
           )}

           {/* Preview Side */}
           {(view === "split" || view === "preview") && (
             <div className={cn(
               "flex flex-col gap-3 group transition-all duration-500",
               view === "split" ? "md:col-span-6" : "md:col-span-12"
             )}>
                <div className="flex items-center gap-2 px-2">
                   <Eye className="w-3.5 h-3.5 text-zinc-600" />
                   <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Visual Output</span>
                </div>
                <div className="flex-1 bg-[#0F0F10] border border-zinc-800 rounded-[2.5rem] overflow-auto shadow-2xl p-8 prose prose-invert prose-zinc max-w-none">
                   <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {content || "*No content to preview*"}
                   </ReactMarkdown>
                </div>
             </div>
           )}
        </div>
      </div>
    </ToolLayout>
  );
}
