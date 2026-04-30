"use client";

import React, { useState, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";
import { TOOLS } from "@/lib/tools-config";
import { Copy, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const LOREM_WORDS = [
  "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit",
  "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore",
  "magna", "aliqua", "ut", "enim", "ad", "minim", "veniam", "quis", "nostrud",
  "exercitation", "ullamco", "laboris", "nisi", "ut", "aliquip", "ex", "ea",
  "commodo", "consequat", "duis", "aute", "irure", "dolor", "in", "reprehenderit",
  "in", "voluptate", "velit", "esse", "cillum", "dolore", "eu", "fugiat", "nulla",
  "pariatur", "excepteur", "sint", "occaecat", "cupidatat", "non", "proident",
  "sunt", "in", "culpa", "qui", "officia", "deserunt", "mollit", "anim", "id", "est", "laborum"
];

export default function LoremIpsumTool() {
  const tool = TOOLS.find((t) => t.id === "lorem-ipsum")!;
  const [output, setOutput] = useState("");
  const [paragraphs, setParagraphs] = useState(3);
  const [type, setType] = useState<"paragraphs" | "sentences" | "words">("paragraphs");

  const generate = () => {
    let result = "";
    if (type === "words") {
      result = Array.from({ length: paragraphs * 10 }, () => LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)]).join(" ");
    } else if (type === "sentences") {
      result = Array.from({ length: paragraphs * 5 }, () => {
        const sentence = Array.from({ length: 8 + Math.floor(Math.random() * 10) }, () => LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)]).join(" ");
        return sentence.charAt(0).toUpperCase() + sentence.slice(1) + ".";
      }).join(" ");
    } else {
      result = Array.from({ length: paragraphs }, () => {
        const para = Array.from({ length: 3 + Math.floor(Math.random() * 5) }, () => {
            const sentence = Array.from({ length: 8 + Math.floor(Math.random() * 10) }, () => LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)]).join(" ");
            return sentence.charAt(0).toUpperCase() + sentence.slice(1) + ".";
        }).join(" ");
        return para;
      }).join("\n\n");
    }
    setOutput(result);
  };

  useEffect(() => {
    generate();
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    toast.success("Copied to clipboard");
  };

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-[#161618] border border-zinc-800 rounded-3xl p-8 space-y-6">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 space-y-3">
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Number of {type}</label>
              <div className="flex gap-2">
                {[1, 3, 5, 10].map(n => (
                  <Button 
                    key={n} 
                    variant={paragraphs === n ? "default" : "outline"}
                    onClick={() => setParagraphs(n)}
                    className={paragraphs === n ? "bg-primary" : "bg-zinc-900 border-zinc-800"}
                  >
                    {n}
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex-1 space-y-3">
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Unit Type</label>
              <div className="flex gap-2">
                {["words", "sentences", "paragraphs"].map(t => (
                  <Button 
                    key={t} 
                    variant={type === t ? "default" : "outline"}
                    onClick={() => setType(t as any)}
                    className={type === t ? "bg-primary" : "bg-zinc-900 border-zinc-800"}
                  >
                    {t}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <Button onClick={generate} className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold">
            Generate Lorem Ipsum
          </Button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
             <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-500">Generated Text</h2>
             <Button variant="outline" size="sm" onClick={handleCopy} className="h-8 gap-2 bg-zinc-900 border-zinc-800">
               <Copy className="w-3.5 h-3.5" />
               Copy Content
             </Button>
          </div>
          <div className="p-8 bg-zinc-900/50 border border-zinc-800 rounded-2xl text-zinc-300 leading-relaxed whitespace-pre-wrap font-serif text-lg min-h-[300px]">
             {output}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
