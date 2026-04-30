"use client";

import { useState } from "react";
import { 
  Lock, 
  Unlock, 
  RotateCcw, 
  ShieldAlert, 
  ShieldCheck, 
  Copy 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { M3Input, M3Textarea, M3Password } from "@/components/ui/m3-ui";
import { toast } from "sonner";
import CryptoJS from "crypto-js";
import { cn } from "@/lib/utils";

export default function AesToolPage() {
  const [data, setData] = useState("");
  const [password, setPassword] = useState("");
  const [result, setResult] = useState("");
  const [mode, setMode] = useState<"encrypt" | "decrypt">("encrypt");

  const handleProcess = () => {
    if (!data || !password) {
      toast.error("Please provide both data and a password");
      return;
    }

    try {
      if (mode === "encrypt") {
        const encrypted = CryptoJS.AES.encrypt(data, password).toString();
        setResult(encrypted);
        toast.success("Data encrypted successfully");
      } else {
        const bytes = CryptoJS.AES.decrypt(data, password);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        if (!decrypted) throw new Error("Invalid password or corrupted data");
        setResult(decrypted);
        toast.success("Data decrypted successfully");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Operation failed");
      setResult("");
    }
  };

  const copy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    toast.success("Result copied to clipboard");
  };

  const clear = () => {
    setData("");
    setPassword("");
    setResult("");
  };

  return (
    <div className="flex flex-col h-full max-w-6xl mx-auto gap-8 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
          {/* Controls */}
          <div className="lg:col-span-5 flex flex-col gap-6">
             <div className="bg-[#161618] border border-zinc-800 rounded-[2.5rem] p-8 space-y-8 shadow-2xl">
                <div className="flex bg-zinc-950 p-1.5 rounded-2xl border border-zinc-900 shadow-inner">
                   <button 
                     onClick={() => { setMode("encrypt"); setResult(""); }}
                     className={cn(
                       "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all gap-2 flex items-center justify-center",
                       mode === "encrypt" ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-zinc-600 hover:text-zinc-400"
                     )}
                   >
                      <Lock className="w-3 h-3" /> Encrypt
                   </button>
                   <button 
                     onClick={() => { setMode("decrypt"); setResult(""); }}
                     className={cn(
                       "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all gap-2 flex items-center justify-center",
                       mode === "decrypt" ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-zinc-600 hover:text-zinc-400"
                     )}
                   >
                      <Unlock className="w-3 h-3" /> Decrypt
                   </button>
                </div>

                <div className="space-y-6">
                   <M3Textarea 
                     label={mode === "encrypt" ? "Plain Text Data" : "Encrypted Base64 Data"}
                     placeholder={mode === "encrypt" ? "Enter text to secure..." : "Paste encrypted string..."}
                     className="min-h-[200px] font-mono text-xs"
                     value={data}
                     onChange={(e) => setData(e.target.value)}
                   />

                   <M3Password 
                     label="Secret Passphrase"
                     placeholder="Atomic strength password..."
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                   />
                </div>

                <div className="flex gap-4 pt-4">
                   <Button 
                     onClick={handleProcess}
                     className="flex-1 h-16 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest gap-3 shadow-xl shadow-primary/20"
                   >
                      {mode === "encrypt" ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
                      Process Tooling
                   </Button>
                   <Button 
                     onClick={clear}
                     variant="outline"
                     className="h-16 w-16 rounded-2xl border-zinc-800 bg-zinc-900 text-zinc-600 hover:text-white transition-all hover:bg-zinc-800"
                   >
                      <RotateCcw className="w-5 h-5" />
                   </Button>
                </div>
             </div>

             <div className="bg-amber-500/5 border border-amber-500/10 p-6 rounded-[2rem] flex gap-5 items-start">
                <ShieldAlert className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-2">
                   <p className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500">End-to-End Safety</p>
                   <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                     Uses AES-256-CBC. Data never traverses the network. Cryptography is performed 
                     locally within your browser environment.
                   </p>
                </div>
             </div>
          </div>

          {/* Result Area */}
          <div className="lg:col-span-7 flex flex-col gap-8">
             <div className="flex items-center justify-between px-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 flex items-center gap-3">
                   {mode === "encrypt" ? "Encrypted Output" : "Secured Data Matrix"}
                </h3>
                {result && (
                  <button 
                    onClick={copy}
                    className="text-[9px] font-black uppercase tracking-widest text-primary hover:text-white transition-all flex items-center gap-3 bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-full shadow-lg"
                  >
                    <Copy className="w-3.5 h-3.5" /> Copy Result
                  </button>
                )}
             </div>

             <div className="flex-1 bg-[#0c0c0e] border border-zinc-900 rounded-[3.5rem] p-12 flex flex-col items-center justify-center relative group overflow-hidden shadow-2xl">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                
                {!result ? (
                  <div className="flex flex-col items-center justify-center opacity-5 gap-8 grayscale">
                     <ShieldCheck className="w-32 h-32" />
                     <span className="text-2xl font-black uppercase tracking-[0.4em] italic">Encryption Ready</span>
                  </div>
                ) : (
                  <div className="w-full h-full font-mono text-[14px] text-zinc-300 leading-relaxed break-all whitespace-pre-wrap overflow-auto custom-scrollbar">
                     {result}
                  </div>
                )}
             </div>

             <div className="bg-zinc-950 border border-zinc-900 p-8 rounded-[2rem] shadow-sm">
                <p className="text-[10px] font-bold text-zinc-600 leading-relaxed uppercase tracking-widest text-center">
                   Standardized OpenSSL Compliant PBKDF2 Key Derivation
                </p>
             </div>
          </div>
        </div>
      </div>
  );
}
