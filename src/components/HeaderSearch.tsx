"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, Command, ArrowRight } from "lucide-react";
import { TOOLS } from "@/utility/constants/tools";
import Link from "next/link";
import { cn } from "@/utility/helpers/utils";

export default function HeaderSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredTools = query.trim() === "" 
    ? [] 
    : TOOLS.filter(tool => 
        tool.name.toLowerCase().includes(query.toLowerCase()) ||
        tool.description.toLowerCase().includes(query.toLowerCase()) ||
        tool.tags?.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      ).slice(0, 8);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full max-w-sm hidden md:block" ref={dropdownRef}>
      <div className="relative group">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-primary transition-colors">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          placeholder="Quick find tool..."
          className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-2 pl-10 pr-10 text-xs text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-primary/50 focus:bg-zinc-900 transition-all"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-40 group-focus-within:opacity-0 transition-opacity pointer-events-none">
          <Command className="w-3 h-3" />
          <span className="text-[10px] font-bold">K</span>
        </div>
      </div>

      {/* Dropdown Results */}
      {isOpen && query.trim() !== "" && (
        <div className="absolute top-full left-0 w-full mt-2 bg-[#09090B] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-2 space-y-1">
            {filteredTools.length > 0 ? (
              filteredTools.map((tool) => (
                <Link
                  key={tool.id}
                  href={tool.path}
                  onClick={() => {
                    setIsOpen(false);
                    setQuery("");
                  }}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-zinc-900 group/item transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center group-hover/item:bg-primary/10 transition-colors">
                      <tool.icon className="w-4 h-4 text-zinc-500 group-hover/item:text-primary" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold text-zinc-300 group-hover/item:text-white">
                        {tool.name}
                      </span>
                      <span className="text-[9px] text-zinc-600 font-medium uppercase tracking-wider">
                        {tool.category}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-3 h-3 text-zinc-700 opacity-0 -translate-x-2 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all" />
                </Link>
              ))
            ) : (
              <div className="p-8 text-center space-y-2">
                <Search className="w-8 h-8 text-zinc-800 mx-auto" />
                <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">No tools found</p>
              </div>
            )}
          </div>
          
          <div className="border-t border-zinc-800/50 p-3 bg-zinc-950/50 flex items-center justify-between">
             <span className="text-[9px] font-black uppercase tracking-widest text-zinc-700">Tool Registry v1.2</span>
             <Link 
               href="/tools" 
               className="text-[9px] font-black uppercase tracking-widest text-primary hover:underline"
               onClick={() => {
                 setIsOpen(false);
                 setQuery("");
               }}
             >
               View All
             </Link>
          </div>
        </div>
      )}
    </div>
  );
}
