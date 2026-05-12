"use client";

import React, { useState, useRef } from "react";
import { 
  Upload, 
  Lock, 
  Unlock, 
  RotateCcw, 
  FileCheck, 
  Trash2, 
  Download,
  ShieldAlert,
  ShieldCheck,
  FileLock2,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { M3Password } from "@/components/ui/m3-ui";
import { toast } from "sonner";
import { cn } from "@/utility/helpers/utils";

interface FileInfo {
  name: string;
  size: number;
  type: string;
  blob: Blob;
}

export default function FileEncryptorPage() {
  const [file, setFile] = useState<FileInfo | null>(null);
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"encrypt" | "decrypt">("encrypt");
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; name: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    // Limit to 50MB for browser-side processing to avoid memory issues
    if (f.size > 50 * 1024 * 1024) {
      toast.error("File too large (max 50MB)");
      return;
    }

    setFile({
      name: f.name,
      size: f.size,
      type: f.type,
      blob: f
    });
    setResult(null);
    toast.success("File uploaded");
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const deriveKey = async (password: string, salt: Uint8Array) => {
    const encoder = new TextEncoder();
    const baseKey = await window.crypto.subtle.importKey(
      "raw",
      encoder.encode(password),
      "PBKDF2",
      false,
      ["deriveKey"]
    );

    return window.crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: salt as BufferSource,
        iterations: 100000,
        hash: "SHA-256",
      },
      baseKey,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
  };

  const handleProcess = async () => {
    if (!file || !password) {
      toast.error("Please provide both a file and a password");
      return;
    }

    setIsProcessing(true);
    try {
      const fileData = await file.blob.arrayBuffer();
      
      if (mode === "encrypt") {
        const salt = window.crypto.getRandomValues(new Uint8Array(16));
        const iv = window.crypto.getRandomValues(new Uint8Array(12));
        const key = await deriveKey(password, salt);
        
        const encryptedContent = await window.crypto.subtle.encrypt(
          { name: "AES-GCM", iv },
          key,
          fileData
        );

        const combined = new Uint8Array(salt.length + iv.length + encryptedContent.byteLength);
        combined.set(salt, 0);
        combined.set(iv, salt.length);
        combined.set(new Uint8Array(encryptedContent), salt.length + iv.length);

        setResult({
          blob: new Blob([combined], { type: "application/octet-stream" }),
          name: `${file.name}.enc`
        });
        toast.success("File encrypted successfully");
      } else {
        const fullData = new Uint8Array(fileData);
        if (fullData.length < 16 + 12) {
          throw new Error("Invalid encrypted file format");
        }

        const salt = fullData.slice(0, 16);
        const iv = fullData.slice(16, 28);
        const ciphertext = fullData.slice(28);

        const key = await deriveKey(password, salt);
        
        try {
          const decryptedContent = await window.crypto.subtle.decrypt(
            { name: "AES-GCM", iv },
            key,
            ciphertext
          );

          let originalName = file.name;
          if (originalName.endsWith(".enc")) {
            originalName = originalName.slice(0, -4);
          }

          setResult({
            blob: new Blob([decryptedContent]),
            name: originalName
          });
          toast.success("File decrypted successfully");
        } catch (e) {
          throw new Error("Decryption failed. Check your password.");
        }
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Operation failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadResult = () => {
    if (!result) return;
    const url = URL.createObjectURL(result.blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = result.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clear = () => {
    setFile(null);
    setPassword("");
    setResult(null);
  };

  return (
    <div className="flex flex-col h-full max-w-6xl mx-auto gap-8 pt-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
        {/* Controls */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-[#161618] border border-zinc-800 rounded-[2.5rem] p-8 space-y-8 shadow-2xl">
            <div className="flex bg-zinc-950 p-1.5 rounded-2xl border border-zinc-900 shadow-inner">
              <button 
                onClick={() => { setMode("encrypt"); setResult(null); }}
                className={cn(
                  "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all gap-2 flex items-center justify-center",
                  mode === "encrypt" ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-zinc-600 hover:text-zinc-400"
                )}
              >
                <Lock className="w-3 h-3" /> Encrypt
              </button>
              <button 
                onClick={() => { setMode("decrypt"); setResult(null); }}
                className={cn(
                  "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all gap-2 flex items-center justify-center",
                  mode === "decrypt" ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-zinc-600 hover:text-zinc-400"
                )}
              >
                <Unlock className="w-3 h-3" /> Decrypt
              </button>
            </div>

            <div className="space-y-6">
              <div 
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "h-48 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center p-6 transition-all cursor-pointer group relative overflow-hidden",
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
                <Upload className={cn("w-8 h-8 mb-4 transition-colors", isDragging ? "text-primary" : "text-zinc-600 group-hover:text-primary")} />
                <p className="text-sm font-bold text-zinc-300 text-center">
                  {file ? file.name : `Drop file to ${mode}`}
                </p>
                <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mt-2">Max 50MB</p>
              </div>

              <M3Password 
                label="Protection Password"
                placeholder="Secure passphrase..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button 
                onClick={handleProcess}
                disabled={isProcessing || !file || !password}
                className="flex-1 h-16 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest gap-3 shadow-xl shadow-primary/20 disabled:opacity-50"
              >
                {isProcessing ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : mode === "encrypt" ? (
                  <Lock className="w-5 h-5" />
                ) : (
                  <Unlock className="w-5 h-5" />
                )}
                {isProcessing ? "Processing..." : `${mode === "encrypt" ? "Secure" : "Unlock"} File`}
              </Button>
              <Button 
                onClick={clear}
                variant="outline"
                className="h-16 w-16 rounded-2xl border-zinc-800 bg-zinc-900 text-zinc-600 hover:text-white transition-all hover:bg-zinc-800"
              >
                <RotateCcw className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className="bg-amber-500/5 border border-amber-500/10 p-6 rounded-[2rem] flex gap-5 items-start">
            <ShieldAlert className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500">Local-Only Security</p>
              <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                Uses AES-256-GCM with PBKDF2. Your file and password never leave your device.
              </p>
            </div>
          </div>
        </div>

        {/* Result Area */}
        <div className="lg:col-span-7 flex flex-col gap-8">
          <div className="flex items-center justify-between px-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 flex items-center gap-3">
              {result ? "Action Ready" : "Secure Environment"}
            </h3>
          </div>

          <div className="flex-1 bg-[#0c0c0e] border border-zinc-900 rounded-[3.5rem] p-12 flex flex-col items-center justify-center relative group overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            
            {!result ? (
              <div className="flex flex-col items-center justify-center opacity-5 gap-8 grayscale">
                <FileLock2 className="w-32 h-32" />
                <span className="text-2xl font-black uppercase tracking-[0.4em] italic">Waiting for Input</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-8 animate-in fade-in zoom-in duration-500">
                <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center relative">
                  <div className="absolute -inset-4 bg-primary/5 blur-2xl rounded-full animate-pulse" />
                  <FileCheck className="w-12 h-12 text-primary relative z-10" />
                </div>
                
                <div className="text-center space-y-2">
                   <h4 className="text-xl font-bold text-white tracking-tight">{result.name}</h4>
                   <p className="text-sm text-zinc-500 font-mono">
                     {(result.blob.size / 1024).toFixed(1)} KB • Ready for Download
                   </p>
                </div>

                <Button 
                  onClick={downloadResult}
                  className="h-16 px-12 rounded-2xl bg-white text-black hover:bg-zinc-200 font-black uppercase tracking-widest gap-3 shadow-2xl"
                >
                  <Download className="w-5 h-5" />
                  Download File
                </Button>
              </div>
            )}
          </div>

          <div className="bg-zinc-950 border border-zinc-900 p-8 rounded-[2rem] flex items-center gap-6">
            <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center shrink-0">
               <AlertCircle className="w-6 h-6 text-zinc-700" />
            </div>
            <p className="text-[10px] font-bold text-zinc-600 leading-relaxed uppercase tracking-widest">
              Important: If you forget the password, there is absolutely no way to recover your file data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
