"use client";

import { useState, useMemo } from "react";
import { Check, ExternalLink, FileText, Info, Layout, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { M3Textarea } from "@/components/ui/m3-ui";
import { toast } from "sonner";
import { marked } from "marked";
import { cn } from "@/utility/helpers/utils";

export default function MdToGDocsPage() {
  const [markdown, setMarkdown] = useState("");
  const [copied, setCopied] = useState(false);

  const html = useMemo(() => {
    try {
      return marked.parse(markdown) as string;
    } catch (e) {
      return "";
    }
  }, [markdown]);

  const copyAsRichText = async () => {
    if (!html) return;
    
    try {
      const blob = new Blob([html], { type: 'text/html' });
      const data = [new ClipboardItem({ 'text/html': blob, 'text/plain': new Blob([markdown], { type: 'text/plain' }) })];
      await navigator.clipboard.write(data);
      
      setCopied(true);
      toast.success("Ready to Paste! Use Ctrl+V in Google Docs.");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err);
      toast.error("Format conversion failed. Browser may be incompatible.");
    }
  };

  return (
    <div className="flex flex-col h-full max-w-6xl mx-auto gap-10 pt-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 flex-1 min-h-0">
        {/* Editor Side */}
        <div className="flex flex-col gap-8">
           <div className="bg-[#161618] border border-zinc-800 rounded-[3rem] p-10 shadow-2xl flex-1 flex flex-col gap-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              
              <div className="flex items-center justify-between px-2">
                 <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-600 flex items-center gap-3">
                    <Layout className="w-4 h-4 text-primary" /> Markdown Source
                 </h3>
                 <div className="text-[9px] font-black uppercase tracking-widest text-zinc-900 bg-zinc-950 px-3 py-1 rounded-full">{markdown.length} Characters</div>
              </div>
              
              <M3Textarea 
                placeholder="# Enter your Markdown here...
                
Example:
- Bullet points
- **Bold text**
- [Links](https://google.com)"
                className="flex-1 min-h-[360px] font-mono text-[13px] p-10 resize-none leading-relaxed bg-[#0c0c0e] border-zinc-900"
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
              />

              <Button 
                onClick={copyAsRichText}
                disabled={!markdown}
                className={cn(
                  "h-20 rounded-[1.5rem] font-black uppercase tracking-[0.3em] gap-5 shadow-2xl transition-all duration-700 text-lg italic",
                  copied ? "bg-green-600 text-white translate-y-1" : "bg-primary text-white shadow-primary/30 hover:scale-[1.02] active:scale-95"
                )}
              >
                 {copied ? <Check className="w-8 h-8" /> : <Sparkles className="w-8 h-8" />}
                 {copied ? "Synthesized & Ready" : "Generate Rich Format"}
              </Button>
           </div>
        </div>

        {/* Preview / How-to Side */}
        <div className="flex flex-col gap-8 pb-10">
           {/* Visual Preview */}
           <div className="bg-zinc-950 border border-zinc-900 rounded-[3rem] p-12 flex-1 relative group overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity">
                 <FileText className="w-48 h-48 text-primary" />
              </div>

              <div className="relative z-10 h-full flex flex-col gap-10">
                 <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-primary italic pb-4 border-b border-zinc-900">Render Engine Preview</h3>
                 
                 <div className="prose prose-invert prose-zinc max-w-none prose-sm font-sans flex-1 overflow-auto custom-scrollbar pr-4">
                    {markdown ? (
                      <div className="opacity-80 leading-relaxed" dangerouslySetInnerHTML={{ __html: html }} />
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center py-20 grayscale opacity-20 gap-6">
                         <div className="flex gap-2">
                            <div className="w-2 h-2 bg-zinc-700 rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-zinc-700 rounded-full animate-bounce delay-100" />
                            <div className="w-2 h-2 bg-zinc-700 rounded-full animate-bounce delay-200" />
                         </div>
                         <p className="text-[10px] font-black uppercase tracking-[0.3em] mt-2">Awaiting Markdown Feed...</p>
                      </div>
                    )}
                 </div>
              </div>
           </div>

           {/* Help Card */}
           <div className="bg-[#111113] border border-zinc-900 rounded-[2.5rem] p-10 space-y-6 shadow-xl">
              <div className="flex items-center gap-4 text-primary">
                 <div className="p-2 bg-primary/10 rounded-xl">
                    <Info className="w-5 h-5 shadow-inner" />
                 </div>
                 <span className="text-[11px] font-black uppercase tracking-[0.3em]">Protocol Details</span>
              </div>
              <p className="text-[11px] text-zinc-500 leading-relaxed font-medium">
                Standard copy-paste between Markdown editors and Google Docs often fails due to MimeType mismatch. This tool synthesizes a <b>Rich Text Protocol (HTML)</b> layer on your clipboard, ensuring Google Docs perceives the structural hierarchy (Headings, Bullets, Styles) as native objects.
              </p>
              <div className="pt-4 flex gap-6">
                 <a href="https://docs.google.com" target="_blank" className="text-[10px] font-black uppercase tracking-widest text-zinc-700 hover:text-white flex items-center gap-2 transition-all hover:gap-3 group">
                    Initialize Docs <ExternalLink className="w-4 h-4 group-hover:text-primary transition-colors" />
                 </a>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
