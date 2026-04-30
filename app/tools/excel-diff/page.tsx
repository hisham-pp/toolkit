"use client";

import React, { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { TOOLS } from "@/lib/tools-config";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { 
  FileSpreadsheet, 
  Trash2, 
  Upload, 
  Info,
  AlertCircle,
  Table as TableIcon,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export default function ExcelDiff() {
  const tool = TOOLS.find((t) => t.id === "excel-diff")!;
  const [oldData, setOldData] = useState("id,name,role\n1,Alice,Dev\n2,Bob,Manager");
  const [newData, setNewData] = useState("id,name,role\n1,Alice,Senior Dev\n2,Charlie,Lead\n3,Dave,Intern");

  const diffResult = useMemo(() => {
    const oldParsed = Papa.parse(oldData, { header: true }).data as any[];
    const newParsed = Papa.parse(newData, { header: true }).data as any[];

    const oldRows = oldParsed.filter(r => Object.values(r).some(v => !!v));
    const newRows = newParsed.filter(r => Object.values(r).some(v => !!v));

    const added = newRows.filter(nr => !oldRows.some(or => JSON.stringify(or) === JSON.stringify(nr)));
    const removed = oldRows.filter(or => !newRows.some(nr => JSON.stringify(or) === JSON.stringify(nr)));

    return { added, removed, totalOld: oldRows.length, totalNew: newRows.length };
  }, [oldData, newData]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: "old" | "new") => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const data = event.target?.result;
        if (file.name.endsWith(".csv")) {
          const text = data as string;
          if (target === "old") setOldData(text);
          else setNewData(text);
        } else {
          try {
            const workbook = XLSX.read(data, { type: "binary" });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const csv = XLSX.utils.sheet_to_csv(worksheet);
            if (target === "old") setOldData(csv);
            else setNewData(csv);
          } catch (error) {
            console.error("Excel load error", error);
          }
        }
      };
      if (file.name.endsWith(".csv")) {
        reader.readAsText(file);
      } else {
        reader.readAsBinaryString(file);
      }
    }
  };

  return (
    <ToolLayout tool={tool}>
      <div className="flex flex-col h-full gap-6">
        {/* Comparison Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
           {[
             { label: "Original Rows", value: diffResult.totalOld, icon: TableIcon, color: "text-zinc-400" },
             { label: "New Rows", value: diffResult.totalNew, icon: TableIcon, color: "text-zinc-400" },
             { label: "New Additions", value: diffResult.added.length, icon: CheckCircle2, color: "text-green-500" },
             { label: "Removed/Changed", value: diffResult.removed.length, icon: AlertCircle, color: "text-red-500" },
           ].map((stat, i) => (
             <div key={i} className="bg-[#161618] border border-zinc-800 rounded-3xl p-6 flex items-center justify-between shadow-lg">
                <div className="space-y-1">
                   <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{stat.label}</p>
                   <p className={cn("text-2xl font-black italic", stat.color)}>{stat.value}</p>
                </div>
                <stat.icon className={cn("w-6 h-6 opacity-20", stat.color)} />
             </div>
           ))}
        </div>

        {/* Input Areas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0 h-[300px]">
           <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between px-2">
                 <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-zinc-600" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">CSV Sheet A</span>
                 </div>
                 <label className="cursor-pointer hover:text-primary transition-all">
                    <Upload className="w-3.5 h-3.5" />
                    <input type="file" className="hidden" accept=".csv" onChange={(e) => handleFileUpload(e, "old")} />
                 </label>
              </div>
              <Textarea 
                className="flex-1 bg-zinc-950 border-zinc-800 font-mono text-xs p-6 resize-none rounded-[2rem] focus:border-primary/20"
                value={oldData}
                placeholder="Paste CSV data or upload file..."
                onChange={(e) => setOldData(e.target.value)}
              />
           </div>

           <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between px-2">
                 <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-zinc-600" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">CSV Sheet B</span>
                 </div>
                 <label className="cursor-pointer hover:text-primary transition-all">
                    <Upload className="w-3.5 h-3.5" />
                    <input type="file" className="hidden" accept=".csv" onChange={(e) => handleFileUpload(e, "new")} />
                 </label>
              </div>
              <Textarea 
                className="flex-1 bg-zinc-950 border-zinc-800 font-mono text-xs p-6 resize-none rounded-[2rem] focus:border-primary/20"
                value={newData}
                placeholder="Paste CSV data or upload file..."
                onChange={(e) => setNewData(e.target.value)}
              />
           </div>
        </div>

        {/* Results */}
        <div className="flex-1 bg-[#0F0F10] border border-zinc-800 rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl">
           <div className="p-6 border-b border-zinc-900 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                 <Info className="w-4 h-4 text-primary" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Sheet Comparison Log</span>
              </div>
              <div className="flex gap-2">
                 <div className="px-3 py-1 bg-green-500/10 border border-green-500/20 text-[10px] text-green-500 rounded-full font-bold">ADDITIONS</div>
                 <div className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-[10px] text-red-500 rounded-full font-bold">REMOVALS</div>
              </div>
           </div>
           
           <div className="flex-1 overflow-auto p-6 space-y-4">
              {diffResult.added.length === 0 && diffResult.removed.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-zinc-700 space-y-4">
                   <CheckCircle2 className="w-12 h-12 opacity-20" />
                   <p className="text-xs uppercase font-black tracking-widest">No differences detected between sheets</p>
                </div>
              ) : (
                <div className="space-y-6">
                   {/* Removed */}
                   {diffResult.removed.length > 0 && (
                     <div className="space-y-3">
                        <p className="text-[10px] font-black text-red-500/60 uppercase ml-2 tracking-widest">Missing in Sheet B</p>
                        {diffResult.removed.map((row, i) => (
                           <div key={i} className="p-4 bg-red-500/5 border border-red-500/10 rounded-2xl font-mono text-[10px] text-red-400 flex flex-wrap gap-4">
                              {Object.entries(row).map(([k, v]: [string, any]) => (
                                <div key={k} className="flex gap-2">
                                   <span className="opacity-40">{k}:</span>
                                   <span className="font-bold">{String(v)}</span>
                                </div>
                              ))}
                           </div>
                        ))}
                     </div>
                   )}

                   {/* Added */}
                   {diffResult.added.length > 0 && (
                     <div className="space-y-3">
                        <p className="text-[10px] font-black text-green-500/60 uppercase ml-2 tracking-widest">Added in Sheet B</p>
                        {diffResult.added.map((row, i) => (
                           <div key={i} className="p-4 bg-green-500/5 border border-green-500/10 rounded-2xl font-mono text-[10px] text-green-400 flex flex-wrap gap-4">
                              {Object.entries(row).map(([k, v]: [string, any]) => (
                                <div key={k} className="flex gap-2">
                                   <span className="opacity-40">{k}:</span>
                                   <span className="font-bold">{String(v)}</span>
                                </div>
                              ))}
                           </div>
                        ))}
                     </div>
                   )}
                </div>
              )}
           </div>
        </div>
      </div>
    </ToolLayout>
  );
}
