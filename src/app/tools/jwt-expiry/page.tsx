"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  Timer,
  AlertCircle,
  CheckCircle2,
  Clock,
  History,
  Info,
  RefreshCw,
  Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { M3Input, M3Textarea } from "@/components/ui/m3-ui";
import { cn } from "@/utility/helpers/utils";

export default function JwtExpirySimulator() {
  const [token, setToken] = useState("");
  const [expiry, setExpiry] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(Math.floor(Date.now() / 1000));

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const decodeToken = (t: string) => {
    try {
      const parts = t.split(".");
      if (parts.length !== 3) return null;
      const payload = JSON.parse(atob(parts[1]));
      return payload;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const payload = decodeToken(token);
    if (payload && payload.exp) {
      setExpiry(payload.exp);
    } else {
      setExpiry(null);
    }
  }, [token]);

  const stats = useMemo(() => {
    if (!expiry) return null;
    const remaining = expiry - currentTime;
    const isExpired = remaining <= 0;
    
    return {
      remaining,
      isExpired,
      percent: Math.max(0, Math.min(100, (remaining / (3600 * 24)) * 100)) // Relative to 24h for visualization
    };
  }, [expiry, currentTime]);

  const formatTime = (seconds: number) => {
    const abs = Math.abs(seconds);
    const h = Math.floor(abs / 3600);
    const m = Math.floor((abs % 3600) / 60);
    const s = abs % 60;
    return `${h}h ${m}m ${s}s`;
  };

  return (
    <div className="flex flex-col h-full max-w-6xl mx-auto gap-10 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Token Input */}
          <div className="lg:col-span-12">
             <div className="bg-[#161618] border border-zinc-800 rounded-[3rem] p-10 shadow-2xl space-y-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                
                <M3Textarea 
                  label="JWT Token (Bearer Authentication)"
                  placeholder="Paste your encoded token here for lifecycle simulation..."
                  className="min-h-[160px] font-mono text-xs break-all"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                />
                
                {!token && (
                  <div className="flex flex-wrap gap-4 pt-4">
                    <button 
                      onClick={() => {
                        const exp = Math.floor(Date.now() / 1000) + 3600;
                        const dummy = `header.${btoa(JSON.stringify({ exp, sub: "user-123", name: "Dev" }))}.sig`;
                        setToken(dummy);
                      }}
                      className="px-6 py-3 bg-zinc-900/50 border border-zinc-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-primary transition-all flex items-center gap-3"
                    >
                       <RefreshCw className="w-3.5 h-3.5" /> Generate Active (1h)
                    </button>
                    <button 
                      onClick={() => {
                        const exp = Math.floor(Date.now() / 1000) - 300;
                        const dummy = `header.${btoa(JSON.stringify({ exp, sub: "user-old" }))}.sig`;
                        setToken(dummy);
                      }}
                      className="px-6 py-3 bg-zinc-900/50 border border-zinc-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-red-500 transition-all flex items-center gap-3"
                    >
                       <AlertCircle className="w-3.5 h-3.5" /> Generate Expired
                    </button>
                  </div>
                )}
             </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-12 grid grid-cols-1 lg:grid-cols-3 gap-10 pb-10">
             {/* Status Card */}
             <div className={cn(
               "lg:col-span-2 rounded-[3rem] p-12 flex flex-col justify-center gap-10 relative overflow-hidden transition-all duration-700 shadow-2xl",
               !expiry ? "bg-zinc-950/40 border border-zinc-900" : 
               stats?.isExpired ? "bg-red-500/5 border border-red-500/20 shadow-red-500/5" : "bg-primary/5 border border-primary/20 shadow-primary/5"
             )}>
                {!expiry ? (
                  <div className="flex flex-col items-center justify-center text-center gap-6 opacity-10 py-10 grayscale">
                     <Clock className="w-24 h-24" />
                     <div className="space-y-2">
                        <p className="text-2xl font-black uppercase tracking-[0.4em] italic">No Token Data</p>
                        <p className="text-xs font-medium uppercase tracking-[0.3em]">Lifecycle monitoring offline</p>
                     </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between relative z-10">
                       <div className="space-y-4">
                          <h2 className={cn(
                            "text-6xl font-black italic tracking-tighter uppercase leading-none",
                            stats?.isExpired ? "text-red-500" : "text-primary"
                          )}>
                            {stats?.isExpired ? "Expired" : "Active"}
                          </h2>
                          <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600">
                             <div className={cn("w-2 h-2 rounded-full", stats?.isExpired ? "bg-red-500" : "bg-green-500 animate-pulse")} />
                             Token Integrity Matrix
                          </div>
                       </div>
                       <div className={cn(
                         "w-24 h-24 rounded-[2rem] flex items-center justify-center shadow-2xl transition-all duration-500",
                         stats?.isExpired ? "bg-red-500 text-white shadow-red-500/30 rotate-12" : "bg-primary text-white shadow-primary/30"
                       )}>
                          {stats?.isExpired ? <AlertCircle className="w-12 h-12" /> : <Timer className="w-12 h-12" />}
                       </div>
                    </div>

                    <div className="space-y-8 relative z-10">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-mono">
                          <div className="space-y-3 bg-zinc-950/50 p-6 rounded-3xl border border-zinc-900">
                             <span className="text-[10px] uppercase tracking-widest text-zinc-600 font-black">Expiration Boundary</span>
                             <p className="text-lg font-black text-white">{new Date(expiry * 1000).toLocaleString()}</p>
                          </div>
                          <div className="space-y-3 bg-zinc-950/50 p-6 rounded-3xl border border-zinc-900 text-right">
                             <span className="text-[10px] uppercase tracking-widest text-zinc-600 font-black">Temporal {stats?.isExpired ? "Deficit" : "Buffer"}</span>
                             <p className={cn(
                               "text-4xl font-black tracking-tighter",
                               stats?.isExpired ? "text-zinc-500" : "text-primary"
                             )}>
                               {formatTime(stats?.remaining || 0)}
                             </p>
                          </div>
                       </div>

                       <div className="space-y-3">
                          <div className="flex justify-between items-end px-1">
                             <span className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-700">Entropy Dissipation</span>
                             <span className="text-xs font-mono font-bold text-zinc-500">{stats?.isExpired ? "0" : Math.floor(stats?.remaining || 0)}s</span>
                          </div>
                          <div className="h-4 w-full bg-zinc-950 rounded-full overflow-hidden border border-zinc-900 shadow-inner p-1">
                             <div 
                               className={cn(
                                 "h-full rounded-full transition-all duration-1000 relative shadow-lg",
                                 stats?.isExpired ? "bg-zinc-800 w-full" : "bg-gradient-to-r from-primary/50 to-primary w-2/3"
                               )}
                               style={{ width: stats?.isExpired ? "100%" : `${stats?.percent}%` }}
                             >
                                {!stats?.isExpired && (
                                  <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.1),transparent)] animate-shimmer" />
                                )}
                             </div>
                          </div>
                       </div>
                    </div>
                  </>
                )}
             </div>

             {/* Details Panel */}
             <div className="rounded-[3rem] bg-zinc-950 border border-zinc-900 p-10 space-y-10 shadow-2xl">
                <div className="space-y-6">
                   <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-600 flex items-center gap-3">
                      <Info className="w-4 h-4 text-primary" /> Logic Engine
                   </h3>
                   <div className="p-6 rounded-[2rem] bg-[#0c0c0e] border border-zinc-900 space-y-4">
                      <div className="flex justify-between items-center pb-4 border-b border-zinc-900">
                         <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Epoch Clock</span>
                         <span className="text-xs font-mono text-primary font-bold">{currentTime}</span>
                      </div>
                      <div className="flex justify-between items-center">
                         <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Sampling</span>
                         <span className="text-[10px] font-black text-green-500 uppercase tracking-widest bg-green-500/10 px-2 py-0.5 rounded">1Hz Rate</span>
                      </div>
                   </div>
                </div>

                <div className="space-y-6">
                   <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-600 flex items-center gap-3">
                      <History className="w-4 h-4 text-primary" /> Protocol Guards
                   </h3>
                   <ul className="space-y-5">
                      {[
                        "Atomic Verification Strategy",
                        "Token Leakage Prevention",
                        "Signature Nonce Validation",
                        "Temporal Buffer Management"
                      ].map((text, i) => (
                        <li key={i} className="flex items-center gap-4 text-[11px] font-bold text-zinc-500 uppercase tracking-tight">
                           <div className="w-1.5 h-1.5 rounded-full bg-primary/40 shadow-sm" /> {text}
                        </li>
                      ))}
                   </ul>
                </div>
             </div>
          </div>
        </div>
      </div>
    );
  }
