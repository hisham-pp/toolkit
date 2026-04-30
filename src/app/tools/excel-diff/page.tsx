"use client";

import React, { useState } from "react";
import { 
  FileSpreadsheet, 
  Trash2, 
  Upload, 
  Info,
  AlertCircle,
  Table as TableIcon,
  CheckCircle2,
  ArrowRight,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/utility/helpers/utils";

interface DiffResult {
  summary: {
    totalRowsA: number;
    totalRowsB: number;
    diffCount: number;
  };
  diffs: Array<{
    row: number;
    changes: Array<{
      col: string;
      old: any;
      new: any;
    }>;
  }>;
}

export default function ExcelDiff() {
  const [fileA, setFileA] = useState<File | null>(null);
  const [fileB, setFileB] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [diffResult, setDiffResult] = useState<DiffResult | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: "A" | "B") => {
    const file = e.target.files?.[0];
    if (file) {
      if (target === "A") setFileA(file);
      else setFileB(file);
      setDiffResult(null); // Reset results when new files are chosen
    }
  };

  const runDiff = async () => {
    if (!fileA || !fileB) {
      toast.error("Please select both files to compare");
      return;
    }

    setIsProcessing(true);
    const formData = new FormData();
    formData.append("fileA", fileA);
    formData.append("fileB", fileB);

    try {
      const response = await fetch("/api/excel-diff", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to process files");
      }

      const data = await response.json();
      setDiffResult(data);
      toast.success("Comparison complete");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const clear = () => {
    setFileA(null);
    setFileB(null);
    setDiffResult(null);
  };

  return (
      <div className="flex flex-col h-full gap-8">
        {/* Comparison Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {[
             { label: "File A Rows", value: diffResult?.summary.totalRowsA || 0, icon: TableIcon, color: "text-zinc-600" },
             { label: "File B Rows", value: diffResult?.summary.totalRowsB || 0, icon: TableIcon, color: "text-zinc-600" },
             { label: "Unmatched Rows", value: diffResult?.summary.diffCount || 0, icon: AlertCircle, color: diffResult && diffResult.summary.diffCount > 0 ? "text-red-500" : "text-green-500" },
           ].map((stat, i) => (
             <div key={i} className="bg-[#161618] border border-zinc-800 rounded-3xl p-6 flex items-center justify-between shadow-xl">
                <div className="space-y-1">
                   <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{stat.label}</p>
                   <p className={cn("text-2xl font-black italic", stat.color)}>{stat.value}</p>
                </div>
                <stat.icon className={cn("w-8 h-8 opacity-20", stat.color)} />
             </div>
           ))}
        </div>

        {/* File Pickers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           <div className={cn(
             "relative bg-zinc-950 border border-dashed rounded-[2.5rem] p-10 flex flex-col items-center justify-center transition-all group",
             fileA ? "border-primary/50 bg-primary/5" : "border-zinc-800 hover:border-zinc-700"
           )}>
              <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept=".xlsx,.xls,.csv" onChange={(e) => handleFileUpload(e, "A")} />
              <div className="p-4 bg-zinc-900 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                 <FileSpreadsheet className={cn("w-8 h-8", fileA ? "text-primary" : "text-zinc-600")} />
              </div>
              <p className="text-sm font-bold text-white mb-1">{fileA ? fileA.name : "Select Sheet A"}</p>
              <p className="text-[10px] uppercase font-black tracking-widest text-zinc-600">{fileA ? (fileA.size / 1024).toFixed(1) + " KB" : "Upload source workbook"}</p>
           </div>

           <div className={cn(
             "relative bg-zinc-950 border border-dashed rounded-[2.5rem] p-10 flex flex-col items-center justify-center transition-all group",
             fileB ? "border-primary/50 bg-primary/5" : "border-zinc-800 hover:border-zinc-700"
           )}>
              <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept=".xlsx,.xls,.csv" onChange={(e) => handleFileUpload(e, "B")} />
              <div className="p-4 bg-zinc-900 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                 <FileSpreadsheet className={cn("w-8 h-8", fileB ? "text-primary" : "text-zinc-600")} />
              </div>
              <p className="text-sm font-bold text-white mb-1">{fileB ? fileB.name : "Select Sheet B"}</p>
              <p className="text-[10px] uppercase font-black tracking-widest text-zinc-600">{fileB ? (fileB.size / 1024).toFixed(1) + " KB" : "Upload comparison workbook"}</p>
           </div>
        </div>

        {/* Action Controls */}
        <div className="flex justify-center gap-4">
           <Button 
             size="lg" 
             onClick={runDiff} 
             disabled={!fileA || !fileB || isProcessing}
             className="h-14 px-12 bg-primary hover:bg-primary/90 text-white font-black italic uppercase tracking-widest rounded-2xl shadow-2xl shadow-primary/20 disabled:grayscale"
           >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                  Analyzing Workbooks...
                </>
              ) : (
                "Run Comparison Engine"
              )}
           </Button>
           <Button variant="outline" size="lg" onClick={clear} className="h-14 px-8 bg-zinc-900 border-zinc-700 rounded-2xl text-zinc-400 hover:text-red-500 transition-colors">
              <Trash2 className="w-5 h-5" />
           </Button>
        </div>

        {/* Results */}
        <div className="flex-1 bg-[#0F0F10] border border-zinc-800 rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl min-h-[400px]">
           <div className="p-6 border-b border-zinc-900 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 bg-zinc-800 rounded-lg flex items-center justify-center">
                   <Info className="w-4 h-4 text-primary" />
                 </div>
                 <div>
                    <h3 className="text-[11px] font-black uppercase tracking-widest text-zinc-200">Comparison Report</h3>
                    <p className="text-[9px] text-zinc-600 uppercase font-black">Server-side processed • 100% Secure</p>
                 </div>
              </div>
              {diffResult && (
                <div className="px-4 py-1.5 bg-zinc-950 border border-zinc-800 rounded-xl text-[10px] font-mono text-zinc-500">
                  {diffResult.diffs.length} ROW CONFLICTS FOUND
                </div>
              )}
           </div>
           
           <div className="flex-1 overflow-auto p-8 space-y-6">
              {isProcessing ? (
                <div className="h-full flex flex-col items-center justify-center text-zinc-500 gap-6 animate-pulse">
                   <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                   <p className="text-xs uppercase font-black tracking-widest italic">Decrypting and comparing cells...</p>
                </div>
              ) : diffResult ? (
                diffResult.diffs.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-zinc-700 space-y-4">
                     <CheckCircle2 className="w-16 h-16 text-green-500/20" />
                     <p className="text-sm uppercase font-black tracking-widest">Identical data structures confirmed</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {diffResult.diffs.map((diff, i) => (
                      <div key={i} className="group bg-zinc-900/50 border border-zinc-800/50 rounded-2xl overflow-hidden hover:border-primary/20 transition-all">
                        <div className="px-6 py-3 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
                           <span className="text-[10px] font-black text-primary uppercase">Row {diff.row}</span>
                           <span className="text-[9px] text-zinc-600 font-mono italic">{diff.changes.length} change(s)</span>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                           {diff.changes.map((change, j) => (
                             <div key={j} className="space-y-2">
                                <label className="text-[9px] font-black text-zinc-600 uppercase">Column {change.col}</label>
                                <div className="flex items-center gap-2 bg-zinc-950 p-3 rounded-xl border border-zinc-800 group-hover:border-zinc-700 transition-colors">
                                   <div className="flex-1 text-[11px] font-mono text-red-400 line-through truncate opacity-60">{String(change.old)}</div>
                                   <ArrowRight className="w-3 h-3 text-zinc-700 shrink-0" />
                                   <div className="flex-1 text-[11px] font-mono text-green-400 font-bold truncate">{String(change.new)}</div>
                                </div>
                             </div>
                           ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-zinc-800 text-center max-w-sm mx-auto space-y-6">
                   <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center border border-zinc-800 shadow-inner">
                      <TableIcon className="w-10 h-10 opacity-10" />
                   </div>
                   <div className="space-y-2">
                      <p className="text-xs uppercase font-black tracking-widest text-zinc-500">Awaiting Data Load</p>
                      <p className="text-[10px] leading-relaxed text-zinc-700 font-medium">Select two Excel files above to perform a surgical row-by-row and cell-by-cell comparison on our secure analysis engine.</p>
                   </div>
                </div>
              )}
           </div>
        </div>
      </div>
  );
}

