"use client";

import React, { useState } from "react";
import { Copy, Check, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { format } from "sql-formatter";

export default function SqlFormatterTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const handleFormat = () => {
    try {
      setOutput(format(input, { language: "sql" }));
    } catch (err) {
      toast.error("Failed to format SQL. Please check syntax.");
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    toast.success("Copied to clipboard");
  };

  return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-500">SQL Input</h2>
            <Button variant="ghost" size="sm" onClick={() => { setInput(""); setOutput(""); }} className="h-8">
              <RotateCcw className="w-3.5 h-3.5 mr-2" />
              Reset
            </Button>
          </div>
          <Textarea
            placeholder="SELECT * FROM users WHERE active = 1..."
            className="min-h-[400px] bg-[#161618] border-zinc-800 focus-visible:ring-primary/20 transition-all font-mono text-sm resize-none"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <Button onClick={handleFormat} className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold">
            Beautify SQL
          </Button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-500">Result</h2>
            <Button variant="outline" size="sm" onClick={handleCopy} disabled={!output} className="h-8 gap-2 bg-zinc-900 border-zinc-800">
              <Copy className="w-3.5 h-3.5" />
              Copy
            </Button>
          </div>
          <div className="min-h-[400px] bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 font-mono text-sm text-zinc-300 overflow-auto whitespace-pre">
            {output || <span className="text-zinc-700 italic">Formatted SQL will appear here...</span>}
          </div>
        </div>
      </div>
  );
}
