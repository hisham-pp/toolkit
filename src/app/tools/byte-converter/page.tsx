"use client";

import React, { useState, useEffect, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { ToolRegistry } from "@/utility/constants/tools";
import { M3Input, M3Select } from "@/components/ui/m3-ui";
import { Button } from "@/components/ui/button";
import { Copy, Trash2, Check, HardDrive, Zap, Info } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/utility/helpers/utils";

const UNITS = [
  { label: "Bits (b)", value: "b", factor: 0.125 },
  { label: "Bytes (B)", value: "B", factor: 1 },
  { label: "Kilobytes (KB)", value: "KB", factor: 1000 },
  { label: "Megabytes (MB)", value: "MB", factor: 1000 ** 2 },
  { label: "Gigabytes (GB)", value: "GB", factor: 1000 ** 3 },
  { label: "Terabytes (TB)", value: "TB", factor: 1000 ** 4 },
  { label: "Petabytes (PB)", value: "PB", factor: 1000 ** 5 },
  { label: "Kibibytes (KiB)", value: "KiB", factor: 1024 },
  { label: "Mebibytes (MiB)", value: "MiB", factor: 1024 ** 2 },
  { label: "Gibibytes (GiB)", value: "GiB", factor: 1024 ** 3 },
  { label: "Tebibytes (TiB)", value: "TiB", factor: 1024 ** 4 },
  { label: "Pebibytes (PiB)", value: "PiB", factor: 1024 ** 5 },
];

export default function ByteConverter() {
  const tool = ToolRegistry.getById("byte-converter")!;
  const [inputValue, setInputValue] = useState("1");
  const [inputUnit, setInputUnit] = useState("MB");
  const [isCopied, setIsCopied] = useState<string | null>(null);

  const conversions = useMemo(() => {
    const num = parseFloat(inputValue);
    if (isNaN(num)) return [];

    const sourceUnit = UNITS.find((u) => u.value === inputUnit)!;
    const valueInBytes = num * sourceUnit.factor;

    return UNITS.map((u) => ({
      ...u,
      result: valueInBytes / u.factor,
    }));
  }, [inputValue, inputUnit]);

  const handleCopy = (val: string, label: string) => {
    navigator.clipboard.writeText(val);
    setIsCopied(label);
    toast.success(`Copied ${label}`);
    setTimeout(() => setIsCopied(null), 2000);
  };

  const formatNumber = (num: number) => {
    if (num === 0) return "0";
    if (num < 0.000001 || num > 1000000000000) {
      return num.toExponential(6);
    }
    return new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 10,
    }).format(num);
  };

  return (
    <ToolLayout tool={tool}>
      <div className="flex flex-col h-full gap-8 animate-in fade-in duration-700">
        {/* Input Controls */}
        <div className="bg-zinc-950/30 border border-zinc-900 rounded-[2.5rem] p-8 md:p-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
            <div className="md:col-span-6">
              <M3Input
                label="Value to Convert"
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="0.00"
                icon={<Zap className="w-4 h-4 text-primary" />}
              />
            </div>
            <div className="md:col-span-4">
              <M3Select
                label="Source Unit"
                value={inputUnit}
                onChange={setInputUnit}
                options={UNITS.map((u) => ({ label: u.label, value: u.value }))}
              />
            </div>
            <div className="md:col-span-2">
              <Button
                variant="outline"
                className="h-14 w-full rounded-2xl border-zinc-800 bg-zinc-950/50 hover:bg-zinc-900 text-zinc-400 hover:text-white"
                onClick={() => setInputValue("")}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear
              </Button>
            </div>
          </div>

          <div className="mt-8 flex items-center gap-3 p-4 bg-primary/5 border border-primary/10 rounded-2xl">
            <Info className="w-4 h-4 text-primary shrink-0" />
            <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest leading-relaxed">
              Standard (SI) units use <span className="text-primary font-black italic">1000</span> as base. 
              Binary (IEC) units like <span className="text-primary font-black italic">KiB/MiB</span> use <span className="text-primary font-black italic">1024</span>.
            </p>
          </div>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {conversions.map((conv) => (
            <div
              key={conv.value}
              className={cn(
                "group p-6 rounded-3xl border transition-all duration-500 flex flex-col justify-between gap-4",
                conv.value === inputUnit 
                  ? "bg-primary/10 border-primary/30 ring-1 ring-primary/20" 
                  : "bg-zinc-950/20 border-zinc-900 hover:border-zinc-800 hover:bg-zinc-900/40"
              )}
            >
              <div className="flex items-center justify-between">
                <span className={cn(
                  "text-[10px] font-black uppercase tracking-[0.2em]",
                  conv.value === inputUnit ? "text-primary" : "text-zinc-600"
                )}>
                  {conv.label}
                </span>
                <HardDrive className={cn(
                  "w-3 h-3 transition-colors",
                  conv.value === inputUnit ? "text-primary" : "text-zinc-800 group-hover:text-zinc-600"
                )} />
              </div>
              
              <div className="space-y-1">
                <div className="text-lg font-black tracking-tight text-white truncate">
                  {formatNumber(conv.result)}
                </div>
                <div className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">
                  {conv.value}
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="w-full mt-2 rounded-xl bg-zinc-900/50 border border-zinc-800/50 opacity-0 group-hover:opacity-100 transition-all text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white hover:border-primary"
                onClick={() => handleCopy(conv.result.toString(), conv.label)}
              >
                {isCopied === conv.label ? (
                  <Check className="w-3 h-3 mr-2" />
                ) : (
                  <Copy className="w-3 h-3 mr-2" />
                )}
                {isCopied === conv.label ? "Copied" : "Copy Value"}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </ToolLayout>
  );
}
