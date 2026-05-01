"use client";

import React, { useState, useMemo } from "react";
import { 
  Type, 
  Trash2, 
  Settings2,
  FileText,
  AlignLeft,
  Quote,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { M3Textarea } from "@/components/ui/m3-ui";
import { toast } from "sonner";
import { cn } from "@/utility/helpers/utils";

export default function TextAnalyzerPage() {
  const [text, setText] = useState("");
  const [includeSpaces, setIncludeSpaces] = useState(true);
  const [includePunctuation, setIncludePunctuation] = useState(true);
  
  // Advanced Options
  const [excludeNumbers, setExcludeNumbers] = useState(false);
  const [excludeLowercase, setExcludeLowercase] = useState(false);
  const [excludeUppercase, setExcludeUppercase] = useState(false);
  const [customPunctuation, setCustomPunctuation] = useState(".,/#!$%^&*;:{}=\\-_`~()");
  const [excludedWords, setExcludedWords] = useState("");

  const stats = useMemo(() => {
    const trimmedText = text.trim();
    
    // Character logic
    let processedCharText = text;
    
    if (!includeSpaces) {
      processedCharText = processedCharText.replace(/\s/g, "");
    }
    
    if (!includePunctuation) {
      // Escape special regex characters in custom punctuation
      const escapedPunc = customPunctuation.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      processedCharText = processedCharText.replace(new RegExp(`[${escapedPunc}]`, 'g'), "");
    }

    if (excludeNumbers) {
      processedCharText = processedCharText.replace(/[0-9]/g, "");
    }

    if (excludeLowercase) {
      processedCharText = processedCharText.replace(/[a-z]/g, "");
    }

    if (excludeUppercase) {
      processedCharText = processedCharText.replace(/[A-Z]/g, "");
    }

    // Word logic
    let words = trimmedText ? trimmedText.split(/\s+/).filter(w => w.length > 0) : [];
    
    if (excludedWords.trim()) {
      const stopWords = excludedWords.split(/[,|\s]+/).map(w => w.trim().toLowerCase()).filter(w => w.length > 0);
      words = words.filter(w => !stopWords.includes(w.toLowerCase()));
    }

    // Sentence logic
    const sentenceCount = trimmedText ? text.split(/[.!?]+/).filter(s => s.trim().length > 0).length : 0;

    // Paragraph logic
    const paragraphCount = trimmedText ? text.split(/\n+/).filter(p => p.trim().length > 0).length : 0;

    return {
      characters: processedCharText.length,
      words: words.length,
      sentences: sentenceCount,
      paragraphs: paragraphCount,
    };
  }, [text, includeSpaces, includePunctuation, excludeNumbers, excludeLowercase, excludeUppercase, customPunctuation, excludedWords]);

  const clear = () => {
    setText("");
    toast.success("Text cleared");
  };

  const statCards = [
    { label: "Characters", value: stats.characters, icon: <Type className="w-5 h-5" />, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Words", value: stats.words, icon: <FileText className="w-5 h-5" />, color: "text-primary", bg: "bg-primary/10" },
    { label: "Sentences", value: stats.sentences, icon: <Quote className="w-5 h-5" />, color: "text-green-500", bg: "bg-green-500/10" },
    { label: "Paragraphs", value: stats.paragraphs, icon: <AlignLeft className="w-5 h-5" />, color: "text-amber-500", bg: "bg-amber-500/10" },
  ];

  const ToggleButton = ({ active, onClick, label, icon: Icon }: any) => (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-300",
        active 
          ? "bg-primary/5 border-primary/30 text-white" 
          : "bg-zinc-950/50 border-zinc-800 text-zinc-500"
      )}
    >
      <div className="flex items-center gap-3">
        {active ? <CheckCircle2 className="w-4 h-4 text-primary" /> : <AlertCircle className="w-4 h-4 text-zinc-700" />}
        <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
      </div>
      <div className={cn(
        "w-10 h-5 rounded-full relative transition-colors",
        active ? "bg-primary" : "bg-zinc-800"
      )}>
        <div className={cn(
          "absolute top-1 w-3 h-3 rounded-full bg-white transition-all",
          active ? "right-1" : "left-1"
        )} />
      </div>
    </button>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Section */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-[#161618] border border-zinc-800 rounded-[2.5rem] p-8 space-y-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-primary" />
                </div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Input Text</h3>
              </div>
              <Button 
                onClick={clear}
                variant="ghost" 
                size="sm"
                className="rounded-full text-[10px] font-bold uppercase tracking-widest text-zinc-600 hover:text-red-500 hover:bg-red-500/5 transition-all"
              >
                <Trash2 className="w-3 h-3 mr-2" /> Clear
              </Button>
            </div>

            <M3Textarea 
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste or type your text here for deep analysis..."
              className="min-h-[400px] font-medium text-lg leading-relaxed placeholder:text-zinc-700"
            />
          </div>

          {/* Advanced Options Section */}
          <div className="bg-[#161618] border border-zinc-800 rounded-[2.5rem] p-8 space-y-8 shadow-2xl">
             <div className="flex items-center gap-3 px-2">
                <Settings2 className="w-5 h-5 text-primary" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Advanced Analysis Options</h3>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                   <div className="space-y-4">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Character Filters</h4>
                      <ToggleButton active={excludeNumbers} onClick={() => setExcludeNumbers(!excludeNumbers)} label="Exclude Numbers (0-9)" />
                      <ToggleButton active={excludeLowercase} onClick={() => setExcludeLowercase(!excludeLowercase)} label="Exclude Lowercase (a-z)" />
                      <ToggleButton active={excludeUppercase} onClick={() => setExcludeUppercase(!excludeUppercase)} label="Exclude Uppercase (A-Z)" />
                   </div>
                </div>

                <div className="space-y-6">
                   <div className="space-y-4">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Custom Exclusions</h4>
                      <div className="space-y-2">
                         <label className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600 ml-1">Edit Punctuation Set</label>
                         <input 
                            type="text" 
                            value={customPunctuation}
                            onChange={(e) => setCustomPunctuation(e.target.value)}
                            className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-300 focus:outline-none focus:ring-1 focus:ring-primary/50"
                         />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600 ml-1">Exclude Specific Words (comma separated)</label>
                         <textarea 
                            value={excludedWords}
                            onChange={(e) => setExcludedWords(e.target.value)}
                            placeholder="e.g. the, and, or..."
                            className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-300 focus:outline-none focus:ring-1 focus:ring-primary/50 min-h-[80px] resize-none"
                         />
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* Sidebar Stats */}
        <div className="lg:col-span-4 space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            {statCards.map((card) => (
              <div key={card.label} className="bg-[#161618] border border-zinc-800 rounded-3xl p-6 shadow-xl flex flex-col items-center justify-center gap-4 text-center group hover:border-primary/30 transition-all">
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner transition-transform group-hover:scale-110", card.bg)}>
                  <div className={card.color}>{card.icon}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-black text-white font-mono">{card.value}</div>
                  <div className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">{card.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Analysis Panel */}
          <div className="bg-[#161618] border border-zinc-800 rounded-[2.5rem] p-8 space-y-8 shadow-2xl">
            <div className="flex items-center gap-3 px-2">
              <Settings2 className="w-4 h-4 text-primary" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Quick Filters</h3>
            </div>

            <div className="space-y-4">
              <ToggleButton active={includeSpaces} onClick={() => setIncludeSpaces(!includeSpaces)} label="Include Spaces" />
              <ToggleButton active={includePunctuation} onClick={() => setIncludePunctuation(!includePunctuation)} label="Include Punctuation" />
            </div>

            <div className="bg-zinc-900/30 border border-zinc-800/50 p-6 rounded-3xl space-y-3">
               <div className="flex items-center gap-3 text-zinc-500 font-black uppercase tracking-widest text-[9px]">
                  <AlertCircle className="w-3 h-3" /> Note
               </div>
               <p className="text-[10px] text-zinc-600 leading-relaxed font-medium italic">
                 Character count updates in real-time based on your selected filters and advanced exclusions.
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
