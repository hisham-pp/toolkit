"use client";

import { useState } from "react";
import { 
  Keyboard,
  Search,
  Monitor,
  Terminal,
  Code2,
  Settings2,
  ExternalLink,
  Laptop
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { M3Input, M3Select } from "@/components/ui/m3-ui";
import { cn } from "@/utility/helpers/utils";

type IDEType = "vscode" | "intellij" | "vim" | "macos";

interface Shortcut {
  key: string;
  action: string;
  description: string;
  category: "editing" | "navigation" | "system" | "refactoring";
}

const SHORTCUTS: Record<IDEType, Shortcut[]> = {
  vscode: [
    { key: "Cmd/Ctrl + P", action: "Quick Open", description: "Go to file by name", category: "navigation" },
    { key: "Cmd/Ctrl + Shift + P", action: "Command Palette", description: "Run any editor command", category: "system" },
    { key: "Cmd/Ctrl + Shift + F", action: "Search in All Files", description: "Global search across project", category: "navigation" },
    { key: "Cmd/Ctrl + B", action: "Toggle Sidebar", description: "Hide or show the file explorer", category: "system" },
    { key: "Cmd/Ctrl + D", action: "Multi-select Next", description: "Add next occurrence to selection", category: "editing" },
    { key: "Alt + Up/Down", action: "Move Line", description: "Move current line up or down", category: "editing" },
    { key: "Shift + Alt + F", action: "Format Document", description: "Apply prettier or default formatter", category: "editing" },
    { key: "F2", action: "Rename Symbol", description: "Safely rename variable/function", category: "refactoring" },
    { key: "Cmd/Ctrl + ~", action: "Toggle Terminal", description: "Open integrated terminal", category: "system" },
  ],
  intellij: [
    { key: "Double Shift", action: "Search Everywhere", description: "Search files, settings, actions", category: "navigation" },
    { key: "Cmd/Ctrl + E", action: "Recent Files", description: "View list of recently opened files", category: "navigation" },
    { key: "Cmd/Ctrl + Shift + A", action: "Find Action", description: "Search for IDE commands", category: "system" },
    { key: "Cmd/Ctrl + Shift + Enter", action: "Complete Statement", description: "Finish current line (semicolon etc)", category: "editing" },
    { key: "Alt + Enter", action: "Intention Actions", description: "Quick fixes and context actions", category: "editing" },
    { key: "Cmd/Ctrl + Alt + L", action: "Reformat Code", description: "Apply code style formatting", category: "editing" },
    { key: "Shift + F6", action: "Rename", description: "Refactor rename of symbol", category: "refactoring" },
  ],
  vim: [
    { key: ":w", action: "Save", description: "Write changes to file", category: "system" },
    { key: ":q", action: "Quit", description: "Close current window", category: "system" },
    { key: "dd", action: "Delete Line", description: "Cut current line", category: "editing" },
    { key: "yy", action: "Copy Line", description: "Yank current line", category: "editing" },
    { key: "p", action: "Paste", description: "Put yanked/deleted text", category: "editing" },
    { key: "u", action: "Undo", description: "Revert last change", category: "editing" },
    { key: "/", action: "Search", description: "Find pattern in current file", category: "navigation" },
    { key: "v", action: "Visual Mode", description: "Start text selection", category: "editing" },
  ],
  macos: [
    { key: "Cmd + Space", action: "Spotlight", description: "Global system search", category: "system" },
    { key: "Cmd + Tab", action: "Switch App", description: "Cycle through open applications", category: "system" },
    { key: "Cmd + Option + Esc", action: "Force Quit", description: "Force close unresponsive apps", category: "system" },
    { key: "Cmd + Shift + 4", action: "Screenshot", description: "Capture portion of screen", category: "system" },
    { key: "Cmd + Option + D", action: "Toggle Dock", description: "Hide or show the macOS dock", category: "system" },
  ]
};

export default function ShortcutsPage() {
  const [activeIde, setActiveIde] = useState<IDEType>("vscode");
  const [search, setSearch] = useState("");

  const filteredShortcuts = SHORTCUTS[activeIde].filter(s => 
    s.action.toLowerCase().includes(search.toLowerCase()) || 
    s.description.toLowerCase().includes(search.toLowerCase()) || 
    s.key.toLowerCase().includes(search.toLowerCase())
  );

  return (
      <div className="max-w-6xl mx-auto space-y-8 pb-20">
         <div className="bg-[#161618] border border-zinc-800 rounded-[2.5rem] p-4 shadow-2xl flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px] relative">
               <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
               <input 
                 type="text" 
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
                 placeholder="Search for an action or key combo..."
                 className="w-full bg-zinc-950 border border-zinc-800 h-14 pl-14 pr-6 rounded-2xl text-xs font-bold uppercase tracking-widest text-primary outline-none focus:border-primary/50"
               />
            </div>
            
            <div className="flex bg-zinc-950 p-1.5 rounded-2xl border border-zinc-900 overflow-x-auto no-scrollbar">
               {(["vscode", "intellij", "vim", "macos"] as IDEType[]).map((ide) => (
                 <button
                   key={ide}
                   onClick={() => setActiveIde(ide)}
                   className={cn(
                     "px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                     activeIde === ide 
                       ? "bg-primary text-white shadow-lg shadow-primary/20" 
                       : "text-zinc-600 hover:text-zinc-400"
                   )}
                 >
                   {ide}
                 </button>
               ))}
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredShortcuts.map((shortcut, idx) => (
              <div 
                key={idx} 
                className="bg-[#161618] border border-zinc-800 rounded-[2rem] p-6 space-y-4 hover:border-primary/30 transition-all duration-300 group hover:-translate-y-1 flex flex-col"
              >
                <div className="flex items-start justify-between">
                   <div className={cn(
                     "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest",
                     shortcut.category === "editing" ? "bg-blue-500/10 text-blue-500 border border-blue-500/20" :
                     shortcut.category === "navigation" ? "bg-green-500/10 text-green-500 border border-green-500/20" :
                     shortcut.category === "refactoring" ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" :
                     "bg-purple-500/10 text-purple-500 border border-purple-500/20"
                   )}>
                      {shortcut.category}
                   </div>
                   <Keyboard className="w-4 h-4 text-zinc-800 group-hover:text-primary transition-colors" />
                </div>

                <div className="flex-1 space-y-2">
                   <h4 className="text-zinc-200 font-black uppercase tracking-tight text-sm">{shortcut.action}</h4>
                   <p className="text-zinc-500 text-[11px] leading-relaxed font-medium">{shortcut.description}</p>
                </div>

                <div className="pt-4 mt-auto">
                   <div className="bg-zinc-950 px-4 py-3 rounded-xl border border-zinc-900 group-hover:border-primary/20 flex items-center justify-center">
                      <span className="text-primary font-mono text-xs font-bold">{shortcut.key}</span>
                   </div>
                </div>
              </div>
            ))}

            {filteredShortcuts.length === 0 && (
              <div className="col-span-full py-20 bg-zinc-950/30 border border-zinc-900 border-dashed rounded-[3rem] flex flex-col items-center justify-center space-y-4">
                 <Terminal className="w-12 h-12 text-zinc-800" />
                 <div className="text-center">
                    <p className="text-zinc-600 font-black uppercase tracking-widest text-[10px]">No matches found</p>
                    <p className="text-zinc-800 text-[9px] font-medium uppercase tracking-widest mt-1">Try a different search term</p>
                 </div>
              </div>
            )}
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
            <div className="bg-[#161618] border border-zinc-800 p-8 rounded-[2.5rem] space-y-6 flex items-center gap-8 shadow-xl">
               <div className="w-20 h-20 rounded-3xl bg-primary/5 flex items-center justify-center border border-primary/10 shrink-0">
                  <Laptop className="w-10 h-10 text-primary" />
               </div>
               <div className="space-y-2">
                  <h3 className="text-zinc-100 font-black uppercase tracking-tight">Productivity Boost</h3>
                  <p className="text-zinc-500 text-[11px] leading-relaxed font-medium">
                    Mastering these shortcuts can save you up to 2 hours per week in pure interaction time. Focus on one category at a time to build muscle memory.
                  </p>
               </div>
            </div>
            <div className="bg-zinc-950/50 border border-zinc-900 p-8 rounded-[2.5rem] space-y-6 flex items-center gap-8">
               <div className="w-20 h-20 rounded-3xl bg-zinc-900 flex items-center justify-center border border-zinc-800 shrink-0">
                  <Settings2 className="w-10 h-10 text-zinc-700" />
               </div>
               <div className="space-y-4">
                  <h3 className="text-zinc-400 font-black uppercase tracking-tight text-xs">Custom Shortcuts?</h3>
                  <Button variant="outline" className="h-10 rounded-xl border-zinc-800 text-[9px] font-black uppercase tracking-widest gap-2">
                     <ExternalLink className="w-3 h-3" /> External Reference
                  </Button>
               </div>
            </div>
         </div>
      </div>
  );
}
