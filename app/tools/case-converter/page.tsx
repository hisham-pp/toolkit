"use client";

import { useState, useEffect } from "react";
import { 
  Type, 
  Copy, 
  Trash2, 
  ArrowRightLeft,
  Settings2,
  CaseSensitive,
  Terminal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { M3Input, M3Textarea } from "@/components/ui/m3-ui";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type CaseType = "camel" | "snake" | "kebab" | "pascal" | "constant" | "sentence" | "title" | "lower" | "upper";

export default function CaseConverterPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [activeCase, setActiveCase] = useState<CaseType>("camel");

  const convertCase = (text: string, type: CaseType): string => {
    if (!text) return "";

    // Normalize: split by spaces, underscores, hyphens, and camelCase boundaries
    const words = text
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/[_-]/g, " ")
      .toLowerCase()
      .split(/\s+/)
      .filter(w => w.length > 0);

    if (words.length === 0) return "";

    switch (type) {
      case "camel":
        return words[0] + words.slice(1).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join("");
      case "pascal":
        return words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join("");
      case "snake":
        return words.join("_");
      case "kebab":
        return words.join("-");
      case "constant":
        return words.join("_").toUpperCase();
      case "sentence":
        const sentence = words.join(" ");
        return sentence.charAt(0).toUpperCase() + sentence.slice(1);
      case "title":
        return words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
      case "lower":
        return text.toLowerCase();
      case "upper":
        return text.toUpperCase();
      default:
        return text;
    }
  };

  useEffect(() => {
    setOutput(convertCase(input, activeCase));
  }, [input, activeCase]);

  const copyToClipboard = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    toast.success("Converted text copied!");
  };

  const clear = () => {
    setInput("");
    toast.success("Input cleared");
  };

  const caseButtons: { label: string; value: CaseType; example: string }[] = [
    { label: "camelCase", value: "camel", example: "helloWorld" },
    { label: "PascalCase", value: "pascal", example: "HelloWorld" },
    { label: "snake_case", value: "snake", example: "hello_world" },
    { label: "kebab-case", value: "kebab", example: "hello-world" },
    { label: "CONSTANT_CASE", value: "constant", example: "HELLO_WORLD" },
    { label: "Sentence case", value: "sentence", example: "Hello world" },
    { label: "Title Case", value: "title", example: "Hello World" },
    { label: "lowercase", value: "lower", example: "hello world" },
    { label: "UPPERCASE", value: "upper", example: "HELLO WORLD" },
  ];

  return (
      <div className="max-w-5xl mx-auto space-y-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Input Section */}
          <div className="lg:col-span-12">
            <div className="bg-[#161618] border border-zinc-800 rounded-[2.5rem] p-8 space-y-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Type className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Input Text</h3>
                </div>
                <Button 
                  onClick={clear}
                  variant="ghost" 
                  size="sm"
                  className="rounded-full text-[10px] font-bold uppercase tracking-widest text-zinc-600 hover:text-red-500 hover:bg-red-500/5"
                >
                  <Trash2 className="w-3 h-3 mr-2" /> Clear
                </Button>
              </div>

              <M3Textarea 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter text to convert (e.g. hello world, some_variable, MyComponent)..."
                className="min-h-[160px] font-medium text-lg leading-relaxed placeholder:text-zinc-700"
              />
            </div>
          </div>

          {/* Controls & Output */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#161618] border border-zinc-800 rounded-[2.5rem] p-8 space-y-8 shadow-2xl">
              <div className="flex items-center gap-3 px-2">
                <Settings2 className="w-4 h-4 text-primary" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Target Case</h3>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {caseButtons.map((btn) => (
                  <button
                    key={btn.value}
                    onClick={() => setActiveCase(btn.value)}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-2xl transition-all duration-300 group",
                      activeCase === btn.value 
                        ? "bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]" 
                        : "bg-zinc-950/50 text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300 border border-zinc-800/50"
                    )}
                  >
                    <span className="text-[11px] font-black uppercase tracking-widest">{btn.label}</span>
                    <span className={cn(
                      "text-[10px] font-mono opacity-60",
                      activeCase === btn.value ? "text-white" : "text-zinc-600"
                    )}>
                      {btn.example}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
             <div className="bg-[#161618] border border-zinc-800 rounded-[2.5rem] p-8 space-y-6 shadow-2xl min-h-full flex flex-col">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-green-500/10 flex items-center justify-center">
                      <ArrowRightLeft className="w-4 h-4 text-green-500" />
                    </div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Converted Result</h3>
                  </div>
                </div>

                <div className="flex-1 bg-zinc-950/50 border border-zinc-900/50 rounded-3xl p-8 flex items-center justify-center relative group min-h-[200px]">
                   <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                   
                   {output ? (
                     <div className="w-full text-center space-y-6">
                        <div className="text-2xl md:text-3xl font-bold text-zinc-200 break-all leading-tight">
                          {output}
                        </div>
                        <Button 
                          onClick={copyToClipboard}
                          className="h-12 px-8 rounded-xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest gap-3 shadow-xl shadow-primary/20"
                        >
                          <Copy className="w-4 h-4" /> Copy Output
                        </Button>
                     </div>
                   ) : (
                     <div className="text-center space-y-4">
                        <CaseSensitive className="w-12 h-12 text-zinc-800 mx-auto opacity-20" />
                        <p className="text-zinc-600 font-bold uppercase tracking-widest text-[10px]">Result will appear here</p>
                     </div>
                   )}
                </div>

                <div className="bg-zinc-900/30 border border-zinc-800/50 p-5 rounded-3xl space-y-3">
                   <div className="flex items-center gap-3 text-primary font-black uppercase tracking-widest text-[9px]">
                      <Terminal className="w-3 h-3" /> Quick Tip
                   </div>
                   <p className="text-[11px] text-zinc-500 leading-relaxed font-medium">
                     This tool handles messy inputs! It automatically detects word boundaries in camelCase, snake_case, and space-separated text to ensure clean conversion between any case format.
                   </p>
                </div>
             </div>
          </div>
        </div>
      </div>
  );
}
