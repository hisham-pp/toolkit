"use client";

import { useState, useEffect } from "react";
import { 
  Key, 
  Copy, 
  RotateCcw, 
  ShieldCheck, 
  ShieldAlert,
  Zap,
  RefreshCw,
  Terminal,
  Wifi,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { M3Input, M3Select } from "@/components/ui/m3-ui";
import { toast } from "sonner";
import { cn } from "@/utility/helpers/utils";

const PSK_PRESETS = [
  { label: "WPA2 (64 Character Hex)", length: 64, type: "hex" },
  { label: "WPA2 (160-bit ASCII)", length: 20, type: "ascii" },
  { label: "IPSec (256-bit Hex)", length: 64, type: "hex" },
  { label: "VPN (128-bit Base64)", length: 22, type: "base64" },
  { label: "Custom Key", length: 32, type: "ascii" },
];

export default function PskGeneratorPage() {
  const [length, setLength] = useState(32);
  const [type, setType] = useState("hex");
  const [key, setKey] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const generateKey = () => {
    setIsGenerating(true);
    let result = "";
    
    // Using window.crypto for better entropy
    const array = new Uint8Array(length);
    window.crypto.getRandomValues(array);

    if (type === "hex") {
      result = Array.from(array)
        .map(b => b.toString(16).padStart(2, "0"))
        .join("")
        .slice(0, length);
    } else if (type === "base64") {
      // For base64, we convert the byte array
      const binString = String.fromCharCode(...array);
      result = btoa(binString).slice(0, length);
    } else {
      // ASCII - limit to printable characters to ensure it's a valid PSK string
      const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+";
      result = Array.from(array)
        .map(b => charset[b % charset.length])
        .join("");
    }

    setKey(result);
    setTimeout(() => setIsGenerating(false), 300);
  };

  useEffect(() => {
    generateKey();
  }, []);

  const copy = () => {
    if (!key) return;
    navigator.clipboard.writeText(key);
    toast.success("Key copied to clipboard");
  };

  const downloadKey = () => {
    if (!key) return;
    const blob = new Blob([key], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `psk_${length}_${type}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("PSK downloaded as .txt file");
  };

  const applyPreset = (preset: typeof PSK_PRESETS[0]) => {
    setLength(preset.length);
    setType(preset.type);
    // Timeout to ensure state updates before generation
    setTimeout(generateKey, 0);
  };

  return (
    <div className="flex flex-col h-full max-w-6xl mx-auto gap-8 pt-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 flex-1">
          {/* Controls */}
          <div className="lg:col-span-5 flex flex-col gap-8">
             <div className="bg-[#161618] border border-zinc-800 rounded-[3rem] p-10 space-y-10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
                
                <div className="space-y-8">
                   <M3Select 
                     label="Preset Protocols"
                     value={PSK_PRESETS.find(p => p.length === length && p.type === type)?.label || "Custom Key"}
                     onChange={(val) => {
                       const preset = PSK_PRESETS.find(p => p.label === val);
                       if (preset) applyPreset(preset);
                     }}
                     options={PSK_PRESETS.map(p => ({ label: p.label, value: p.label }))}
                   />

                   <div className="space-y-4">
                      <div className="flex justify-between items-center px-1">
                         <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Entropy Pool (Length)</label>
                         <span className="text-2xl font-black text-primary">{length}</span>
                      </div>
                      <input 
                        type="range" 
                        min="8" 
                        max="128" 
                        step="4"
                        value={length}
                        onChange={(e) => setLength(parseInt(e.target.value))}
                        className="w-full h-2 bg-zinc-900 rounded-full appearance-none cursor-pointer accent-primary border border-zinc-800/50"
                      />
                   </div>

                   <M3Select 
                     label="Encoding Architecture"
                     value={type}
                     onChange={setType}
                     options={[
                       { label: "Hexadecimal (0-9, a-f)", value: "hex" },
                       { label: "Base64 (A-Z, a-z, 0-9, +, /)", value: "base64" },
                       { label: "ASCII Printable Chars", value: "ascii" },
                     ]}
                   />
                </div>

                <div className="flex gap-4 pt-4">
                   <Button 
                     onClick={generateKey}
                     disabled={isGenerating}
                     className="flex-1 h-16 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest gap-3 shadow-xl shadow-primary/20"
                   >
                      <RefreshCw className={cn("w-5 h-5", isGenerating && "animate-spin")} />
                      Re-Roll Entropy
                   </Button>
                   <Button 
                     onClick={copy}
                     variant="outline"
                     className="h-16 w-16 rounded-2xl border-zinc-800 text-zinc-600 hover:text-white transition-all hover:bg-zinc-800/50"
                   >
                      <Copy className="w-5 h-5" />
                   </Button>
                </div>
             </div>

             <div className="bg-amber-500/5 border border-amber-500/10 p-6 rounded-[2rem] flex gap-5 items-start">
                <ShieldAlert className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-2">
                   <p className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500">Production Warning</p>
                   <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                     Uses CSPRNG (<code>window.crypto</code>). Keys are ephemeral and never stored on server clusters. 
                     Maximum entropy is recommended for WPA3/IKEv2.
                   </p>
                </div>
             </div>
          </div>

          {/* Result Area */}
          <div className="lg:col-span-7 flex flex-col gap-8">
             <div className="flex items-center justify-between px-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 flex items-center gap-3">
                   <Terminal className="w-3 h-3 text-primary" /> Key Matrix Output
                </h3>
                <div className="bg-zinc-900/50 px-4 py-1.5 rounded-full border border-zinc-800/50 shadow-sm">
                   <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                      Pool Strength: {(length * (type === "hex" ? 4 : type === "base64" ? 6 : 6.5)).toFixed(0)} Bits
                   </span>
                </div>
             </div>

             <div className="flex-1 bg-zinc-950 border border-zinc-800 rounded-[3.5rem] p-12 flex flex-col items-center justify-center relative group overflow-hidden min-h-[400px] shadow-2xl">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                
                <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none group-hover:opacity-10 transition-all duration-1000 scale-90 group-hover:scale-100">
                   <Wifi className="w-80 h-80 text-primary" />
                </div>

                <div className={cn(
                  "w-full font-mono text-3xl md:text-4xl text-zinc-200 leading-snug break-all text-center tracking-tighter transition-all duration-500",
                  isGenerating ? "blur-md opacity-30 scale-95" : "blur-0 opacity-100 scale-100"
                )}>
                   {key}
                </div>

                <div className="mt-16 flex flex-wrap gap-4 justify-center relative z-10">
                   <button 
                     onClick={copy}
                     className="h-14 px-10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white bg-primary hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 flex items-center gap-3"
                   >
                      <Copy className="w-4 h-4" /> Deploy to Clipboard
                   </button>
                   <button 
                     onClick={downloadKey}
                     className="h-14 px-10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white bg-zinc-900/50 hover:bg-zinc-800 transition-all border border-zinc-800 flex items-center gap-3"
                   >
                      <Download className="w-4 h-4" /> Archive Local File
                   </button>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-zinc-950/50 border border-zinc-900 p-8 rounded-[2rem] space-y-4 hover:border-primary/20 transition-colors">
                   <div className="flex items-center gap-3 text-primary font-black uppercase tracking-widest text-[10px]">
                      <Zap className="w-4 h-4" /> Layer-2 Security
                   </div>
                   <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                     WPA2/WPA3 protocols require high-complexity passphrases. 
                     64-character hex keys achieve 256-bit strength, the industry gold standard.
                   </p>
                </div>
                <div className="bg-zinc-950/50 border border-zinc-900 p-8 rounded-[2rem] space-y-4 hover:border-green-500/20 transition-colors">
                   <div className="flex items-center gap-3 text-green-500 font-black uppercase tracking-widest text-[10px]">
                      <ShieldCheck className="w-4 h-4" /> Tunnel Protocols
                   </div>
                   <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                     IPSec IKEv1/v2 and WireGuard benefit from Base64 encoded keys to maximize 
                     entropy density within standard 128/256-bit requirements.
                   </p>
                </div>
             </div>
          </div>
        </div>
      </div>
    );
  }
