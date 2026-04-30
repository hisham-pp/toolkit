"use client";

import React, { useState, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";
import { TOOLS } from "@/lib/tools-config";
import { Copy, Check, RotateCcw, ShieldCheck, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function PasswordGeneratorTool() {
  const tool = TOOLS.find((t) => t.id === "password-gen")!;
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
    <ToolLayout tool={tool}>
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="bg-[#161618] border border-zinc-800 rounded-3xl p-8 space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Key className="w-32 h-32" />
          </div>

          {/* Password Result */}
          <div className="relative group">
            <div className="w-full h-20 bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center px-8 font-mono text-2xl text-primary overflow-x-auto whitespace-nowrap scrollbar-hide">
              {password}
            </div>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2 p-1 bg-zinc-950/80 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
              <Button size="icon" variant="ghost" onClick={generate}>
                <RotateCcw className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="ghost" onClick={handleCopy}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Password Length: {length}</label>
              </div>
              <input 
                type="range" 
                min="8" 
                max="64" 
                value={length} 
                onChange={(e) => setLength(parseInt(e.target.value))}
                className="w-full accent-primary bg-zinc-800 rounded-lg h-2 appearance-none cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {Object.entries(options).map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => setOptions({ ...options, [key]: !value })}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                    value ? "bg-primary/10 border-primary/40 text-white" : "bg-zinc-900/50 border-zinc-800 text-zinc-500 hover:border-zinc-700"
                  }`}
                >
                  <span className="text-xs font-bold uppercase tracking-wider">{key}</span>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${value ? "bg-primary border-primary" : "border-zinc-700"}`}>
                    {value && <Check className="w-3 h-3 text-white" />}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <Button onClick={generate} className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-bold text-lg gap-2">
            Generate New Password
          </Button>
        </div>
      </div>
    </ToolLayout>
  );
}
