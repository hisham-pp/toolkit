"use client";

import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import { TOOLS } from "@/lib/tools-config";
import { 
  Minimize2, 
  Maximize2,
  Copy, 
  Trash2, 
  ArrowRightLeft,
  Settings2,
  FileJson,
  Code2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { M3Textarea } from "@/components/ui/m3-ui";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function JsonFlattenerPage() {
  const tool = TOOLS.find(t => t.id === "json-flattener")!;
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [delimiter, setDelimiter] = useState(".");

  const flatten = (obj: any, prefix = "", res: any = {}) => {
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const propName = prefix ? `${prefix}${delimiter}${key}` : key;
        if (typeof obj[key] === "object" && obj[key] !== null && !Array.isArray(obj[key])) {
          flatten(obj[key], propName, res);
        } else {
          res[propName] = obj[key];
        }
      }
    }
    return res;
  };

  const unflatten = (data: any) => {
    const result: any = {};
    for (const i in data) {
      if (Object.prototype.hasOwnProperty.call(data, i)) {
        const keys = i.split(delimiter);
        keys.reduce((acc, key, idx) => {
          if (idx === keys.length - 1) {
            acc[key] = data[i];
          } else {
            acc[key] = acc[key] || {};
          }
          return acc[key];
        }, result);
      }
    }
    return result;
  };

  const handleFlatten = () => {
    try {
      const parsed = JSON.parse(input);
      const flattened = flatten(parsed);
      setOutput(JSON.stringify(flattened, null, 2));
      toast.success("JSON Flattened successfully!");
    } catch (e) {
      toast.error("Invalid JSON input");
    }
  };

  const handleUnflatten = () => {
    try {
      const parsed = JSON.parse(input);
      const unflattened = unflatten(parsed);
      setOutput(JSON.stringify(unflattened, null, 2));
      toast.success("JSON Unflattened successfully!");
    } catch (e) {
      toast.error("Invalid JSON input");
    }
  };

  const copyToClipboard = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    toast.success("Output copied!");
  };

  const clearInput = () => {
    setInput("");
    setOutput("");
  };

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-6xl mx-auto space-y-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-4">
            <div className="bg-[#161618] border border-zinc-800 rounded-[2.5rem] p-8 space-y-6 shadow-2xl relative overflow-hidden">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                      <FileJson className="w-4 h-4 text-primary" />
                    </div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Input JSON</h3>
                  </div>
                  <Button variant="ghost" size="sm" onClick={clearInput} className="text-[10px] uppercase font-bold text-zinc-500 hover:text-red-500">
                    <Trash2 className="w-3 h-3 mr-2" /> Clear
                  </Button>
               </div>
               <M3Textarea 
                 value={input}
                 onChange={(e) => setInput(e.target.value)}
                 placeholder='{"user": {"name": "John", "address": {"city": "New York"}}}'
                 className="min-h-[400px] font-mono text-xs leading-relaxed"
               />
            </div>
          </div>

          {/* Controls & Output */}
          <div className="space-y-6">
             <div className="bg-zinc-950 border border-zinc-800/50 p-6 rounded-[2rem] flex flex-wrap gap-4 items-center justify-between">
                <div className="flex items-center gap-4">
                   <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-zinc-600 ml-1">Delimiter</label>
                      <input 
                        type="text" 
                        value={delimiter} 
                        onChange={(e) => setDelimiter(e.target.value)}
                        className="bg-zinc-900 border border-zinc-800 w-12 h-10 rounded-xl text-center font-mono text-primary outline-none focus:border-primary/50"
                      />
                   </div>
                </div>
                <div className="flex gap-2">
                   <Button onClick={handleFlatten} className="rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-[11px] h-12 px-6 gap-2">
                      <Minimize2 className="w-4 h-4" /> Flatten
                   </Button>
                   <Button onClick={handleUnflatten} variant="outline" className="rounded-2xl border-zinc-800 text-zinc-400 hover:text-white font-black uppercase tracking-widest text-[11px] h-12 px-6 gap-2">
                      <Maximize2 className="w-4 h-4" /> Unflatten
                   </Button>
                </div>
             </div>

             <div className="bg-[#161618] border border-zinc-800 rounded-[2.5rem] p-8 space-y-6 shadow-2xl relative overflow-hidden flex-1 flex flex-col">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-green-500/10 flex items-center justify-center">
                      <Code2 className="w-4 h-4 text-green-500" />
                    </div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Result</h3>
                  </div>
                  {output && (
                    <Button variant="ghost" size="sm" onClick={copyToClipboard} className="text-[10px] uppercase font-bold text-primary hover:bg-primary/10">
                      <Copy className="w-3 h-3 mr-2" /> Copy
                    </Button>
                  )}
                </div>
                <div className="flex-1 bg-zinc-950/50 border border-zinc-900/50 rounded-3xl p-6 relative overflow-auto min-h-[340px]">
                   {output ? (
                     <pre className="text-[11px] font-mono text-zinc-300 whitespace-pre-wrap">{output}</pre>
                   ) : (
                     <div className="h-full flex flex-col items-center justify-center opacity-20 space-y-4">
                        <Minimize2 className="w-12 h-12 text-zinc-700" />
                        <p className="text-[10px] font-bold uppercase tracking-widest">Awaiting operation...</p>
                     </div>
                   )}
                </div>
             </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
