"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, XCircle, ShieldCheck, History, Trash2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import bcrypt from "bcryptjs";

type ComparisonHistory = {
  id: string;
  password: string;
  hash: string;
  match: boolean;
  timestamp: number;
};

export default function BcryptComparator() {
  const [password, setPassword] = useState("");
  const [hash, setHash] = useState("");
  const [result, setResult] = useState<boolean | null>(null);
  const [history, setHistory] = useState<ComparisonHistory[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("bcrypt_comp_history");
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load history");
      }
    }
  }, []);

  const saveHistory = (newHistory: ComparisonHistory[]) => {
    setHistory(newHistory);
    localStorage.setItem("bcrypt_comp_history", JSON.stringify(newHistory.slice(0, 10)));
  };

  const handleCompare = () => {
    if (!password || !hash) {
      toast.error("Enter both password and hash");
      return;
    }

    try {
      const isMatch = bcrypt.compareSync(password, hash);
      setResult(isMatch);

      const historyItem: ComparisonHistory = {
        id: Math.random().toString(36).substr(2, 9),
        password,
        hash,
        match: isMatch,
        timestamp: Date.now(),
      };

      saveHistory([historyItem, ...history].slice(0, 10));
      
      if (isMatch) {
        toast.success("Password matches the hash!");
      } else {
        toast.error("Password does not match");
      }
    } catch (err) {
      toast.error("Invalid Bcrypt hash format");
      setResult(null);
    }
  };

  const reset = () => {
    setPassword("");
    setHash("");
    setResult(null);
  };

  return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
        {/* Comparator Form */}
        <div className="space-y-6">
          <div className="bg-[#161618] border border-zinc-800 rounded-3xl p-6 md:p-8 space-y-8">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Plain Password</label>
                <Input
                  type="text"
                  placeholder="Enter password..."
                  className="bg-zinc-950 border-zinc-800 h-14 font-mono text-white text-lg"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Bcrypt Hash to Check</label>
                <Input
                  type="text"
                  placeholder="$2a$10$..."
                  className="bg-zinc-950 border-zinc-800 h-14 font-mono text-xs text-zinc-400"
                  value={hash}
                  onChange={(e) => setHash(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Button onClick={handleCompare} className="flex-1 h-14 bg-primary hover:bg-primary/90 text-white font-bold text-lg">
                Compare
              </Button>
              <Button variant="outline" onClick={reset} className="w-14 h-14 bg-zinc-900 border-zinc-800">
                <RotateCcw className="w-5 h-5 text-zinc-500" />
              </Button>
            </div>

            {result !== null && (
               <div className={`p-8 rounded-2xl border-2 flex flex-col items-center justify-center gap-4 animate-in zoom-in duration-300 ${
                 result ? "bg-green-500/10 border-green-500/30 text-green-500" : "bg-red-500/10 border-red-500/30 text-red-500"
               }`}>
                 {result ? <CheckCircle2 className="w-16 h-16" /> : <XCircle className="w-16 h-16" />}
                 <div className="text-center">
                    <p className="text-2xl font-black uppercase tracking-tighter">
                      {result ? "Match Found" : "No Match"}
                    </p>
                    <p className="text-sm opacity-70">
                      {result ? "The password matches the provided hash." : "Verification failed. Check your credentials."}
                    </p>
                 </div>
               </div>
            )}
          </div>
        </div>

        {/* Comparison History */}
        <div className="space-y-6 flex flex-col">
          <div className="flex items-center justify-between">
             <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
               <History className="w-4 h-4" />
               Comparison History
             </h2>
             {history.length > 0 && (
               <Button variant="ghost" size="sm" onClick={() => saveHistory([])} className="h-8 text-zinc-600 hover:text-red-400">
                 <Trash2 className="w-3.5 h-3.5" />
               </Button>
             )}
          </div>

          <div className="flex-1 space-y-3 overflow-auto max-h-[600px] scrollbar-hide">
            {history.length > 0 ? (
              history.map((item) => (
                <div key={item.id} className={`p-4 border rounded-xl transition-all ${
                  item.match ? "bg-green-500/5 border-green-500/20" : "bg-red-500/5 border-red-500/20"
                }`}>
                  <div className="flex items-center justify-between mb-2">
                     <span className="text-[10px] font-mono text-zinc-500">
                        {new Date(item.timestamp).toLocaleTimeString()}
                     </span>
                     <span className={`text-[10px] font-bold uppercase tracking-widest ${item.match ? "text-green-500" : "text-red-500"}`}>
                        {item.match ? "Match" : "No Match"}
                     </span>
                  </div>
                  <p className="text-xs font-mono text-zinc-300 truncate">PW: {item.password}</p>
                  <p className="text-[10px] font-mono text-zinc-600 break-all line-clamp-1">{item.hash}</p>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-12 text-center space-y-4 border border-dashed border-zinc-800 rounded-2xl">
                 <ShieldCheck className="w-12 h-12 text-zinc-800" />
                 <p className="text-sm text-zinc-600 italic">Historical comparisons will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
  );
}
