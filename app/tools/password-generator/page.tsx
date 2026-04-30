"use client";

import { useEffect, useState } from "react";
import { Copy, Check, RotateCcw, ShieldCheck, Key, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function PasswordGeneratorTool() {
  const [password, setPassword] = useState("");
  const [length, setLength] = useState(16);
  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  });

  const generate = () => {
    const charset = {
      uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
      lowercase: "abcdefghijklmnopqrstuvwxyz",
      numbers: "0123456789",
      symbols: "!@#$%^&*()_+~`|}{[]:;?><,./-=",
    };

    let characters = "";
    if (options.uppercase) characters += charset.uppercase;
    if (options.lowercase) characters += charset.lowercase;
    if (options.numbers) characters += charset.numbers;
    if (options.symbols) characters += charset.symbols;

    if (!characters) {
      toast.error("Please select at least one character type");
      return;
    }

    let result = "";
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    setPassword(result);
  };

  useEffect(() => {
    generate();
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(password);
    toast.success("Password copied to clipboard");
  };

  return (
    <>
      <div className="max-w-4xl mx-auto space-y-10 pb-20 pt-6">
        <div className="bg-[#161618] border border-zinc-800 rounded-[3.5rem] p-10 md:p-14 space-y-12 shadow-2xl relative overflow-hidden text-white">
          <div className="absolute top-0 right-0 p-14 opacity-5 rotate-12 transition-transform duration-700 hover:rotate-0">
            <Key className="w-64 h-64" />
          </div>

          <div className="space-y-10 relative z-10">
            {/* Password Result */}
            <div className="relative group">
               <div className="flex items-center gap-3 mb-4 px-2">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 italic">Synthetic Entropy Stream</span>
               </div>
               <div className="w-full h-24 bg-zinc-950 border border-zinc-900 rounded-[2rem] flex items-center px-10 font-mono text-3xl text-primary overflow-x-auto whitespace-nowrap custom-scrollbar shadow-inner tracking-tight">
                 {password}
               </div>
               <div className="absolute right-4 top-[58px] flex gap-3 p-1.5 bg-zinc-900 border border-zinc-800 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-2xl translate-x-2 group-hover:translate-x-0">
                 <Button size="icon" variant="ghost" className="h-10 w-10 hover:bg-zinc-800 rounded-xl transition-colors" onClick={generate}>
                   <RotateCcw className="w-5 h-5 text-zinc-500 hover:text-primary transition-colors" />
                 </Button>
                 <Button size="icon" variant="ghost" className="h-10 w-10 hover:bg-zinc-800 rounded-xl transition-colors" onClick={handleCopy}>
                   <Copy className="w-5 h-5 text-zinc-500 hover:text-white transition-colors" />
                 </Button>
               </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
               <div className="space-y-8">
                  <div className="flex items-center gap-4 text-primary mb-2">
                     <div className="p-2 bg-primary/10 rounded-xl">
                        <Settings2 className="w-5 h-5 shadow-inner" />
                     </div>
                     <span className="text-[11px] font-black uppercase tracking-[0.3em]">Complexity Logic</span>
                  </div>
                  
                  <div className="space-y-6 bg-zinc-950/40 p-8 rounded-[2rem] border border-zinc-900/50">
                    <div className="space-y-4">
                      <div className="flex justify-between items-end border-b border-zinc-900 pb-2">
                        <label className="text-[11px] font-black uppercase tracking-widest text-zinc-600">Bit Length Depth</label>
                        <span className="text-2xl font-black text-primary font-mono italic">{length}</span>
                      </div>
                      <input 
                        type="range" 
                        min="8" 
                        max="64" 
                        value={length} 
                        onChange={(e) => setLength(parseInt(e.target.value))}
                        className="w-full h-2 bg-zinc-950 border border-zinc-900 rounded-full appearance-none cursor-pointer accent-primary"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {(Object.entries(options) as [keyof typeof options, boolean][]).map(([key, value]) => (
                        <button
                          key={key}
                          onClick={() => setOptions({ ...options, [key]: !value })}
                          className={cn(
                            "flex items-center justify-between p-5 rounded-2xl border transition-all duration-500",
                            value ? "bg-primary/5 border-primary/30 text-white shadow-inner" : "bg-zinc-900/40 border-zinc-800 text-zinc-600 hover:border-zinc-700"
                          )}
                        >
                          <span className="text-[10px] font-black uppercase tracking-widest">{key}</span>
                          <div className={cn(
                            "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                            value ? "bg-primary border-primary shadow-[0_0_8px_rgba(var(--primary),0.3)]" : "border-zinc-800 bg-zinc-950"
                          )}>
                            {value && <Check className="w-3.5 h-3.5 text-white stroke-[4]" />}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
               </div>

               <div className="flex flex-col justify-end space-y-8">
                  <div className="bg-zinc-950/50 rounded-3xl border border-zinc-900 p-8 space-y-4">
                    <p className="text-[11px] text-zinc-500 leading-relaxed font-medium">
                      Cryptographically secure pseudo-random number generator (CSPRNG) ensures high-entropy sequences resistant to statistical pattern analysis. 
                    </p>
                    <div className="flex gap-4">
                       <span className="text-[9px] font-black text-primary uppercase tracking-widest bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/10 italic">Zero Knowledge Protocol</span>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={generate} 
                    className="w-full h-20 rounded-[1.5rem] bg-primary hover:bg-primary/90 text-white font-black italic uppercase tracking-[0.3em] text-xl gap-5 shadow-2xl shadow-primary/20 transition-all hover:scale-[1.01] active:scale-95"
                  >
                    <RotateCcw className="w-7 h-7" /> Re-Initialize
                  </Button>
               </div>
            </div>
          </div>
        </div>
      </div>
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          height: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #27272a;
          border-radius: 10px;
        }
      `}</style>
    </>
  );
}
