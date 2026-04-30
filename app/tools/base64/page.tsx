"use client";

import React, { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { TOOLS } from "@/lib/tools-config";
import { Copy, Check, RotateCcw, ArrowRightLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function Base64Tool() {
  const tool = TOOLS.find((t) => t.id === "base64")!;
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [copied, setCopied] = useState(false);

  const handleConvert = () => {
    try {
      if (mode === "encode") {
        setOutput(btoa(input));
      } else {
        setOutput(atob(input));
      }
    } catch (err) {
      toast.error(mode === "encode" ? "Could not encode to Base64" : "Invalid Base64 string");
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const clear = () => {
    setInput("");
    setOutput("");
  };

  return (
    <ToolLayout tool={tool}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-500">Input</h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMode(mode === "encode" ? "decode" : "encode")}
                className="h-8 gap-2 bg-zinc-900 border-zinc-800"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                {mode === "encode" ? "Encode" : "Decode"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={clear}
                className="h-8 gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Clear
              </Button>
            </div>
          </div>
          <Textarea
            placeholder={mode === "encode" ? "Paste text to encode..." : "Paste Base64 to decode..."}
            className="min-h-[400px] bg-[#161618] border-zinc-800 focus-visible:ring-primary/20 transition-all font-mono text-sm resize-none"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <Button onClick={handleConvert} className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold group">
            {mode === "encode" ? "Encode to Base64" : "Decode from Base64"}
          </Button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-500">Output</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="h-8 gap-2 bg-zinc-900 border-zinc-800"
              disabled={!output}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
          <div className="min-h-[400px] bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 font-mono text-sm text-zinc-300 break-all overflow-auto">
            {output || <span className="text-zinc-700 italic">Result will appear here...</span>}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
