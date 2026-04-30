"use client";

import { useState, useMemo } from "react";
import { TOOLS } from "@/lib/tools-config";
import { 
  FileText, 
  Copy,
  Layout,
  ExternalLink,
  Sparkles,
  Info,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { M3Textarea } from "@/components/ui/m3-ui";
import { toast } from "sonner";
import { marked } from "marked";
import { cn } from "@/lib/utils";

export default function MdToGDocsPage() {
  const tool = TOOLS.find(t => t.id === "md-gdocs")!;
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
      toast.success("Copied as Rich Text! Paste into Google Docs.");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err);
      toast.error("Failed to copy as Rich Text. Try a modern browser.");
    }
  };

  return (
    <div className="flex flex-col h-full max-w-6xl mx-auto gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black text-white tracking-tight uppercase italic">{tool.name}</h1>
        <p className="text-zinc-500 font-medium uppercase tracking-widest text-[10px]">{tool.description}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 min-h-0">
        {/* Editor Side */}
        <div className="flex flex-col gap-6">
           <div className="bg-[#161618] border border-zinc-800 rounded-[2.5rem] p-8 shadow-2xl flex-1 flex flex-col gap-6">
              <div className="flex items-center justify-between px-2">
                 <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 flex items-center gap-3">
                    <Layout className="w-3 h-3" /> Markdown Source
                 </h3>
                 <div className="text-[9px] font-black uppercase tracking-widest text-zinc-800">{markdown.length} Characters</div>
              </div>
              
              <M3Textarea 
                placeholder="# Enter your Markdown here...
                
Example:
- Bullet points
- **Bold text**
- [Links](https://google.com)"
                className="flex-1 min-h-[300px] font-mono text-[13px] p-8 resize-none leading-relaxed"
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
              />

              <Button 
                onClick={copyAsRichText}
                disabled={!markdown}
                className={cn(
                  "h-16 rounded-2xl font-black uppercase tracking-[0.2em] gap-4 shadow-2xl transition-all duration-500",
                  copied ? "bg-green-600 text-white" : "bg-primary text-white shadow-primary/20 hover:scale-[1.02]"
                )}
              >
                 {copied ? <Check className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
                 {copied ? "Ready to Paste" : "Copy for Google Docs"}
              </Button>
           </div>
        </div>

        {/* Preview / How-to Side */}
        <div className="flex flex-col gap-6">
           {/* Visual Preview */}
           <div className="bg-zinc-950/40 border border-zinc-900 rounded-[2.5rem] p-10 flex-1 relative group overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                 <FileText className="w-32 h-32 text-primary" />
              </div>

              <div className="relative z-10 space-y-8">
                 <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary italic">Paste Preview</h3>
                 
                 <div className="prose prose-invert prose-zinc max-w-none prose-sm font-sans opacity-60">
                    {markdown ? (
                      <div dangerouslySetInnerHTML={{ __html: html }} />
                    ) : (
                      <div className="flex flex-col items-center justify-center py-20 grayscale opacity-20 gap-4">
                         <div className="w-12 h-1 bg-zinc-800 rounded-full" />
                         <div className="w-24 h-1 bg-zinc-800 rounded-full" />
                         <div className="w-16 h-1 bg-zinc-800 rounded-full" />
                         <p className="text-[9px] font-black uppercase tracking-widest mt-4">Live preview will render here</p>
                      </div>
                    )}
                 </div>
              </div>
           </div>

           {/* Help Card */}
           <div className="bg-[#111113] border border-zinc-900 rounded-[2rem] p-6 space-y-4">
              <div className="flex items-center gap-3 text-primary">
                 <Info className="w-4 h-4" />
                 <span className="text-[10px] font-black uppercase tracking-[0.2em]">How it works</span>
              </div>
              <p className="text-[11px] text-zinc-500 leading-relaxed font-medium">
                Google Docs doesn't natively support Markdown pasting. This tool converts your MD into standard HTML and places it on your clipboard as <b>Rich Text</b>. When you paste into Docs, the formatting (headings, lists, bold) is preserved perfectly.
              </p>
              <div className="pt-2 flex gap-4">
                 <a href="https://docs.google.com" target="_blank" className="text-[9px] font-black uppercase tracking-widest text-zinc-600 hover:text-white flex items-center gap-2 transition-colors">
                    Open Google Docs <ExternalLink className="w-3 h-3" />
                 </a>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
