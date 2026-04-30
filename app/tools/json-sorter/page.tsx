"use client";

import { useState } from "react";
import { 
  ListFilter,
  SortAsc,
  SortDesc,
  Copy,
  Trash2,
  FileJson,
  Code2,
  RefreshCw,
  Braces,
  LayoutGrid
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { M3Textarea } from "@/components/ui/m3-ui";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function JsonSorterPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const sortObject = (obj: any): any => {
    if (Array.isArray(obj)) {
      return obj.map(sortObject).sort((a, b) => {
        if (typeof a === "object" && typeof b === "object") return 0;
        return String(a).localeCompare(String(b));
      });
    } else if (typeof obj === "object" && obj !== null) {
      return Object.keys(obj)
        .sort()
        .reduce((acc: any, key) => {
          acc[key] = sortObject(obj[key]);
          return acc;
        }, {});
    }
    return obj;
  };

  const handleSort = () => {
    try {
      setIsProcessing(true);
      const parsed = JSON.parse(input);
      const sorted = sortObject(parsed);
      setOutput(JSON.stringify(sorted, null, 2));
      setIsProcessing(false);
      toast.success("JSON Keys sorted alphabetically!");
    } catch (e) {
      toast.error("Invalid JSON input");
      setIsProcessing(false);
    }
  };

  const copyToClipboard = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    toast.success("Sorted JSON copied!");
  };

  return (
      <div className="max-w-6xl mx-auto space-y-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           {/* Input */}
           <div className="bg-[#161618] border border-zinc-800 rounded-[2.5rem] p-8 space-y-6 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between px-2">
                 <div className="flex items-center gap-3">
                    <Braces className="w-5 h-5 text-primary" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Unordered JSON</h3>
                 </div>
                 <Button variant="ghost" size="sm" onClick={() => setInput("")} className="text-[10px] uppercase font-bold text-zinc-600">
                   <Trash2 className="w-3 h-3 mr-2" /> Clear
                 </Button>
              </div>
              <M3Textarea 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="min-h-[400px] font-mono text-[11px] placeholder:text-zinc-800"
                placeholder='{"z": 1, "a": 2, "m": {"b": 2, "a": 1}}'
              />
              <Button 
                onClick={handleSort}
                disabled={isProcessing}
                className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest gap-4 shadow-xl shadow-primary/20 transition-all"
              >
                 <SortAsc className={cn("w-5 h-5", isProcessing && "animate-spin")} />
                 Alpha-Sort Keys & Objects
              </Button>
           </div>

           {/* Output */}
           <div className="flex flex-col space-y-6">
              <div className="bg-[#161618] border border-zinc-800 rounded-[2.5rem] p-8 flex-1 space-y-6 shadow-2xl relative flex flex-col group overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                 
                 <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-3">
                       <LayoutGrid className="w-5 h-5 text-green-500" />
                       <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 italic">Organized Output</h3>
                    </div>
                    {output && (
                      <Button variant="ghost" size="sm" onClick={copyToClipboard} className="text-[10px] uppercase font-bold text-primary hover:bg-primary/10">
                        <Copy className="w-3 h-3 mr-2" /> Copy Sorted
                      </Button>
                    )}
                 </div>

                 <div className="flex-1 bg-zinc-950/50 border border-zinc-900 rounded-3xl p-8 overflow-auto min-h-[300px] relative">
                    {output ? (
                      <pre className="text-[11px] font-mono text-zinc-300 leading-relaxed">{output}</pre>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center space-y-6 opacity-10">
                         <ListFilter className="w-20 h-20 text-zinc-500" />
                         <p className="text-[10px] font-black uppercase tracking-widest text-center">Organized data will manifest here</p>
                      </div>
                    )}
                 </div>

                 <div className="bg-zinc-900/30 border border-zinc-800/50 p-5 rounded-3xl space-y-4">
                    <div className="flex items-center gap-3 text-primary font-black uppercase tracking-widest text-[9px]">
                       <Code2 className="w-3 h-3" /> Sorting Logic
                    </div>
                    <p className="text-[11px] text-zinc-500 font-medium leading-relaxed">
                      Deep recursive sorting applies alphabetical ordering to all keys within objects and naturally sorts comparable values within arrays. Perfect for normalizing config files for diffing.
                    </p>
                 </div>
              </div>
           </div>
        </div>
      </div>
  );
}
