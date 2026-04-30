"use client";

import React, { useState, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";
import { TOOLS } from "@/lib/tools-config";
import { Copy, Check, RotateCcw, ShieldCheck, History, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { M3Input } from "@/components/ui/m3-ui";
import { toast } from "sonner";
import bcrypt from "bcryptjs";

type HashHistory = {
  id: string;
  password: string;
  hash: string;
  rounds: number;
  timestamp: number;
};

export default function BcryptGenerator() {
  const tool = TOOLS.find((t) => t.id === "bcrypt-gen")!;
  const [password, setPassword] = useState("");
  const [rounds, setRounds] = useState(10);
  const [hash, setHash] = useState("");
  const [history, setHistory] = useState<HashHistory[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("bcrypt_history");
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load history");
      }
    }
  }, []);

  const saveHistory = (newHistory: HashHistory[]) => {
    setHistory(newHistory);
    localStorage.setItem("bcrypt_history", JSON.stringify(newHistory.slice(0, 10)));
  };

  const generateHash = () => {
    if (!password) {
      toast.error("Please enter a password");
      return;
    }

    try {
      const salt = bcrypt.genSaltSync(rounds);
      const newHash = bcrypt.hashSync(password, salt);
      setHash(newHash);

      const historyItem: HashHistory = {
        id: Math.random().toString(36).substr(2, 9),
        password,
        hash: newHash,
        rounds,
        timestamp: Date.now(),
      };

      saveHistory([historyItem, ...history].slice(0, 10));
      toast.success("Hash generated");
    } catch (err) {
      toast.error("Failed to generate hash");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const clearHistory = () => {
    saveHistory([]);
    toast.success("History cleared");
  };

  return (
    <ToolLayout tool={tool}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
        {/* Generator Section */}
        <div className="space-y-6">
          <div className="bg-[#161618] border border-zinc-800 rounded-3xl p-6 md:p-8 space-y-8">
            <M3Input
              label="Password / Plain Text"
              type="text"
              placeholder="Enter text to hash..."
              className="font-mono text-primary"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Salt Rounds: {rounds}</label>
                <span className="text-[10px] text-zinc-600 font-mono italic">Higher = More Secure but Slower</span>
              </div>
              <input
                type="range"
                min="4"
                max="14"
                value={rounds}
                onChange={(e) => setRounds(parseInt(e.target.value))}
                className="w-full accent-primary bg-zinc-800 rounded-lg h-2 appearance-none cursor-pointer"
              />
            </div>

            <Button onClick={generateHash} className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold group">
              <ShieldCheck className="w-4 h-4 mr-2" />
              Generate Bcrypt Hash
            </Button>
          </div>

          {hash && (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-3 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Resulting Hash</span>
                <Button variant="ghost" size="sm" onClick={() => copyToClipboard(hash)} className="h-7 text-[10px] gap-2">
                  <Copy className="w-3 h-3" />
                  Copy
                </Button>
              </div>
              <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 font-mono text-xs text-green-400 break-all leading-relaxed">
                {hash}
              </div>
            </div>
          )}
        </div>

        {/* History Section */}
        <div className="space-y-6 flex flex-col">
          <div className="flex items-center justify-between">
             <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
               <History className="w-4 h-4" />
               Recent Hashes
             </h2>
             {history.length > 0 && (
               <Button variant="ghost" size="sm" onClick={clearHistory} className="h-8 text-zinc-600 hover:text-red-400">
                 <Trash2 className="w-3.5 h-3.5" />
               </Button>
             )}
          </div>
          
          <div className="flex-1 space-y-3 overflow-auto max-h-[600px] scrollbar-hide">
            {history.length > 0 ? (
              history.map((item) => (
                <div key={item.id} className="p-4 bg-zinc-900/30 border border-zinc-800 rounded-xl space-y-2 group hover:border-zinc-700 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-zinc-500">
                      {new Date(item.timestamp).toLocaleTimeString()} • {item.rounds} rounds
                    </span>
                    <Button variant="ghost" size="icon" onClick={() => copyToClipboard(item.hash)} className="w-6 h-6 opacity-0 group-hover:opacity-100">
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  <p className="text-xs font-mono text-zinc-400 truncate">PW: {item.password}</p>
                  <p className="text-[10px] font-mono text-green-500/70 break-all line-clamp-2">{item.hash}</p>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-12 text-center space-y-4 border border-dashed border-zinc-800 rounded-2xl">
                 <ShieldCheck className="w-12 h-12 text-zinc-800" />
                 <p className="text-sm text-zinc-600 italic">No history yet. Generated hashes will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
