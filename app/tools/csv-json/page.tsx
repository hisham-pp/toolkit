"use client";

import React, { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { TOOLS } from "@/lib/tools-config";
import { Copy, Check, RotateCcw, ArrowLeftRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import Papa from "papaparse";

export default function CsvJsonTool() {
  const tool = TOOLS.find((t) => t.id === "csv-json")!;
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"csv2json" | "json2csv">("csv2json");

  const convert = () => {
    try {
      if (mode === "csv2json") {
        const results = Papa.parse(input, { header: true, skipEmptyLines: true });
        if (results.errors.length > 0) {
          toast.error("Error parsing CSV: " + results.errors[0].message);
          return;
        }
        setOutput(JSON.stringify(results.data, null, 2));
      } else {
        const json = JSON.parse(input);
        const csv = Papa.unparse(json);
        setOutput(csv);
      }
    } catch (err) {
      toast.error("Conversion failed. Please check your input format.");
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    toast.success("Copied to clipboard");
  };

  return (
    <ToolLayout tool={tool}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-500">
              {mode === "csv2json" ? "CSV Input" : "JSON Input"}
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setMode(mode === "csv2json" ? "json2csv" : "csv2json");
                setInput("");
                setOutput("");
              }}
              className="h-8 gap-2 bg-zinc-900 border-zinc-800"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              Switch Mode
            </Button>
          </div>
          <Textarea
            placeholder={mode === "csv2json" ? "Paste CSV data here..." : "Paste JSON array here..."}
            className="min-h-[400px] bg-[#161618] border-zinc-800 focus-visible:ring-primary/20 transition-all font-mono text-xs resize-none"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <Button onClick={convert} className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold">
            Convert to {mode === "csv2json" ? "JSON" : "CSV"}
          </Button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-500">Result</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="h-8 gap-2 bg-zinc-900 border-zinc-800"
              disabled={!output}
            >
              <Copy className="w-3.5 h-3.5" />
              Copy
            </Button>
          </div>
          <div className="min-h-[400px] bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 font-mono text-xs text-zinc-300 overflow-auto whitespace-pre">
            {output || <span className="text-zinc-700 italic">Conversion result will appear here...</span>}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
