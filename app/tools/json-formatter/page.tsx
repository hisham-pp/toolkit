"use client";

import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import { TOOLS } from "@/lib/tools-config";
import { useToolHistory } from "@/lib/hooks";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Copy, 
  Trash2, 
  Maximize2, 
  Minimize2, 
  History, 
  Check, 
  RotateCcw,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

const tool = TOOLS.find(t => t.id === "json-formatter")!;

export default function JsonFormatterPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const { history, addToHistory, clearHistory } = useToolHistory(tool.id);

  const handleFormat = useCallback(() => {
    if (!input.trim()) return;
    try {
      const parsed = JSON.parse(input);
      const formatted = JSON.stringify(parsed, null, 2);
      setOutput(formatted);
      setError(null);
      addToHistory(input);
      toast.success("JSON Formatted Successfully");
    } catch (e: any) {
      setError(e.message);
      toast.error("Invalid JSON content");
    }
  }, [input, addToHistory]);

  const handleCopy = useCallback(() => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setIsCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setIsCopied(false), 2000);
  }, [output]);

  const handleClear = () => {
    setInput("");
    setOutput("");
    setError(null);
  };

  const loadFromHistory = (data: string) => {
    setInput(data);
    toast.info("Loaded from history");
  };

  return (
    <ToolLayout tool={tool}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-12rem)]">
        {/* Editor Area */}
        <div className="lg:col-span-9 flex flex-col gap-4 h-full">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl flex flex-col overflow-hidden h-full">
            <div className="border-b border-zinc-800 bg-zinc-900 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/40"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/40"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/40"></div>
                <span className="ml-2 text-white text-xs font-medium uppercase tracking-widest hidden sm:inline">JSON Terminal</span>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleClear}
                  className="h-7 text-[10px] uppercase font-bold tracking-widest text-zinc-500 hover:text-zinc-300"
                >
                  Clear
                </Button>
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={handleFormat}
                  className="h-7 text-[10px] uppercase font-bold tracking-widest bg-primary text-primary-foreground hover:bg-primary/90 rounded-md"
                >
                  Format JSON
                </Button>
              </div>
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 p-4 gap-4 bg-zinc-950/40 min-h-0">
              {/* Raw Input */}
              <div className="flex flex-col gap-2 min-h-0">
                <label className="text-[10px] uppercase tracking-wider font-bold text-zinc-600 px-1">Raw Input</label>
                <div className="flex-1 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/50 focus-within:border-primary/30 transition-colors">
                  <Textarea
                    placeholder="Paste your JSON here..."
                    className="w-full h-full resize-none bg-transparent border-none focus-visible:ring-0 font-mono text-xs p-4 leading-relaxed text-indigo-300 placeholder:text-zinc-800"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                  />
                </div>
              </div>

              {/* Pretty Output */}
              <div className="flex flex-col gap-2 min-h-0">
                <label className="text-[10px] uppercase tracking-wider font-bold text-zinc-600 px-1 flex justify-between items-center">
                  Pretty Output
                  {output && (
                    <button 
                      onClick={handleCopy}
                      className="hover:text-primary transition-colors flex items-center gap-1"
                    >
                      {isCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {isCopied ? "Copied" : "Copy"}
                    </button>
                  )}
                </label>
                <div className={cn(
                  "flex-1 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 relative group",
                  error ? "border-red-500/20" : ""
                )}>
                  <ScrollArea className="h-full">
                    {error ? (
                      <div className="p-4 font-mono text-[11px] text-red-400/80 bg-red-400/5 h-full">
                        <div className="font-bold uppercase tracking-wider mb-2 text-red-500 font-sans">Validation Error</div>
                        {error}
                      </div>
                    ) : output ? (
                      <pre className="p-4 font-mono text-xs leading-relaxed text-emerald-400">
                        {output}
                      </pre>
                    ) : (
                      <div className="h-full flex items-center justify-center text-zinc-800 font-mono text-[10px] uppercase tracking-[0.2em] text-center px-12 py-20 italic">
                        Terminal idle... waiting for input
                      </div>
                    )}
                  </ScrollArea>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* History Sidebar */}
        <div className="lg:col-span-3 flex flex-col gap-4 h-full">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-5 flex flex-col h-full overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">History</h2>
              <span className="text-[9px] px-2 py-0.5 bg-zinc-800 rounded-full text-zinc-400">{history.length} / 10</span>
            </div>

            <ScrollArea className="flex-1 -mx-2 px-2">
              <div className="space-y-2">
                {history.length === 0 ? (
                  <div className="py-12 text-center space-y-2 opacity-20">
                    <History className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-[9px] font-mono leading-tight px-4 font-bold uppercase tracking-widest">No Recent Logs</p>
                  </div>
                ) : (
                  <AnimatePresence>
                    {history.map((item) => (
                      <motion.button
                        key={item.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        onClick={() => loadFromHistory(item.data)}
                        className="w-full text-left group"
                      >
                        <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 hover:border-primary/40 hover:bg-zinc-800/40 transition-all space-y-1">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] font-mono text-zinc-300 group-hover:text-primary transition-colors">
                              {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span className="text-[9px] text-zinc-600 group-hover:text-zinc-500 transition-colors">
                              {item.data.length}b
                            </span>
                          </div>
                          <p className="text-[10px] font-mono text-zinc-500 line-clamp-1 break-all group-hover:text-zinc-400 transition-colors opacity-70">
                            {item.data.replace(/\s+/g, '')}
                          </p>
                        </div>
                      </motion.button>
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </ScrollArea>

            {history.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearHistory}
                className="mt-4 w-full h-8 text-[9px] uppercase font-bold tracking-widest text-zinc-600 hover:text-red-400 hover:bg-red-400/5 border border-zinc-800"
              >
                Flush History
              </Button>
            )}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
