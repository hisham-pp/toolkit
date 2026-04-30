"use client";

import React, { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { TOOLS } from "@/lib/tools-config";
import { 
  ArrowLeftRight, 
  Trash2, 
  Copy, 
  Link2, 
  Unlink,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function UrlEncoderConverter() {
  const tool = TOOLS.find((t) => t.id === "url-encoder")!;
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [direction, setDirection] = useState<"encode" | "decode">("encode");
  const [isAutoDetected, setIsAutoDetected] = useState(false);

  const detectAndSetInput = (val: string) => {
    setInput(val);
    if (!val.trim()) {
      setIsAutoDetected(false);
      return;
    }

    const trimmed = val.trim();
    // Check if it's likely encoded (contains % followed by 2 hex digits)
    if (/%[0-9A-Fa-f]{2}/.test(trimmed)) {
      setDirection("decode");
      setIsAutoDetected(true);
    } else {
      setDirection("encode");
      setIsAutoDetected(false);
    }
  };

  const convert = () => {
    if (!input.trim()) return;

    try {
      if (direction === "encode") {
        setOutput(encodeURIComponent(input));
      } else {
        setOutput(decodeURIComponent(input));
      }
    } catch (e: any) {
      toast.error("Transformation failed: Invalid input");
    }
  };

  const swap = () => {
    setDirection(direction === "encode" ? "decode" : "encode");
    setInput(output);
    setOutput("");
  };

  const copy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    toast.success("Copied to clipboard");
  };

  const clear = () => {
    setInput("");
    setOutput("");
  };

  return (
    <ToolLayout tool={tool}>
      <div className="flex flex-col h-full gap-8">
        {/* Swapper View */}
        <div className="flex items-center justify-between bg-[#161618] p-4 border border-zinc-800 rounded-2xl">
          <div className="flex items-center gap-8">
            <div className={cn(
              "flex items-center gap-3 px-4 py-2 rounded-xl transition-all relative",
              direction === "encode" ? "bg-primary/10 border border-primary/20 text-primary" : "bg-zinc-900 border border-zinc-800 text-zinc-500"
            )}>
               <Link2 className="w-4 h-4" />
               <span className="text-[10px] font-bold uppercase tracking-widest">Raw Text</span>
               {isAutoDetected && direction === "encode" && (
                 <div className="absolute -top-2 -right-2 bg-primary text-black text-[8px] font-black px-1 rounded animate-bounce">AUTO</div>
               )}
            </div>
            
            <Button variant="ghost" size="sm" onClick={swap} className="hover:bg-zinc-800 rounded-full h-8 w-8 p-0 text-zinc-500">
               <ArrowLeftRight className="w-4 h-4" />
            </Button>

            <div className={cn(
              "flex items-center gap-3 px-4 py-2 rounded-xl transition-all relative",
              direction === "decode" ? "bg-primary/10 border border-primary/20 text-primary" : "bg-zinc-900 border border-zinc-800 text-zinc-500"
            )}>
               <Unlink className="w-4 h-4" />
               <span className="text-[10px] font-bold uppercase tracking-widest">Encoded</span>
               {isAutoDetected && direction === "decode" && (
                 <div className="absolute -top-2 -right-2 bg-primary text-black text-[8px] font-black px-1 rounded animate-bounce">AUTO</div>
               )}
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={convert} disabled={!input} className="bg-primary hover:bg-primary/90 text-white text-xs font-bold px-6">
              {direction === "encode" ? "Encode" : "Decode"}
            </Button>
            <Button variant="outline" size="sm" onClick={clear} className="bg-zinc-900 border-zinc-800 hover:text-red-400">
               <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Workspace */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 min-h-0">
          <div className="flex flex-col gap-3 group">
             <div className="flex items-center justify-between px-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Input Data</span>
             </div>
             <div className="flex-1 relative">
                <Textarea
                  className="w-full h-full bg-zinc-950 border-zinc-800 font-mono text-[11px] p-6 resize-none focus:border-primary/50 transition-all rounded-3xl"
                  placeholder="Paste URL or content to transform..."
                  value={input}
                  onChange={(e) => detectAndSetInput(e.target.value)}
                />
             </div>
          </div>

          <div className="flex flex-col gap-3 group">
             <div className="flex items-center justify-between px-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Output Result</span>
                <Button variant="ghost" size="sm" onClick={copy} className="h-6 px-2 text-[10px] uppercase font-bold text-zinc-500 hover:text-primary">
                   <Copy className="w-3 h-3 mr-1" /> Copy
                </Button>
             </div>
             <div className="flex-1 relative">
                <Textarea
                  readOnly
                  className="w-full h-full bg-[#0F0F10] border-zinc-800 font-mono text-[11px] p-6 resize-none transition-all rounded-3xl text-zinc-300"
                  value={output}
                  placeholder="Output will appear here..."
                />
             </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
