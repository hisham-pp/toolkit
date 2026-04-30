"use client";

import { useState, useEffect } from "react";
import { TOOLS } from "@/lib/tools-config";
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
import { cn } from "@/lib/utils";

const PSK_PRESETS = [
  { label: "WPA2 (64 Character Hex)", length: 64, type: "hex" },
  { label: "WPA2 (160-bit ASCII)", length: 20, type: "ascii" },
  { label: "IPSec (256-bit Hex)", length: 64, type: "hex" },
  { label: "VPN (128-bit Base64)", length: 22, type: "base64" },
  { label: "Custom Key", length: 32, type: "ascii" },
];

export default function PskGeneratorPage() {
  const tool = TOOLS.find(t => t.id === "psk-generator")!;
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
    <div className="flex flex-col h-full max-w-5xl mx-auto gap-8 pb-20">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black text-white tracking-tight uppercase italic">{tool.name}</h1>
        <p className="text-zinc-500 font-medium uppercase tracking-widest text-[10px]">{tool.description}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
        {/* Controls */}
        <div className="lg:col-span-5 flex flex-col gap-6">
           <div className="bg-[#161618] border border-zinc-800 rounded-[2.5rem] p-8 space-y-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              
              <div className="space-y-6">
                 <M3Select 
                   label="Preset Protocols"
                   value={PSK_PRESETS.find(p => p.length === length && p.type === type)?.label || "Custom Key"}
                   onChange={(val) => {
                     const preset = PSK_PRESETS.find(p => p.label === val);
                     if (preset) applyPreset(preset);
                   }}
                   options={PSK_PRESETS.map(p => ({ label: p.label, value: p.label }))}
                 />

                 <div className="space-y-3">
                    <div className="flex justify-between items-center px-1">
                       <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Key Length</label>
                       <span className="text-xl font-black text-primary">{length}</span>
                    </div>
                    <input 
                      type="range" 
                      min="8" 
                      max="128" 
                      step="4"
                      value={length}
                      onChange={(e) => setLength(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-zinc-900 rounded-full appearance-none cursor-pointer accent-primary"
                    />
                 </div>

                 <M3Select 
                   label="Key Type / Encoding"
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
                    Regenerate
                 </Button>
                 <Button 
                   onClick={copy}
                   variant="outline"
                   className="h-16 w-16 rounded-2xl border-zinc-800 text-zinc-600 hover:text-white"
                 >
                    <Copy className="w-5 h-5" />
                 </Button>
              </div>
           </div>

           <div className="bg-amber-500/5 border border-amber-500/10 p-5 rounded-3xl flex gap-4 items-start">
              <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                 <p className="text-[10px] font-black uppercase tracking-widest text-amber-500">Cryptographically Secure</p>
                 <p className="text-[11px] text-zinc-500 leading-relaxed font-medium">
                   This generator uses <code>window.crypto.getRandomValues</code> for high-entropy key generation, preventing predictability in production environments.
                 </p>
              </div>
           </div>
        </div>

        {/* Result Area */}
        <div className="lg:col-span-7 flex flex-col gap-6">
           <div className="flex items-center justify-between px-2">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 flex items-center gap-3">
                 <Terminal className="w-3 h-3" /> Generated Key Output
              </h3>
              <div className="bg-zinc-900/50 px-3 py-1 rounded-full border border-zinc-800">
                 <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
                    Entropy: {(length * (type === "hex" ? 4 : type === "base64" ? 6 : 6.5)).toFixed(0)} bits
                 </span>
              </div>
           </div>

           <div className="flex-1 bg-zinc-950 border border-zinc-900 rounded-[2.5rem] p-10 flex flex-col items-center justify-center relative group overflow-hidden min-h-[300px]">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
              
              <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                 <Wifi className="w-64 h-64 text-primary" />
              </div>

              <div className={cn(
                "w-full font-mono text-2xl md:text-3xl text-zinc-300 leading-tight break-all text-center tracking-tighter transition-all duration-300",
                isGenerating ? "blur-sm opacity-50 scale-95" : "blur-0 opacity-100 scale-100"
              )}>
                 {key}
              </div>

              <div className="mt-12 flex flex-wrap gap-4 justify-center">
                 <Button 
                   onClick={copy}
                   variant="ghost"
                   className="h-12 px-8 rounded-xl text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/10 border border-primary/20"
                 >
                    <Copy className="w-4 h-4 mr-2" /> Copy to Clipboard
                 </Button>
                 <Button 
                   onClick={downloadKey}
                   variant="ghost"
                   className="h-12 px-8 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-white/5 border border-white/10"
                 >
                    <Download className="w-4 h-4 mr-2" /> Download .txt
                 </Button>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-zinc-950/50 border border-zinc-900 p-6 rounded-3xl space-y-3">
                 <div className="flex items-center gap-3 text-primary font-black uppercase tracking-widest text-[10px]">
                    <Zap className="w-4 h-4" /> WPA2 Requirement
                 </div>
                 <p className="text-[11px] text-zinc-500 leading-relaxed">
                   WPA2 personal passwords should be at least 8 characters, but 64-character hexadecimal keys provide the maximum security level against brute-force attacks.
                 </p>
              </div>
              <div className="bg-zinc-950/50 border border-zinc-900 p-6 rounded-3xl space-y-3">
                 <div className="flex items-center gap-3 text-green-500 font-black uppercase tracking-widest text-[10px]">
                    <ShieldCheck className="w-4 h-4" /> IPSec / VPN
                 </div>
                 <p className="text-[11px] text-zinc-500 leading-relaxed">
                   Modern VPN protocols like WireGuard or IPSec IKEv2 often require 256-bit or 128-bit pre-shared keys for tunnel authentication.
                 </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
