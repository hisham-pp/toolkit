"use client";

import React, { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { TOOLS } from "@/lib/tools-config";
import { Copy, Check, RotateCcw, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function JWTDecoderTool() {
  const tool = TOOLS.find((t) => t.id === "jwt-decoder")!;
  const [input, setInput] = useState("");
  const [header, setHeader] = useState("");
  const [payload, setPayload] = useState("");
  const [copied, setCopied] = useState(false);

  const handleDecode = () => {
    try {
      const parts = input.split(".");
      if (parts.length !== 3) {
        throw new Error("Invalid JWT format. Must have 3 parts separated by dots.");
      }

      const decodedHeader = JSON.parse(atob(parts[0]));
      const decodedPayload = JSON.parse(atob(parts[1]));

      setHeader(JSON.stringify(decodedHeader, null, 2));
      setPayload(JSON.stringify(decodedPayload, null, 2));
    } catch (err) {
      toast.error("Invalid JWT token");
      setHeader("");
      setPayload("");
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <ToolLayout tool={tool}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-500">Encoded JWT</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setInput(""); setHeader(""); setPayload(""); }}
              className="h-8 gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </Button>
          </div>
          <Textarea
            placeholder="Paste your JWT here..."
            className="min-h-[400px] bg-[#161618] border-zinc-800 focus-visible:ring-primary/20 transition-all font-mono text-xs resize-none"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <Button onClick={handleDecode} className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold">
            Decode JWT
          </Button>
        </div>

        <div className="space-y-4 flex flex-col">
          <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-500">Header</h2>
              <Button size="sm" variant="outline" onClick={() => handleCopy(header)} disabled={!header} className="h-7 text-[10px] bg-zinc-900 border-zinc-800">
                Copy Header
              </Button>
            </div>
            <div className="h-[150px] bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 font-mono text-xs text-zinc-300 overflow-auto whitespace-pre">
              {header || <span className="text-zinc-700 italic">Header will appear here...</span>}
            </div>
          </div>

          <div className="flex-[2] space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-500">Payload</h2>
              <Button size="sm" variant="outline" onClick={() => handleCopy(payload)} disabled={!payload} className="h-7 text-[10px] bg-zinc-900 border-zinc-800">
                Copy Payload
              </Button>
            </div>
            <div className="h-[250px] bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 font-mono text-xs text-green-400 overflow-auto whitespace-pre">
              {payload || <span className="text-zinc-700 italic">Payload will appear here...</span>}
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
