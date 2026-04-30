"use client";

import React, { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { TOOLS } from "@/lib/tools-config";
import ReactDiffViewer from "react-diff-viewer-continued";
import yaml from "js-yaml";
import { 
  Files, 
  Trash2, 
  Copy, 
  Settings2, 
  AlertCircle,
  CheckCircle2,
  Database
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const DEFAULT_OLD = `server:
  port: 3000
  host: localhost
  timeout: 5000
database:
  type: postgres
  pool: 10
features:
  auth: true
  cache: false`;

const DEFAULT_NEW = `server:
  port: 8080
  host: 0.0.0.0
  timeout: 3000
database:
  type: mongodb
  uri: mongodb://localhost:27017
features:
  auth: true
  cache: true
  logging: "debug"`;

export default function YamlDiff() {
  const tool = TOOLS.find((t) => t.id === "yaml-diff")!;
  const [oldYaml, setOldYaml] = useState(DEFAULT_OLD);
  const [newYaml, setNewYaml] = useState(DEFAULT_NEW);

  const validation = useMemo(() => {
    let oldValid = true;
    let oldError = null;
    let newValid = true;
    let newError = null;

    try {
      if (oldYaml.trim()) yaml.load(oldYaml);
    } catch (e: any) {
      oldValid = false;
      oldError = e.message;
    }

    try {
      if (newYaml.trim()) yaml.load(newYaml);
    } catch (e: any) {
      newValid = false;
      newError = e.message;
    }

    return { oldValid, oldError, newValid, newError };
  }, [oldYaml, newYaml]);

  const clear = () => {
    setOldYaml("");
    setNewYaml("");
  };

  return (
    <ToolLayout tool={tool}>
      <div className="flex flex-col h-full gap-6">
        <div className="flex items-center justify-between bg-[#161618] p-3 border border-zinc-800 rounded-2xl shadow-xl">
           <div className="flex items-center gap-6 ml-4">
              <div className="flex items-center gap-3">
                 <div className={cn("w-2 h-2 rounded-full", validation.oldValid ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-red-500 animate-pulse")} />
                 <span className="text-[10px] font-black uppercase tracking-tighter text-zinc-500">Left YAML Status</span>
              </div>
              <div className="flex items-center gap-3">
                 <div className={cn("w-2 h-2 rounded-full", validation.newValid ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-red-500 animate-pulse")} />
                 <span className="text-[10px] font-black uppercase tracking-tighter text-zinc-500">Right YAML Status</span>
              </div>
           </div>

           <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={clear} className="h-9 px-3 text-zinc-500 hover:text-red-400">
                <Trash2 className="w-4 h-4" />
              </Button>
              <Button onClick={() => toast.success("Snapshots saved for diff")} className="h-9 px-6 bg-primary hover:bg-primary/90 text-white font-bold gap-2 rounded-xl text-xs">
                 <Database className="w-3.5 h-3.5" /> Save Static
              </Button>
           </div>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
           <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between px-2">
                 <div className="flex items-center gap-2">
                    <Settings2 className="w-3.5 h-3.5 text-zinc-600" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Old Configuration</span>
                 </div>
                 {validation.oldError && <AlertCircle className="w-3.5 h-3.5 text-red-500" />}
              </div>
              <Textarea 
                className={cn(
                  "flex-1 bg-zinc-950 border-zinc-800 font-mono text-xs p-6 resize-none rounded-[2rem] transition-all",
                  !validation.oldValid && "border-red-500/30"
                )}
                value={oldYaml}
                onChange={(e) => setOldYaml(e.target.value)}
              />
           </div>

           <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between px-2">
                 <div className="flex items-center gap-2">
                    <Settings2 className="w-3.5 h-3.5 text-zinc-600" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">New Configuration</span>
                 </div>
                 {validation.newError && <AlertCircle className="w-3.5 h-3.5 text-red-500" />}
              </div>
              <Textarea 
                className={cn(
                  "flex-1 bg-zinc-950 border-zinc-800 font-mono text-xs p-6 resize-none rounded-[2rem] transition-all",
                  !validation.newValid && "border-red-500/30"
                )}
                value={newYaml}
                onChange={(e) => setNewYaml(e.target.value)}
              />
           </div>
        </div>

        <div className="h-[400px] bg-zinc-950 border border-zinc-800 rounded-[2.5rem] overflow-hidden flex flex-col">
           <div className="p-4 border-b border-zinc-900 bg-zinc-900/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <Files className="w-4 h-4 text-primary" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Structural YAML Diff</span>
              </div>
              {validation.oldValid && validation.newValid ? (
                <div className="flex items-center gap-2 text-[10px] text-green-500 font-bold uppercase">
                   <CheckCircle2 className="w-3.5 h-3.5" /> Both Valid
                </div>
              ) : (
                <div className="flex items-center gap-2 text-[10px] text-red-500 font-bold uppercase">
                   <AlertCircle className="w-3.5 h-3.5" /> Invalid YAML Input
                </div>
              )}
           </div>
           <div className="flex-1 overflow-auto">
              <ReactDiffViewer
                oldValue={oldYaml}
                newValue={newYaml}
                splitView={true}
                useDarkTheme={true}
                styles={{
                  variables: {
                    dark: {
                      diffViewerBackground: "transparent",
                    }
                  }
                }}
              />
           </div>
        </div>

        {(validation.oldError || validation.newError) && (
          <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-2xl">
             <p className="text-[10px] font-mono text-red-500 leading-relaxed whitespace-pre-wrap">
                {validation.oldError && `OLD: ${validation.oldError}\n`}
                {validation.newError && `NEW: ${validation.newError}`}
             </p>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
