"use client";

import { useState, useMemo } from "react";
import { Code2, Fingerprint, RotateCcw, Settings2, ShieldAlert, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { M3Input, M3Select, M3Password } from "@/components/ui/m3-ui";
import { toast } from "sonner";
import { cn } from "@/utility/helpers/utils";

interface Rule {
  id: string;
  type: "length" | "uppercase" | "lowercase" | "number" | "special" | "custom";
  value: any;
  enabled: boolean;
}

export default function PasswordPolicyBuilder() {
  const [minLength, setMinLength] = useState(8);
  const [requireUpper, setRequireUpper] = useState(true);
  const [requireLower, setRequireLower] = useState(true);
  const [requireNumber, setRequireNumber] = useState(true);
  const [requireSpecial, setRequireSpecial] = useState(true);
  
  const [testPassword, setTestPassword] = useState("");

  const policy = useMemo(() => {
    return {
      minLength,
      requireUpper,
      requireLower,
      requireNumber,
      requireSpecial,
      regex: new RegExp(
        `^${requireUpper ? "(?=.*[A-Z])" : ""}${requireLower ? "(?=.*[a-z])" : ""}${requireNumber ? "(?=.*\\d)" : ""}${requireSpecial ? "(?=.*[@$!%*?&])" : ""}.{${minLength},}$`
      )
    };
  }, [minLength, requireUpper, requireLower, requireNumber, requireSpecial]);

  const testResults = useMemo(() => {
    if (!testPassword) return null;
    return {
      length: testPassword.length >= minLength,
      upper: requireUpper ? /[A-Z]/.test(testPassword) : true,
      lower: requireLower ? /[a-z]/.test(testPassword) : true,
      number: requireNumber ? /\d/.test(testPassword) : true,
      special: requireSpecial ? /[@$!%*?&]/.test(testPassword) : true,
      isValid: policy.regex.test(testPassword)
    };
  }, [testPassword, minLength, requireUpper, requireLower, requireNumber, requireSpecial, policy]);

  const score = useMemo(() => {
    if (!testResults) return 0;
    const checks = [testResults.length, testResults.upper, testResults.lower, testResults.number, testResults.special];
    return (checks.filter(Boolean).length / 5) * 100;
  }, [testResults]);

  const codeSnippet = `
// Password Validation Regex
// - Min ${minLength} characters
// - ${requireUpper ? "Requires" : "Optional"} uppercase
// - ${requireNumber ? "Requires" : "Optional"} numbers
const passwordRegex = ${policy.regex.toString()};

function validatePassword(pass) {
  return passwordRegex.test(pass);
}
  `.trim();

  return (
    <div className="flex flex-col h-full max-w-6xl mx-auto gap-10 pt-6 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 flex-1">
          {/* Policy Configuration */}
          <div className="lg:col-span-5 space-y-8">
             <div className="bg-[#161618] border border-zinc-800 rounded-[3rem] p-10 space-y-10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                
                <div className="flex items-center gap-5">
                   <div className="p-4 bg-primary/10 rounded-2xl text-primary shadow-inner">
                      <Settings2 className="w-6 h-6" />
                   </div>
                   <div>
                      <h3 className="text-sm font-black uppercase tracking-widest text-white italic">Requirements</h3>
                      <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-[0.2em] mt-1">Enterprise Configuration</p>
                   </div>
                </div>

                <div className="space-y-8">
                   <div className="space-y-4">
                      <div className="flex justify-between items-center px-1">
                         <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Min Length Check</label>
                         <span className="text-2xl font-black text-primary italic font-mono">{minLength}</span>
                      </div>
                      <input 
                        type="range" 
                        min="4" 
                        max="64" 
                        value={minLength}
                        onChange={(e) => setMinLength(parseInt(e.target.value))}
                        className="w-full h-2 bg-zinc-950 border border-zinc-900 rounded-full appearance-none cursor-pointer accent-primary"
                      />
                   </div>

                   <div className="grid grid-cols-1 gap-4">
                      {[
                        { label: "Uppercase Letters (A-Z)", val: requireUpper, set: setRequireUpper },
                        { label: "Lowercase Letters (a-z)", val: requireLower, set: setRequireLower },
                        { label: "Numerical Digits (0-9)", val: requireNumber, set: setRequireNumber },
                        { label: "Special Symbols (@$!%*)", val: requireSpecial, set: setRequireSpecial }
                      ].map((rule, i) => (
                        <button
                          key={i}
                          onClick={() => rule.set(!rule.val)}
                          className={cn(
                            "w-full flex items-center justify-between p-5 rounded-[1.5rem] border transition-all duration-500",
                            rule.val ? "bg-primary/5 border-primary/30 text-primary shadow-inner" : "bg-zinc-900/30 border-zinc-800 text-zinc-600 hover:border-zinc-700"
                          )}
                        >
                           <span className="text-[10px] font-black uppercase tracking-widest">{rule.label}</span>
                           <div className={cn(
                             "w-10 h-5 rounded-full relative transition-all duration-300",
                             rule.val ? "bg-primary shadow-[0_0_10px_rgba(var(--primary),0.3)]" : "bg-zinc-800"
                           )}>
                              <div className={cn(
                                "absolute top-1 w-3 h-3 bg-white rounded-full transition-all",
                                rule.val ? "left-6" : "left-1"
                              )} />
                           </div>
                        </button>
                      ))}
                   </div>
                </div>

                <Button 
                  onClick={() => {
                     setMinLength(8);
                     setRequireUpper(true);
                     setRequireLower(true);
                     setRequireNumber(true);
                     setRequireSpecial(true);
                  }}
                  variant="ghost" 
                  className="w-full h-14 rounded-2xl text-[9px] font-black uppercase tracking-[0.3em] text-zinc-700 hover:text-white gap-3 border border-transparent hover:border-zinc-800 transition-all"
                >
                   <RotateCcw className="w-3.5 h-3.5" /> Force Policy Reset
                </Button>
             </div>
          </div>

          {/* Testing & Code */}
          <div className="lg:col-span-7 flex flex-col gap-8">
             <div className="bg-[#0c0c0e] border border-zinc-900 rounded-[3.5rem] p-12 space-y-12 shadow-2xl flex-1 flex flex-col relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                
                <div className="space-y-8">
                   <div className="flex items-center justify-between">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-600 flex items-center gap-3 italic">
                         <Fingerprint className="w-5 h-5 text-primary" /> Integrity Simulator
                      </h3>
                      {score > 0 && (
                        <div className="flex gap-1.5 h-2 w-32">
                          {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className={cn(
                              "flex-1 rounded-full shadow-inner",
                              i <= (score/20) ? (score < 60 ? "bg-red-500" : score < 100 ? "bg-amber-500" : "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]") : "bg-zinc-900"
                            )} />
                          ))}
                        </div>
                      )}
                   </div>
                   
                   <M3Password 
                     label="Sample Password Validation"
                     placeholder="Inject string to test boundaries..."
                     className="text-xl"
                     value={testPassword}
                     onChange={(e) => setTestPassword(e.target.value)}
                   />

                   {testPassword && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                         {[
                           { label: `Min ${minLength} chars`, ok: testResults?.length },
                           { label: "Case [A-Z]", ok: testResults?.upper },
                           { label: "Case [a-z]", ok: testResults?.lower },
                           { label: "Int [0-9]", ok: testResults?.number },
                           { label: "Sym [@$!#]", ok: testResults?.special }
                         ].map((check, i) => (
                           <div 
                             key={i} 
                             className={cn(
                               "flex items-center gap-3 p-4 rounded-2xl border transition-all duration-300",
                               check.ok ? "bg-green-500/5 border-green-500/10 text-green-500" : "bg-red-500/5 border-red-500/10 text-red-400"
                             )}
                           >
                              {check.ok ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                              <span className="text-[9px] font-black uppercase tracking-widest">{check.label}</span>
                           </div>
                         ))}
                      </div>
                   )}
                </div>

                <div className="flex-1 flex flex-col gap-10">
                   <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-600 flex items-center gap-3 italic">
                      <Code2 className="w-5 h-5 text-primary" /> Logic Implementation
                   </h3>
                   <div className="flex-1 relative group">
                      <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                         <Button size="sm" variant="ghost" className="h-10 px-5 bg-zinc-950 text-[10px] uppercase font-black tracking-widest border border-zinc-800 rounded-xl hover:bg-primary hover:text-white hover:border-primary transition-all" onClick={() => {
                           navigator.clipboard.writeText(codeSnippet);
                           toast.success("Code copied");
                         }}>
                           Export Schema
                         </Button>
                      </div>
                      <pre className="w-full h-full min-h-[240px] bg-[#08080a] border border-zinc-900 rounded-[2.5rem] p-10 font-mono text-[12px] text-zinc-500 leading-relaxed overflow-auto custom-scrollbar shadow-inner relative z-10">
                         {codeSnippet}
                      </pre>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    );
  }
