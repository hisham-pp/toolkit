"use client";

import React, { useState, useEffect } from "react";
import { Copy, Check, Hash, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import CryptoJS from "crypto-js";

export default function HashGeneratorTool() {
  const [input, setInput] = useState("");
  const [hashes, setHashes] = useState({
    md5: "",
    sha1: "",
    sha256: "",
    sha512: "",
  });

  useEffect(() => {
    if (!input) {
      setHashes({ md5: "", sha1: "", sha256: "", sha512: "" });
      return;
    }
    setHashes({
      md5: CryptoJS.MD5(input).toString(),
      sha1: CryptoJS.SHA1(input).toString(),
      sha256: CryptoJS.SHA256(input).toString(),
      sha512: CryptoJS.SHA512(input).toString(),
    });
  }, [input]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Hash copied to clipboard");
  };

  return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
        <div className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-500">Input Text</h2>
          <Textarea
            placeholder="Enter text to generate hashes..."
            className="min-h-[400px] bg-[#161618] border-zinc-800 focus-visible:ring-primary/20 transition-all font-mono text-sm resize-none"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>

        <div className="space-y-6">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-500">Output Hashes</h2>
          <div className="space-y-4">
            {Object.entries(hashes).map(([algo, hash]) => (
              <div key={algo} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">{algo}</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleCopy(hash)} 
                    disabled={!hash}
                    className="h-6 text-[10px] px-2 hover:bg-zinc-800"
                  >
                    <Copy className="w-3 h-3 mr-1.5" />
                    Copy
                  </Button>
                </div>
                <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-lg font-mono text-xs text-zinc-300 break-all min-h-[40px] flex items-center">
                  {hash || <span className="text-zinc-700 italic">Waiting for input...</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
  );
}
