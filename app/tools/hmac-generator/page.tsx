"use client";

import { useState, useEffect } from "react";
import { Copy, Key, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { M3Input, M3Textarea, M3Select, M3Password } from "@/components/ui/m3-ui";
import { toast } from "sonner";
import CryptoJS from "crypto-js";

export default function HmacGeneratorPage() {
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
      <div className="flex flex-col h-full max-w-6xl mx-auto gap-8 pt-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-10">
          <div className="bg-[#161618] border border-zinc-800 rounded-[3rem] p-10 md:p-12 space-y-10 shadow-2xl overflow-hidden relative">
             <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-8">
                   <M3Textarea 
                     label="Message / Payload Data"
                     placeholder="Enter your message string..."
                     className="min-h-[180px] font-mono text-xs"
                     value={input}
                     onChange={(e) => setInput(e.target.value)}
                   />
                   <div className="flex gap-6 items-end">
                      <div className="flex-1">
                         <M3Password 
                           label="Secret Signing Key"
                           placeholder="Key for HMAC calculation..."
                           value={secret}
                           onChange={(e) => setSecret(e.target.value)}
                         />
                      </div>
                      <div className="w-52">
                         <M3Select 
                           label="Hash Method"
                           value={algo}
                           onChange={setAlgo}
                           options={[
                             { label: "SHA-256 (Native)", value: "SHA256" },
                             { label: "SHA-512 (Strong)", value: "SHA512" },
                             { label: "SHA-1 (Legacy)", value: "SHA1" },
                             { label: "MD5 (Insecure)", value: "MD5" },
                           ]}
                         />
                      </div>
                   </div>
                </div>

                <div className="flex flex-col gap-8">
                    <div className="relative group flex-1">
                       <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1 mb-3 block">HMAC Authentication Tag</label>
                       <div className="w-full h-full min-h-[260px] bg-zinc-950 border border-zinc-800 rounded-[2rem] p-8 font-mono text-xl break-all text-primary/90 leading-relaxed shadow-inner group-hover:border-primary/30 transition-all overflow-auto">
                          {hmac || <span className="text-zinc-800 italic text-sm">Calculated tag will appear here...</span>}
                       </div>
                    </div>
                    
                    <Button 
                      onClick={copy}
                      disabled={!hmac}
                      className="h-16 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest gap-3 shadow-xl shadow-primary/20 disabled:opacity-20"
                    >
                       <Copy className="w-5 h-5" /> Export Signature
                    </Button>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="bg-zinc-950/50 border border-zinc-900 p-8 rounded-[2rem] space-y-4 shadow-sm">
                <div className="flex items-center gap-3 text-primary font-black uppercase tracking-widest text-[10px]">
                   <Key className="w-4 h-4" /> Message Logic
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                  HMAC (Hash-based Message Authentication Code) ensures data integrity. 
                  It prevents tampering by mixing the input with a shared secret before hashing.
                </p>
             </div>
             <div className="bg-zinc-950/50 border border-zinc-900 p-8 rounded-[2rem] space-y-4 shadow-sm">
                <div className="flex items-center gap-3 text-green-500 font-black uppercase tracking-widest text-[10px]">
                   <ShieldCheck className="w-4 h-4" /> Trust Vectors
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                  Used extensively in Webhooks, API request signing, and multi-factor 
                  authentication protocols to verify the source origin of a request.
                </p>
             </div>
          </div>
        </div>
      </div>
  );
}
