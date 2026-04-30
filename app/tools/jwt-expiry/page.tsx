"use client";

import { useState, useEffect, useMemo } from "react";
import { TOOLS } from "@/lib/tools-config";
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
import { cn } from "@/lib/utils";

export default function JwtExpirySimulator() {
  const tool = TOOLS.find(t => t.id === "jwt-expiry")!;
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
    <div className="flex flex-col h-full max-w-5xl mx-auto gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black text-white tracking-tight uppercase italic">{tool.name}</h1>
        <p className="text-zinc-500 font-medium uppercase tracking-widest text-[10px]">{tool.description}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Token Input */}
        <div className="lg:col-span-12">
           <div className="bg-[#161618] border border-zinc-800 rounded-[2.5rem] p-8 shadow-2xl space-y-6">
              <M3Textarea 
                label="JWT Token"
                placeholder="Paste your token here to test expiration..."
                className="min-h-[120px] font-mono text-[11px] break-all"
                value={token}
                onChange={(e) => setToken(e.target.value)}
              />
              
              {!token && (
                <div className="flex flex-wrap gap-4">
                  <button 
                    onClick={() => {
                      // Generate a dummy token with 1h expiry
                      const exp = Math.floor(Date.now() / 1000) + 3600;
                      const dummy = `header.${btoa(JSON.stringify({ exp, sub: "user-123", name: "Dev" }))}.sig`;
                      setToken(dummy);
                    }}
                    className="px-6 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-primary transition-all flex items-center gap-2"
                  >
                     <RefreshCw className="w-3 h-3" /> Generate Example (1h expiry)
                  </button>
                  <button 
                    onClick={() => {
                      const exp = Math.floor(Date.now() / 1000) - 300;
                      const dummy = `header.${btoa(JSON.stringify({ exp, sub: "user-old" }))}.sig`;
                      setToken(dummy);
                    }}
                    className="px-6 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-red-500 transition-all flex items-center gap-2"
                  >
                     <AlertCircle className="w-3 h-3" /> Generate Expired Example
                  </button>
                </div>
              )}
           </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6">
           {/* Status Card */}
           <div className={cn(
             "md:col-span-2 rounded-[2.5rem] p-10 flex flex-col justify-center gap-8 relative overflow-hidden transition-all duration-500",
             !expiry ? "bg-zinc-950/40 border border-zinc-900" : 
             stats?.isExpired ? "bg-red-500/10 border border-red-500/20" : "bg-green-500/10 border border-green-500/20"
           )}>
              {!expiry ? (
                <div className="flex flex-col items-center justify-center text-center gap-4 opacity-30">
                   <Clock className="w-16 h-16" />
                   <div className="space-y-1">
                      <p className="text-xl font-black uppercase tracking-widest italic">Waiting for Token</p>
                      <p className="text-xs font-medium uppercase tracking-[0.2em]">Paste a JWT with an 'exp' claim</p>
                   </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                     <div className="space-y-1">
                        <h2 className={cn(
                          "text-4xl font-black italic tracking-tighter uppercase",
                          stats?.isExpired ? "text-red-500" : "text-green-500"
                        )}>
                          {stats?.isExpired ? "Expired" : "Active"}
                        </h2>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">Session Integrity Status</p>
                     </div>
                     <div className={cn(
                       "w-20 h-20 rounded-full flex items-center justify-center shadow-2xl",
                       stats?.isExpired ? "bg-red-500/20 text-red-500 shadow-red-500/10" : "bg-green-500/20 text-green-500 shadow-green-500/10"
                     )}>
                        {stats?.isExpired ? <AlertCircle className="w-10 h-10" /> : <CheckCircle2 className="w-10 h-10" />}
                     </div>
                  </div>

                  <div className="space-y-6">
                     <div className="flex items-end justify-between font-mono">
                        <div className="space-y-2">
                           <span className="text-[9px] uppercase tracking-widest text-zinc-600 font-bold">Expiration Time (UTC)</span>
                           <p className="text-xl font-black text-white">{new Date(expiry * 1000).toLocaleString()}</p>
                        </div>
                        <div className="text-right space-y-2">
                           <span className="text-[9px] uppercase tracking-widest text-zinc-600 font-bold">Time {stats?.isExpired ? "Since" : "Remaining"}</span>
                           <p className={cn(
                             "text-3xl font-black",
                             stats?.isExpired ? "text-zinc-500" : "text-primary"
                           )}>
                             {formatTime(stats?.remaining || 0)}
                           </p>
                        </div>
                     </div>

                     <div className="h-4 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800 shadow-inner">
                        <div 
                          className={cn(
                            "h-full transition-all duration-1000 relative",
                            stats?.isExpired ? "bg-red-500/40 w-full" : "bg-primary w-2/3 shadow-[0_0_20px_rgba(var(--primary),0.5)]"
                          )}
                          style={{ width: stats?.isExpired ? "100%" : `${stats?.percent}%` }}
                        >
                           {!stats?.isExpired && (
                             <div className="absolute right-0 top-0 bottom-0 w-8 bg-white/20 blur" />
                           )}
                        </div>
                     </div>
                  </div>
                </>
              )}
           </div>

           {/* Details Panel */}
           <div className="rounded-[2.5rem] bg-zinc-950 border border-zinc-900 p-8 space-y-8">
              <div className="space-y-4">
                 <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 flex items-center gap-2">
                    <Info className="w-3 h-3" /> System Info
                 </h3>
                 <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-3">
                    <div className="flex justify-between items-center">
                       <span className="text-[9px] font-bold text-zinc-600 uppercase">Current Ticks</span>
                       <span className="text-xs font-mono text-zinc-400">{currentTime}</span>
                    </div>
                    <div className="flex justify-between items-center">
                       <span className="text-[9px] font-bold text-zinc-600 uppercase">Precision</span>
                       <span className="text-[9px] font-black text-green-500 uppercase tracking-widest">Real-time</span>
                    </div>
                 </div>
              </div>

              <div className="space-y-4">
                 <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 flex items-center gap-2">
                    <History className="w-3 h-3" /> Best Practices
                 </h3>
                 <ul className="space-y-3">
                    {[
                      "Check 'iat' to prevent future tokens",
                      "Ensure 'exp' isn't too long",
                      "Always verify signature!",
                      "Use HTTPS for token transport"
                    ].map((text, i) => (
                      <li key={i} className="flex items-center gap-3 text-[10px] font-medium text-zinc-500">
                         <div className="w-1 h-1 rounded-full bg-primary" /> {text}
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
