"use client";

import { useState } from "react";
import { 
  CopyCheck, 
  Trash2, 
  Search,
  Filter,
  ArrowRight,
  FileJson,
  Trash
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { M3Textarea } from "@/components/ui/m3-ui";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function DuplicateFinderPage() {
  const [input, setInput] = useState("");
  const [uniques, setUniques] = useState<any[]>([]);
  const [duplicates, setDuplicates] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const findDuplicates = () => {
    try {
      setIsProcessing(true);
      const data = JSON.parse(input);
      if (!Array.isArray(data)) {
        toast.error("Input must be a JSON array");
        setIsProcessing(false);
        return;
      }

      const seen = new Set();
      const dups: any[] = [];
      const uniq: any[] = [];

      data.forEach(item => {
        const str = JSON.stringify(item);
        if (seen.has(str)) {
          dups.push(item);
        } else {
          seen.add(str);
          uniq.push(item);
        }
      });

      setUniques(uniq);
      setDuplicates(dups);
      setIsProcessing(false);
      toast.success(`Analysis complete: ${dups.length} duplicates found`);
    } catch (e) {
      toast.error("Invalid JSON input");
      setIsProcessing(false);
    }
  };

  const removeDuplicates = () => {
    if (uniques.length === 0) return;
    navigator.clipboard.writeText(JSON.stringify(uniques, null, 2));
    toast.success("Unique elements copied to clipboard!");
  };

  return (
      <div className="max-w-6xl mx-auto space-y-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           <div className="lg:col-span-12">
              <div className="bg-[#161618] border border-zinc-800 rounded-[2.5rem] p-8 space-y-6 shadow-2xl relative overflow-hidden">
                 <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-3">
                       <FileJson className="w-5 h-5 text-primary" />
                       <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">JSON Array Input</h3>
                    </div>
                    <Button 
                      onClick={() => setInput("")}
                      variant="ghost" 
                      className="text-[10px] uppercase font-bold text-zinc-500"
                    >
                      <Trash2 className="w-3 h-3 mr-2" /> Clear
                    </Button>
                 </div>
                 <M3Textarea 
                   value={input}
                   onChange={(e) => setInput(e.target.value)}
                   placeholder='[{"id":1, "name":"test"}, {"id":1, "name":"test"}]'
                   className="min-h-[220px] font-mono text-sm leading-relaxed"
                 />
                 <Button 
                   onClick={findDuplicates}
                   className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest gap-3 shadow-xl shadow-primary/20"
                 >
                    <Search className="w-5 h-5" /> Analyze Array
                 </Button>
              </div>
           </div>

           <div className="lg:col-span-6 space-y-6">
              <div className="bg-[#161618] border border-zinc-800 rounded-[2.5rem] p-8 space-y-6 shadow-2xl">
                 <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-3">
                       <Filter className="w-4 h-4 text-green-500" />
                       <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 italic">Unique Items ({uniques.length})</h3>
                    </div>
                 </div>
                 <div className="bg-zinc-950 p-6 rounded-3xl border border-zinc-900 min-h-[300px] max-h-[400px] overflow-auto">
                    {uniques.length > 0 ? (
                      <pre className="text-[10px] font-mono text-green-500/80 whitespace-pre">
                        {JSON.stringify(uniques, null, 2)}
                      </pre>
                    ) : (
                      <div className="h-full flex items-center justify-center text-zinc-800 font-black uppercase tracking-widest text-[10px]">
                        Results appear here
                      </div>
                    )}
                 </div>
                 <Button 
                   onClick={removeDuplicates}
                   disabled={uniques.length === 0}
                   className="w-full h-12 rounded-xl bg-zinc-900 border border-zinc-800 text-primary font-black uppercase tracking-widest text-[10px] gap-2 hover:bg-zinc-800"
                 >
                    <CopyCheck className="w-4 h-4" /> Copy Clean Array
                 </Button>
              </div>
           </div>

           <div className="lg:col-span-6 space-y-6">
              <div className="bg-[#161618] border border-zinc-800 rounded-[2.5rem] p-8 space-y-6 shadow-2xl">
                 <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-3">
                       <Trash className="w-4 h-4 text-red-500" />
                       <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 italic">Duplicates Found ({duplicates.length})</h3>
                    </div>
                 </div>
                 <div className="bg-zinc-950 p-6 rounded-3xl border border-zinc-900 min-h-[300px] max-h-[400px] overflow-auto">
                    {duplicates.length > 0 ? (
                      <pre className="text-[10px] font-mono text-red-500/80 whitespace-pre">
                        {JSON.stringify(duplicates, null, 2)}
                      </pre>
                    ) : (
                      <div className="h-full flex items-center justify-center text-zinc-800 font-black uppercase tracking-widest text-[10px]">
                        No duplicates found yet
                      </div>
                    )}
                 </div>
                 <div className="bg-red-500/5 border border-red-500/10 p-4 rounded-2xl flex items-center gap-4">
                    <ArrowRight className="w-4 h-4 text-red-500" />
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                      These items were flagged as exact structural matches.
                    </p>
                 </div>
              </div>
           </div>
        </div>
      </div>
  );
}
