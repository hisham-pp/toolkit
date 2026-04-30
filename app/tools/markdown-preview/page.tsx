"use client";

import React, { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { TOOLS } from "@/lib/tools-config";
import { Eye, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import ReactMarkdown from "react-markdown";

export default function MarkdownTool() {
  const tool = TOOLS.find((t) => t.id === "markdown-preview")!;
  const [input, setInput] = useState("# Welcome to Markdown Preview\n\nEdit this text to see the changes.\n\n- Real-time preview\n- GitHub flavored\n- Simple and fast");

  return (
    <ToolLayout tool={tool}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 border border-zinc-800 rounded-3xl overflow-hidden min-h-[600px] h-[calc(100vh-250px)]">
        <div className="flex flex-col border-r border-zinc-800 bg-[#0C0C0E]">
          <div className="h-12 border-b border-zinc-800 px-4 flex items-center justify-between bg-zinc-900/30">
            <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-zinc-500">
              <Edit3 className="w-3 h-3" />
              Editor
            </div>
          </div>
          <Textarea
            className="flex-1 bg-transparent border-none focus-visible:ring-0 rounded-none p-6 font-mono text-sm leading-relaxed resize-none text-zinc-300"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>

        <div className="flex flex-col bg-[#09090B]">
          <div className="h-12 border-b border-zinc-800 px-4 flex items-center justify-between bg-zinc-900/30">
             <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-zinc-500">
              <Eye className="w-3 h-3" />
              Preview
            </div>
          </div>
          <div className="flex-1 p-8 overflow-auto prose prose-invert prose-zinc max-w-none">
            <ReactMarkdown>{input}</ReactMarkdown>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
