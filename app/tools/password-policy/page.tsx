"use client";

import { useState, useMemo } from "react";
import { TOOLS } from "@/lib/tools-config";
import { 
  ShieldCheck, 
  ShieldAlert,
  Terminal,
  Settings2,
  Trash2,
  Plus,
  ArrowRight,
  Code2,
  Fingerprint,
  RotateCcw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { M3Input, M3Select } from "@/components/ui/m3-ui";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Rule {
  id: string;
  type: "length" | "uppercase" | "lowercase" | "number" | "special" | "custom";
  value: any;
  enabled: boolean;
}

export default function PasswordPolicyBuilder() {
  const tool = TOOLS.find(t => t.id === "password-policy")!;
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
    <div className="flex flex-col h-full max-w-6xl mx-auto gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black text-white tracking-tight uppercase italic">{tool.name}</h1>
        <p className="text-zinc-500 font-medium uppercase tracking-widest text-[10px]">{tool.description}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
        {/* Policy Configuration */}
        <div className="lg:col-span-5 space-y-6">
           <div className="bg-[#161618] border border-zinc-800 rounded-[2.5rem] p-8 space-y-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              
              <div className="flex items-center gap-4">
                 <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                    <Settings2 className="w-5 h-5" />
                 </div>
                 <div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-white italic">Requirements</h3>
                    <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Configure Enterprise Rules</p>
                 </div>
              </div>

              <div className="space-y-6">
                 <div className="space-y-3">
                    <div className="flex justify-between items-center px-1">
                       <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Minimum Length</label>
                       <span className="text-xl font-black text-primary">{minLength}</span>
                    </div>
                    <input 
                      type="range" 
                      min="4" 
                      max="64" 
                      value={minLength}
                      onChange={(e) => setMinLength(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-zinc-900 rounded-full appearance-none cursor-pointer accent-primary"
                    />
                 </div>

                 <div className="grid grid-cols-1 gap-3">
                    {[
                      { label: "Uppercase Letters (A-Z)", val: requireUpper, set: setRequireUpper },
                      { label: "Lowercase Letters (a-z)", val: requireLower, set: setRequireLower },
                      { label: "Numerical Digits (0-9)", val: requireNumber, set: setRequireNumber },
                      { label: "Special Characters (@$!%*?&)", val: requireSpecial, set: setRequireSpecial }
                    ].map((rule, i) => (
                      <button
                        key={i}
                        onClick={() => rule.set(!rule.val)}
                        className={cn(
                          "w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-300",
                          rule.val ? "bg-primary/10 border-primary/40 text-primary" : "bg-zinc-950/30 border-zinc-900 text-zinc-500 hover:border-zinc-700"
                        )}
                      >
                         <span className="text-[10px] font-black uppercase tracking-widest">{rule.label}</span>
                         <div className={cn(
                           "w-10 h-5 rounded-full relative transition-colors",
                           rule.val ? "bg-primary" : "bg-zinc-800"
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
                className="w-full h-14 rounded-2xl text-[9px] font-black uppercase tracking-widest text-zinc-700 hover:text-white gap-2"
              >
                 <RotateCcw className="w-3 h-3" /> Reset Policy Builder
              </Button>
           </div>
        </div>

        {/* Testing & Code */}
        <div className="lg:col-span-7 flex flex-col gap-6">
           <div className="bg-[#111113] border border-zinc-900 rounded-[2.5rem] p-10 space-y-10 shadow-2xl flex-1 flex flex-col">
              <div className="space-y-6">
                 <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 flex items-center gap-3">
                       <Fingerprint className="w-4 h-4" /> Live Test Engine
                    </h3>
                    {score > 0 && (
                      <div className="flex gap-1 h-1.5 w-24">
                        {[1, 2, 3, 4, 5].map(i => (
                          <div key={i} className={cn(
                            "flex-1 rounded-full",
                            i <= (score/20) ? (score < 60 ? "bg-red-500" : score < 100 ? "bg-amber-500" : "bg-green-500") : "bg-zinc-900"
                          )} />
                        ))}
                      </div>
                    )}
                 </div>
                 
                 <M3Input 
                   type="text"
                   label="Test Password"
                   placeholder="Type a password to test against the policy..."
                   className="h-16 font-mono text-lg"
                   value={testPassword}
                   onChange={(e) => setTestPassword(e.target.value)}
                 />

                 {testPassword && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                       {[
                         { label: `Min ${minLength} chars`, ok: testResults?.length },
                         { label: "A-Z Letter", ok: testResults?.upper },
                         { label: "a-z Letter", ok: testResults?.lower },
                         { label: "0-9 Digit", ok: testResults?.number },
                         { label: "Special Char", ok: testResults?.special }
                       ].map((check, i) => (
                         <div 
                           key={i} 
                           className={cn(
                             "flex items-center gap-3 p-3 rounded-xl border transition-all",
                             check.ok ? "bg-green-500/5 border-green-500/10 text-green-500" : "bg-red-500/5 border-red-500/10 text-red-400"
                           )}
                         >
                            {check.ok ? <ShieldCheck className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                            <span className="text-[9px] font-black uppercase tracking-widest">{check.label}</span>
                         </div>
                       ))}
                    </div>
                 )}
              </div>

              <div className="flex-1 flex flex-col gap-6">
                 <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 flex items-center gap-3">
                    <Code2 className="w-4 h-4" /> Boilerplate Implementation
                 </h3>
                 <div className="flex-1 relative group">
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                       <Button size="sm" variant="ghost" className="h-8 px-3 bg-zinc-900 text-[10px] uppercase font-black tracking-widest border border-zinc-800" onClick={() => {
                         navigator.clipboard.writeText(codeSnippet);
                         toast.success("Code copied");
                       }}>
                         Copy Code
                       </Button>
                    </div>
                    <pre className="w-full h-full min-h-[200px] bg-zinc-950 border border-zinc-900 rounded-3xl p-8 font-mono text-[11px] text-zinc-500 leading-relaxed overflow-auto custom-scrollbar">
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
