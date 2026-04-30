"use client";

import React, { useState, useRef } from "react";
import { 
  Upload, 
  Copy, 
  Trash2, 
  FileCheck, 
  Image as ImageIcon,
  FileText,
  FileCode,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/utility/helpers/utils";

interface FileInfo {
  name: string;
  size: string;
  type: string;
  data: string;
}

export default function Base64FileConverter() {
  const [file, setFile] = useState<FileInfo | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    if (f.size > 5 * 1024 * 1024) {
      toast.error("File too large (max 5MB)");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setFile({
        name: f.name,
        size: (f.size / 1024).toFixed(1) + " KB",
        type: f.type,
        data: e.target?.result as string
      });
      toast.success("File processed");
    };
    reader.readAsDataURL(f);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const copyBase64 = () => {
    if (!file) return;
    navigator.clipboard.writeText(file.data);
    toast.success("Base64 string copied");
  };

  const copyDataUri = () => {
    if (!file) return;
    // Data is already a Data URI from FileReader.readAsDataURL
    navigator.clipboard.writeText(file.data);
    toast.success("Data URI copied");
  };

  return (
      <div className="flex flex-col h-full gap-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">
          {/* Uploader Section */}
          <div className="flex flex-col gap-6">
            <div 
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "flex-1 border-2 border-dashed rounded-[3rem] flex flex-col items-center justify-center p-12 transition-all cursor-pointer group relative overflow-hidden",
                isDragging ? "border-primary bg-primary/5 scale-[0.98]" : "border-zinc-800 hover:border-zinc-700 bg-zinc-950/30"
              )}
            >
              <input 
                type="file" 
                className="hidden" 
                ref={fileInputRef}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                }}
              />
              
              <div className="p-8 bg-zinc-900 rounded-3xl mb-8 group-hover:scale-110 group-hover:bg-primary/10 transition-all duration-500">
                 <Upload className={cn("w-12 h-12 transition-colors", isDragging ? "text-primary" : "text-zinc-600 group-hover:text-primary")} />
              </div>
              
              <div className="text-center space-y-2">
                 <p className="text-xl font-bold text-white tracking-tight">Drop file here to encode</p>
                 <p className="text-sm text-zinc-500 font-medium">Or click to browse your local storage</p>
                 <p className="text-[10px] uppercase font-black tracking-widest text-zinc-700 mt-4">MAX FILE SIZE 5MB</p>
              </div>

              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[100px] pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/20 blur-[100px] pointer-events-none" />
            </div>

            {file && (
              <div className="bg-[#161618] border border-zinc-800 rounded-2xl p-6 flex items-center justify-between animate-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-zinc-900 rounded-xl flex items-center justify-center">
                      {file.type.startsWith("image/") ? <ImageIcon className="w-6 h-6 text-primary" /> : <FileText className="w-6 h-6 text-blue-500" />}
                   </div>
                   <div>
                      <h4 className="text-sm font-bold text-white truncate max-w-[200px]">{file.name}</h4>
                      <p className="text-[10px] font-mono text-zinc-500 uppercase">{file.type} • {file.size}</p>
                   </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setFile(null)} className="text-zinc-700 hover:text-red-500">
                   <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Results Section */}
          <div className="flex flex-col gap-6">
            <div className="flex-1 border border-zinc-800 rounded-[2.5rem] bg-[#0F0F10] overflow-hidden flex flex-col shadow-2xl">
               <div className="flex items-center justify-between px-8 py-6 border-b border-zinc-800 bg-zinc-900/50">
                  <div className="flex items-center gap-3">
                     <FileCheck className="w-4 h-4 text-green-500" />
                     <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Encoded String</h3>
                  </div>
                  <div className="flex gap-2">
                     <Button variant="ghost" size="sm" onClick={copyBase64} disabled={!file} className="h-8 text-[10px] uppercase font-black text-zinc-500 hover:text-primary">
                        <Copy className="w-3.5 h-3.5 mr-2" /> Base64
                     </Button>
                     <Button variant="ghost" size="sm" onClick={copyDataUri} disabled={!file} className="h-8 text-[10px] uppercase font-black text-zinc-500 hover:text-primary">
                        <Copy className="w-3.5 h-3.5 mr-2" /> Data URI
                     </Button>
                  </div>
               </div>

               <div className="flex-1 p-8 overflow-auto font-mono text-[10px] leading-relaxed relative group">
                 {file ? (
                   <div className="break-all text-zinc-400 select-all h-full">
                      {file.data}
                   </div>
                 ) : (
                   <div className="h-full flex flex-col items-center justify-center text-zinc-800/50 space-y-6">
                      <div className="w-20 h-20 border-2 border-dashed border-zinc-800 rounded-full flex items-center justify-center">
                         <FileCode className="w-8 h-8" />
                      </div>
                      <p className="text-xs font-bold uppercase tracking-[0.3em] italic">Output Pending</p>
                   </div>
                 )}
                 {file && (
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F10] via-transparent pointer-events-none" />
                 )}
               </div>
            </div>

            {file && (
              <div className="grid grid-cols-2 gap-4">
                 <Button onClick={copyDataUri} className="h-14 bg-primary hover:bg-primary/90 text-white font-bold gap-3 rounded-2xl shadow-xl shadow-primary/20">
                    <Copy className="w-4 h-4" />
                    Copy Data URI
                 </Button>
                 <Button variant="outline" className="h-14 bg-zinc-900 border-zinc-800 text-zinc-400 font-bold gap-3 rounded-2xl">
                    <Download className="w-4 h-4" />
                    Save Text
                 </Button>
              </div>
            )}
          </div>
        </div>
      </div>
  );
}
