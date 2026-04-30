"use client";

import React, { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { TOOLS } from "@/lib/tools-config";
import { Copy, Check, RotateCcw, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function URLEncoderTool() {
  const tool = TOOLS.find((t) => t.id === "url-encoder")!;
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const handleEncode = () => {
    setOutput(encodeURIComponent(input));
  };

  const handleDecode = () => {
    try {
      setOutput(decodeURIComponent(input));
    } catch (err) {
      toast.error("Invalid URL encoded string");
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolLayout tool={tool}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-500">Input</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setInput(""); setOutput(""); }}
              className="h-8 gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </Button>
          </div>
          <Textarea
            placeholder="Paste URL or content to transform..."
            className="min-h-[400px] bg-[#161618] border-zinc-800 focus-visible:ring-primary/20 transition-all font-mono text-sm resize-none"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <div className="flex gap-4">
            <Button onClick={handleEncode} className="flex-1 h-12 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-white font-bold">
              Encode
            </Button>
            <Button onClick={handleDecode} className="flex-1 h-12 bg-primary hover:bg-primary/90 text-white font-bold">
              Decode
            </Button>
          </div>
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
