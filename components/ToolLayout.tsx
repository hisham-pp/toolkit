"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Home, History, Trash2, Copy, Check, RotateCcw } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { Tool } from "@/lib/tools-config";

interface ToolLayoutProps {
  tool: Tool;
  children: React.ReactNode;
}

export default function ToolLayout({ tool, children }: ToolLayoutProps) {
  return (
    <div className="min-h-screen bg-[#09090B] text-zinc-400 flex flex-col font-sans">
      {/* Tool Header */}
      <header className="border-b border-zinc-700/50 bg-[#09090B]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/" 
              className="p-2 hover:bg-zinc-800 rounded-xl transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 text-zinc-500 group-hover:text-primary transition-colors" />
            </Link>
            <div className="h-6 w-[1px] bg-zinc-800 mx-2" />
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
                <tool.icon className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-white tracking-tight leading-none">{tool.name}</h1>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1 opacity-60">{tool.category}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
             <div className="hidden md:flex items-center gap-2 text-[10px] uppercase tracking-widest text-zinc-600 font-mono">
               <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
               Live Environment
             </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 space-y-6">
        {children}
      </main>

      {/* Mini Breadcrumb/Status footer */}
      <footer className="border-t border-zinc-800/50 bg-[#1A1A1A]/10 py-3 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-[10px] uppercase font-bold tracking-[0.2em] text-zinc-600">
          <div className="flex items-center gap-2">
            <Link href="/" className="hover:text-primary transition-all">DevHub</Link>
            <span className="opacity-30">/</span>
            <span className="text-zinc-500">{tool.id}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline opacity-40">SEO: indexable</span>
            <span className="flex items-center gap-1.5">
              <div className="w-1 h-1 rounded-full bg-primary" />
              Operational
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
