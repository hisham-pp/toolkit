"use client";

import React, { useState, useMemo } from "react";
import { 
  Trash2, 
  Copy, 
  Eye, 
  EyeOff,
  Search,
  Lock,
  Download,
  Terminal,
  Settings2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/utility/helpers/utils";

interface EnvVar {
  key: string;
  value: string;
  isSecret: boolean;
}

export default function EnvManager() {
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showValues, setShowValues] = useState<Record<string, boolean>>({});

  const envVars = useMemo(() => {
    return inputText.split("\n")
      .map(line => line.trim())
      .filter(line => line && !line.startsWith("#"))
      .map(line => {
        const [key, ...valueParts] = line.split("=");
        const value = valueParts.join("=").replace(/^['"]|['"]$/g, "");
        return {
          key: key.trim(),
          value: value.trim(),
          isSecret: key.toUpperCase().includes("SECRET") || key.toUpperCase().includes("KEY") || key.toUpperCase().includes("TOKEN") || key.toUpperCase().includes("PASS")
        };
      })
      .filter(v => v.key.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [inputText, searchQuery]);

  const toggleVisibility = (key: string) => {
    setShowValues(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const downloadEnv = () => {
    const element = document.createElement("a");
    const file = new Blob([inputText], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = ".env";
    document.body.appendChild(element);
    element.click();
  };

  return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
        {/* Input/Editor */}
        <div className="flex flex-col gap-6">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <Terminal className="w-5 h-5 text-primary" />
                 <h2 className="text-sm font-bold uppercase tracking-widest text-white">Source Editor</h2>
              </div>
              <div className="flex gap-2">
                 <Button variant="ghost" size="sm" onClick={() => setInputText("")} className="h-8 text-zinc-500 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                 </Button>
                 <Button variant="outline" size="sm" onClick={downloadEnv} disabled={!inputText} className="h-8 bg-zinc-900 border-zinc-800 text-xs font-bold gap-2">
                    <Download className="w-3 h-3" />
                    Download
                 </Button>
              </div>
           </div>
           <Textarea 
            className="flex-1 bg-zinc-950 border-zinc-800 font-mono text-xs p-6 resize-none min-h-[500px]"
            placeholder="PASTE YOUR .ENV CONTENT HERE...&#10;&#10;DB_HOST=localhost&#10;STRIPE_SECRET_KEY=sk_test_..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
           />
        </div>

        {/* Visual Manager */}
        <div className="flex flex-col gap-6">
           <div className="space-y-4">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2 text-sm font-bold text-zinc-500">
                    <Settings2 className="w-4 h-4" />
                    Variables ({envVars.length})
                 </div>
                 <div className="relative w-48">
                    <Input 
                      className="h-8 bg-zinc-900 border-zinc-800 pl-8 text-[10px]"
                      placeholder="Filter keys..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-600" />
                 </div>
              </div>

              <div className="flex-1 overflow-auto space-y-3 max-h-[600px] scrollbar-hide pr-2">
                {envVars.length > 0 ? (
                  envVars.map((v, i) => (
                    <div key={i} className="bg-[#161618] border border-zinc-800 p-4 rounded-2xl group hover:border-primary/20 transition-all">
                       <div className="flex items-center justify-between mb-2">
                          <code className="text-[10px] font-black uppercase text-zinc-400 tracking-tighter transition-colors group-hover:text-primary">
                            {v.key}
                          </code>
                          {v.isSecret && (
                            <div className="flex items-center gap-1 text-[8px] bg-red-500/10 text-red-500 px-1.5 py-0.5 rounded border border-red-500/20 font-bold uppercase">
                               <Lock className="w-2.5 h-2.5" /> Secret
                            </div>
                          )}
                       </div>
                       
                       <div className="flex gap-2 items-center">
                          <div className="flex-1 relative bg-zinc-950 border border-zinc-900 rounded-lg h-9 px-3 flex items-center overflow-hidden">
                             <span className="font-mono text-xs text-zinc-500 truncate pr-8">
                                {(v.isSecret && !showValues[v.key]) ? "•".repeat(16) : v.value}
                             </span>
                             {v.isSecret && (
                               <button 
                                onClick={() => toggleVisibility(v.key)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-700 hover:text-zinc-400"
                               >
                                  {showValues[v.key] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                               </button>
                             )}
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => copyToClipboard(v.value)} className="h-9 w-9 p-0 text-zinc-600 hover:text-primary">
                             <Copy className="w-3.5 h-3.5" />
                          </Button>
                       </div>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center py-20 text-center space-y-4 border border-dashed border-zinc-800 rounded-2xl">
                     <Settings2 className="w-12 h-12 text-zinc-800" />
                     <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-700 italic">No variables found</p>
                  </div>
                )}
              </div>
           </div>
        </div>
      </div>
  );
}
