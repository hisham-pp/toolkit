"use client";

import React, { useState, useMemo } from "react";
import zxcvbn from "zxcvbn";
import { 
  ShieldCheck, 
  ShieldAlert, 
  ShieldQuestion, 
  Eye, 
  EyeOff,
  Clock,
  Lock,
  ListTodo
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/utility/helpers/utils";

export default function PasswordStrength() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const result = useMemo(() => {
    if (!password) return null;
    return zxcvbn(password);
  }, [password]);

  const scoreInfo = [
    { label: "Too Weak", color: "bg-red-500", text: "text-red-500", icon: ShieldAlert },
    { label: "Weak", color: "bg-orange-500", text: "text-orange-500", icon: ShieldAlert },
    { label: "Moderate", color: "bg-yellow-500", text: "text-yellow-500", icon: ShieldQuestion },
    { label: "Good", color: "bg-blue-500", text: "text-blue-500", icon: ShieldCheck },
    { label: "Strong", color: "bg-green-500", text: "text-green-500", icon: ShieldCheck },
  ];

  const activeScore = result ? scoreInfo[result.score] : null;

  return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
        {/* Input Section */}
        <div className="space-y-6">
          <div className="bg-[#161618] border border-zinc-800 rounded-3xl p-8 space-y-8 h-full">
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Password Analysis
              </h3>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter a password to test..."
                  className="bg-zinc-950 border-zinc-800 h-16 px-6 font-mono text-lg text-white"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {result && activeScore && (
              <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
                {/* Score Bar */}
                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                     <span className={cn("text-xs font-black uppercase tracking-widest", activeScore.text)}>
                        {activeScore.label}
                     </span>
                     <span className="text-[10px] text-zinc-500 font-mono">Score: {result.score} / 4</span>
                  </div>
                  <div className="flex gap-2 h-2">
                    {[0, 1, 2, 3].map((i) => (
                      <div 
                        key={i} 
                        className={cn(
                          "flex-1 rounded-full transition-all duration-500",
                          i <= result.score ? activeScore.color : "bg-zinc-800"
                        )}
                      />
                    ))}
                  </div>
                </div>

                {/* Crack Times */}
                <div className="bg-zinc-900/50 rounded-2xl p-6 border border-zinc-800 space-y-4">
                   <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 flex items-center gap-2">
                     <Clock className="w-3 h-3" />
                     Estimated Crack Times
                   </h4>
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[9px] text-zinc-500 uppercase tracking-tighter">Online Throttled</p>
                        <p className="text-sm font-bold text-zinc-200">{result.crack_times_display.online_no_throttling_10_per_second}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-zinc-500 uppercase tracking-tighter">Offline Slow</p>
                        <p className="text-sm font-bold text-zinc-200">{result.crack_times_display.offline_slow_hashing_1e4_per_second}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-zinc-500 uppercase tracking-tighter">Offline Fast</p>
                        <p className="text-sm font-bold text-zinc-200">{result.crack_times_display.offline_fast_hashing_1e10_per_second}</p>
                      </div>
                      <div className="flex items-center gap-3 bg-zinc-950 p-2 rounded-lg border border-zinc-800">
                         <div className={cn("p-1.5 rounded-md", activeScore.color)}>
                            <activeScore.icon className="w-4 h-4 text-black" />
                         </div>
                         <span className="text-[10px] font-bold text-white uppercase">{activeScore.label}</span>
                      </div>
                   </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Feedback Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-zinc-500">
             <ListTodo className="w-4 h-4" />
             Details & Suggestions
          </div>

          <div className="flex-1 space-y-4">
            {result ? (
              <>
                {result.feedback.warning && (
                  <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex items-start gap-3">
                    <ShieldAlert className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-bold uppercase text-orange-500 mb-1">Warning</p>
                      <p className="text-xs text-zinc-300">{result.feedback.warning}</p>
                    </div>
                  </div>
                )}

                {result.feedback.suggestions.length > 0 && (
                  <div className="p-6 bg-blue-500/5 border border-blue-500/10 rounded-3xl space-y-3">
                     <p className="text-[10px] font-bold uppercase text-blue-500 tracking-widest">Growth Plan</p>
                     <ul className="space-y-2">
                        {result.feedback.suggestions.map((s, i) => (
                          <li key={i} className="flex gap-3 text-xs text-zinc-400">
                             <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                             {s}
                          </li>
                        ))}
                     </ul>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl">
                     <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Entropy</p>
                     <p className="text-lg font-mono text-zinc-200">{~~result.guesses_log10} <span className="text-[10px] text-zinc-600">bits</span></p>
                  </div>
                  <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl">
                     <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Guesses</p>
                     <p className="text-lg font-mono text-zinc-200">{result.guesses.toExponential(1)}</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-12 text-center space-y-4 border border-dashed border-zinc-800 rounded-3xl">
                 <ShieldQuestion className="w-12 h-12 text-zinc-800" />
                 <p className="text-xs text-zinc-600 italic">Enter a password to reveal security vulnerabilities and crack estimation.</p>
              </div>
            )}
          </div>
        </div>
      </div>
  );
}
