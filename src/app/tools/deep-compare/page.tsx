"use client";

import { useState } from "react";
import { 
  Scaling,
  ArrowRightLeft,
  Trash2,
  FileJson,
  Code2,
  CheckCircle2,
  XCircle,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { M3Textarea } from "@/components/ui/m3-ui";
import { toast } from "sonner";
import { cn } from "@/utility/helpers/utils";

interface DiffResult {
  path: string;
  type: "added" | "removed" | "changed";
  oldValue: any;
  newValue: any;
}

export default function DeepComparePage() {
  const [json1, setJson1] = useState("");
  const [json2, setJson2] = useState("");
  const [diffs, setDiffs] = useState<DiffResult[]>([]);
  const [isCompared, setIsCompared] = useState(false);

  const getDiff = (obj1: any, obj2: any, path = ""): DiffResult[] => {
    let currentDiffs: DiffResult[] = [];
    
    // Combine keys from both objects
    const allKeys = Array.from(new Set([...Object.keys(obj1 || {}), ...Object.keys(obj2 || {})]));

    allKeys.forEach(key => {
      const currentPath = path ? `${path}.${key}` : key;
      const v1 = obj1?.[key];
      const v2 = obj2?.[key];

      if (v1 === undefined) {
        currentDiffs.push({ path: currentPath, type: "added", oldValue: undefined, newValue: v2 });
      } else if (v2 === undefined) {
        currentDiffs.push({ path: currentPath, type: "removed", oldValue: v1, newValue: undefined });
      } else if (typeof v1 === "object" && typeof v2 === "object" && v1 !== null && v2 !== null) {
        currentDiffs = currentDiffs.concat(getDiff(v1, v2, currentPath));
      } else if (v1 !== v2) {
        currentDiffs.push({ path: currentPath, type: "changed", oldValue: v1, newValue: v2 });
      }
    });

    return currentDiffs;
  };

  const handleCompare = () => {
    try {
      const o1 = JSON.parse(json1);
      const o2 = JSON.parse(json2);
      const results = getDiff(o1, o2);
      setDiffs(results);
      setIsCompared(true);
      toast.success(results.length > 0 ? `${results.length} differences found` : "Objects are identical!");
    } catch (e) {
      toast.error("Invalid JSON input in one of the fields");
    }
  };

  return (
      <div className="max-w-6xl mx-auto space-y-8 pb-20">
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-[#161618] border border-zinc-800 rounded-[2.5rem] p-8 space-y-6 shadow-2xl">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <FileJson className="w-4 h-4 text-primary" />
                     <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 italic">Base Object (A)</h3>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setJson1("")} className="text-[10px] uppercase font-bold text-zinc-600">
                    <Trash2 className="w-3 h-3 mr-2" /> Clear
                  </Button>
               </div>
               <M3Textarea 
                 value={json1}
                 onChange={(e) => setJson1(e.target.value)}
                 className="min-h-[260px] font-mono text-xs focus:border-primary/50"
                 placeholder='{"id": 1, "status": "active"}'
               />
            </div>

            <div className="bg-[#161618] border border-zinc-800 rounded-[2.5rem] p-8 space-y-6 shadow-2xl">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <FileJson className="w-4 h-4 text-green-500" />
                     <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 italic">Target Object (B)</h3>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setJson2("")} className="text-[10px] uppercase font-bold text-zinc-600">
                    <Trash2 className="w-3 h-3 mr-2" /> Clear
                  </Button>
               </div>
               <M3Textarea 
                 value={json2}
                 onChange={(e) => setJson2(e.target.value)}
                 className="min-h-[260px] font-mono text-xs focus:border-green-500/50"
                 placeholder='{"id": 1, "status": "pending", "meta": {"ver": 2}}'
               />
            </div>
         </div>

         <div className="flex justify-center">
            <Button 
               onClick={handleCompare}
               className="h-16 px-12 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest gap-4 shadow-xl shadow-primary/20 scale-105 transition-transform"
            >
               <ArrowRightLeft className="w-5 h-5" /> Deep Difference Analysis
            </Button>
         </div>

         {isCompared && (
           <div className="bg-[#161618] border border-zinc-800 rounded-[2.5rem] p-10 space-y-8 shadow-2xl">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <Scaling className="w-5 h-5 text-primary" />
                    <h3 className="text-xl font-black uppercase tracking-tight text-white italic">Comparison Report</h3>
                 </div>
                 {diffs.length === 0 && (
                   <div className="flex items-center gap-2 px-6 py-2 bg-green-500/10 border border-green-500/20 rounded-full text-green-500 text-[10px] font-black uppercase tracking-widest">
                      <CheckCircle2 className="w-4 h-4" /> Perfect Match
                   </div>
                 )}
              </div>

              {diffs.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                   {diffs.map((diff, idx) => (
                     <div key={idx} className="bg-zinc-950/50 border border-zinc-900 rounded-2xl p-6 flex flex-wrap items-center gap-8 group hover:border-zinc-800 transition-colors">
                        <div className={cn(
                          "w-24 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-center",
                          diff.type === "added" ? "bg-green-500/10 text-green-500" :
                          diff.type === "removed" ? "bg-red-500/10 text-red-500" :
                          "bg-amber-500/10 text-amber-500"
                        )}>
                          {diff.type}
                        </div>
                        <div className="flex-1 min-w-[200px]">
                           <span className="text-[10px] font-black text-zinc-600 block uppercase tracking-widest mb-1">Path</span>
                           <code className="text-sm font-mono text-zinc-300 font-bold">{diff.path}</code>
                        </div>
                        <div className="grid grid-cols-2 gap-8 flex-1">
                           <div>
                              <span className="text-[10px] font-black text-zinc-700 block uppercase tracking-widest mb-1">A (Base)</span>
                              <pre className="text-[11px] font-mono text-zinc-500">{JSON.stringify(diff.oldValue)}</pre>
                           </div>
                           <div>
                              <span className="text-[10px] font-black text-zinc-700 block uppercase tracking-widest mb-1">B (Target)</span>
                              <pre className="text-[11px] font-mono text-zinc-200">{JSON.stringify(diff.newValue)}</pre>
                           </div>
                        </div>
                     </div>
                   ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 bg-zinc-900/30 rounded-[2.5rem] border border-zinc-800 border-dashed space-y-6">
                   <Code2 className="w-16 h-16 text-zinc-800 opacity-20" />
                   <div className="text-center">
                      <p className="text-lg font-bold text-zinc-600 tracking-tight">Structures are Deeply Equal</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-800 mt-2">Zero delta detected across all leaf nodes</p>
                   </div>
                </div>
              )}

              <div className="bg-zinc-950 px-8 py-5 border border-zinc-800/50 rounded-3xl flex items-center gap-6">
                 <AlertCircle className="w-5 h-5 text-zinc-600" />
                 <p className="text-[11px] text-zinc-500 font-medium leading-relaxed">
                   Deep comparison performs structural analysis on recursive objects. This tool identifies added, removed, and modified keys across nested structures in real-time.
                 </p>
              </div>
           </div>
         )}
      </div>
  );
}
