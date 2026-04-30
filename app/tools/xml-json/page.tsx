"use client";

import React, { useState } from "react";
import { XMLParser, XMLBuilder } from "fast-xml-parser";
import { 
  ArrowLeftRight, 
  Trash2, 
  Copy, 
  FileCode, 
  FileJson,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function XmlJsonConverter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [direction, setDirection] = useState<"xml-to-json" | "json-to-xml">("xml-to-json");
  const [error, setError] = useState<string | null>(null);
  const [isAutoDetected, setIsAutoDetected] = useState(false);

  const detectAndSetInput = (val: string) => {
    setInput(val);
    if (!val.trim()) {
      setIsAutoDetected(false);
      return;
    }

    const trimmed = val.trim();
    if (trimmed.startsWith("<")) {
      setDirection("xml-to-json");
      setIsAutoDetected(true);
    } else if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      setDirection("json-to-xml");
      setIsAutoDetected(true);
    } else {
      setIsAutoDetected(false);
    }
  };

  const convert = () => {
    if (!input.trim()) return;

    try {
      if (direction === "xml-to-json") {
        const parser = new XMLParser({
          ignoreAttributes: false,
          attributeNamePrefix: "@_"
        });
        const jsonObj = parser.parse(input);
        setOutput(JSON.stringify(jsonObj, null, 2));
      } else {
        const jsonObj = JSON.parse(input);
        const builder = new XMLBuilder({
          format: true,
          ignoreAttributes: false,
          attributeNamePrefix: "@_"
        });
        const xmlContent = builder.build(jsonObj);
        setOutput(xmlContent);
      }
      setError(null);
    } catch (e: any) {
      setError(e.message);
      toast.error("Conversion failed");
    }
  };

  const swap = () => {
    setDirection(direction === "xml-to-json" ? "json-to-xml" : "xml-to-json");
    setInput(output);
    setOutput("");
    setError(null);
  };

  const copy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    toast.success("Copied to clipboard");
  };

  const clear = () => {
    setInput("");
    setOutput("");
    setError(null);
  };

  return (
      <div className="flex flex-col h-full gap-8">
        {/* Swapper View */}
        <div className="flex items-center justify-between bg-[#161618] p-4 border border-zinc-800 rounded-2xl">
          <div className="flex items-center gap-8">
            <div className={cn(
              "flex items-center gap-3 px-4 py-2 rounded-xl transition-all relative",
              direction === "xml-to-json" ? "bg-primary/10 border border-primary/20 text-primary" : "bg-zinc-900 border border-zinc-800 text-zinc-500"
            )}>
               <FileCode className="w-4 h-4" />
               <span className="text-[10px] font-bold uppercase tracking-widest">XML</span>
               {isAutoDetected && direction === "xml-to-json" && (
                 <div className="absolute -top-2 -right-2 bg-primary text-black text-[8px] font-black px-1 rounded animate-bounce">AUTO</div>
               )}
            </div>
            
            <Button variant="ghost" onClick={swap} className="hover:bg-zinc-800 rounded-full h-10 w-10 p-0 text-zinc-500">
               <ArrowLeftRight className="w-5 h-5" />
            </Button>
            <div className={cn(
              "flex items-center gap-3 px-4 py-2 rounded-xl transition-all relative",
              direction === "json-to-xml" ? "bg-primary/10 border border-primary/20 text-primary" : "bg-zinc-900 border border-zinc-800 text-zinc-500"
            )}>
               <FileJson className="w-4 h-4" />
               <span className="text-[10px] font-bold uppercase tracking-widest">JSON</span>
               {isAutoDetected && direction === "json-to-xml" && (
                 <div className="absolute -top-2 -right-2 bg-primary text-black text-[8px] font-black px-1 rounded animate-bounce">AUTO</div>
               )}
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={convert} disabled={!input} className="bg-primary hover:bg-primary/90 text-white text-xs font-bold px-6">
              Convert
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
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Source Input</span>
                {error && <span className="text-[10px] text-red-500 flex items-center gap-1 animate-pulse"><AlertCircle className="w-3 h-3" /> {error}</span>}
             </div>
             <div className="flex-1 relative">
                <Textarea
                  className="w-full h-full bg-zinc-950 border-zinc-800 font-mono text-[11px] p-6 resize-none focus:border-primary/50 transition-all rounded-3xl"
                  placeholder={direction === "xml-to-json" ? "<root><item>Value</item></root>" : '{ "root": { "item": "Value" } }'}
                  value={input}
                  onChange={(e) => detectAndSetInput(e.target.value)}
                />
             </div>
          </div>

          <div className="flex flex-col gap-3 group">
             <div className="flex items-center justify-between px-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Converted Results</span>
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

        {/* Footer info */}
        <div className="p-4 bg-zinc-900/40 border border-zinc-800/50 rounded-2xl flex items-center gap-4">
           <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500">
              <AlertCircle className="w-4 h-4" />
           </div>
           <p className="text-[10px] text-zinc-500 leading-relaxed font-medium">
             This tool supports standard attribute mapping. Attributes are prefixed with <code className="text-primary bg-primary/10 px-1 rounded">@_</code> during JSON conversion. Large files are processed entirely in-browser.
           </p>
        </div>
      </div>
  );
}
