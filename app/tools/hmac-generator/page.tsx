"use client";

import { useState, useEffect } from "react";
import { TOOLS } from "@/lib/tools-config";
import { 
  ShieldPlus, 
  Copy,
  Hash,
  Key,
  ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { M3Input, M3Textarea, M3Select } from "@/components/ui/m3-ui";
import { toast } from "sonner";
import CryptoJS from "crypto-js";

export default function HmacGeneratorPage() {
  const tool = TOOLS.find(t => t.id === "hmac-generator")!;
  const [input, setInput] = useState("");
  const [secret, setSecret] = useState("");
  const [algo, setAlgo] = useState("SHA256");
  const [hmac, setHmac] = useState("");

  useEffect(() => {
    if (!input || !secret) {
      setHmac("");
      return;
    }

    try {
      let hash;
      switch (algo) {
        case "MD5": hash = CryptoJS.HmacMD5(input, secret); break;
        case "SHA1": hash = CryptoJS.HmacSHA1(input, secret); break;
        case "SHA256": hash = CryptoJS.HmacSHA256(input, secret); break;
        case "SHA512": hash = CryptoJS.HmacSHA512(input, secret); break;
        default: hash = CryptoJS.HmacSHA256(input, secret);
      }
      setHmac(hash.toString());
    } catch (e) {
      console.error(e);
      setHmac("Error generating HMAC");
    }
  }, [input, secret, algo]);

  const copy = () => {
    if (!hmac) return;
    navigator.clipboard.writeText(hmac);
    toast.success("HMAC copied to clipboard");
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black text-white tracking-tight uppercase italic">{tool.name}</h1>
        <p className="text-zinc-500 font-medium uppercase tracking-widest text-[10px]">{tool.description}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        <div className="bg-[#161618] border border-zinc-800 rounded-[2.5rem] p-8 md:p-10 space-y-8 shadow-2xl">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                 <M3Textarea 
                   label="Message / Payload"
                   placeholder="Enter the message to hash..."
                   className="min-h-[140px] font-mono text-xs"
                   value={input}
                   onChange={(e) => setInput(e.target.value)}
                 />
                 <div className="flex gap-4">
                    <div className="flex-1">
                       <M3Input 
                         label="Secret Key"
                         type="password"
                         placeholder="Your secret..."
                         className="font-mono h-14"
                         value={secret}
                         onChange={(e) => setSecret(e.target.value)}
                       />
                    </div>
                    <div className="w-40">
                       <M3Select 
                         label="Algorithm"
                         value={algo}
                         onChange={setAlgo}
                         options={[
                           { label: "SHA-256", value: "SHA256" },
                           { label: "SHA-512", value: "SHA512" },
                           { label: "SHA-1", value: "SHA1" },
                           { label: "MD5", value: "MD5" },
                         ]}
                         className="h-14"
                       />
                    </div>
                 </div>
              </div>

              <div className="flex flex-col gap-6">
                  <div className="relative group flex-1">
                     <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1 mb-2 block">Generated HMAC</label>
                     <div className="w-full h-full min-h-[220px] bg-zinc-950/50 border border-zinc-800 rounded-3xl p-6 font-mono text-sm break-all text-primary leading-relaxed shadow-inner group-hover:border-primary/30 transition-all overflow-auto">
                        {hmac || <span className="text-zinc-800 italic">HMAC will appear here when message and secret are provided...</span>}
                     </div>
                  </div>
                  
                  <Button 
                    onClick={copy}
                    disabled={!hmac}
                    className="h-16 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest gap-3 shadow-xl shadow-primary/20 disabled:opacity-30"
                  >
                     <Copy className="w-5 h-5" /> Copy HMAC Signature
                  </Button>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="bg-zinc-950/50 border border-zinc-900 p-6 rounded-3xl space-y-3">
              <div className="flex items-center gap-3 text-primary font-black uppercase tracking-widest text-[10px]">
                 <Key className="w-4 h-4" /> Why HMAC?
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed">
                HMAC provides data integrity and authenticity. It uses a cryptographic hash function in combination with a secret key. If the message or the secret changes, the HMAC will be completely different.
              </p>
           </div>
           <div className="bg-zinc-950/50 border border-zinc-900 p-6 rounded-3xl space-y-3">
              <div className="flex items-center gap-3 text-green-500 font-black uppercase tracking-widest text-[10px]">
                 <ShieldCheck className="w-4 h-4" /> Common Uses
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Commonly used in API authentication (e.g., AWS, Stripe) to verify that a request hasn't been tampered with during transit.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
