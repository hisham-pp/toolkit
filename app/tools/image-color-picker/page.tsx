"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  Upload, 
  Pipette, 
  Copy, 
  Trash2,
  Check,
  MousePointer2,
  List
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { colord } from "colord";

export default function ImageColorPicker() {
  const [image, setImage] = useState<string | null>(null);
  const [pickedColor, setPickedColor] = useState<string>("#000000");
  const [history, setHistory] = useState<string[]>([]);
  const [magnifier, setMagnifier] = useState({ x: 0, y: 0, show: false });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        setImage(url);
        setHistory([]);
      };
      reader.readAsDataURL(file);
    }
  };

  const drawImage = () => {
    if (!image || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = image;
    img.onload = () => {
      imageRef.current = img;
      const maxWidth = canvas.parentElement?.clientWidth || 800;
      const scale = maxWidth / img.width;
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
  };

  useEffect(() => {
    drawImage();
    window.addEventListener('resize', drawImage);
    return () => window.removeEventListener('resize', drawImage);
  }, [image]);

  const getColorAtPixel = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const pixelData = ctx.getImageData(x, y, 1, 1).data;
    const hex = colord({ r: pixelData[0], g: pixelData[1], b: pixelData[2] }).toHex();
    
    setPickedColor(hex);
    setMagnifier({ x, y, show: true });
    
    if (event.type === "mousedown") {
      setHistory(prev => [hex, ...prev.slice(0, 19)]);
      handleCopy(hex);
    }
  };

  const handleCopy = (hex: string) => {
    navigator.clipboard.writeText(hex);
    toast.success(`Copied ${hex.toUpperCase()}`, {
      style: { backgroundColor: hex, color: colord(hex).isDark() ? 'white' : 'black' }
    });
  };

  const clear = () => {
    setImage(null);
    setHistory([]);
    setPickedColor("#000000");
  };

  return (
    <>
      <div className="flex flex-col h-full gap-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Canvas Viewport */}
          <div className="lg:col-span-8 flex flex-col gap-4">
             <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                   <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 italic">Precision Viewport</span>
                </div>
                {image && (
                  <Button variant="ghost" size="sm" onClick={clear} className="text-zinc-600 hover:text-red-500 h-8 px-3 rounded-xl hover:bg-red-500/5">
                    <Trash2 className="w-4 h-4 mr-2" /> Clear Image
                  </Button>
                )}
             </div>

             <div className="relative bg-[#0F0F10] border border-zinc-800 rounded-[2.5rem] overflow-hidden min-h-[500px] flex items-center justify-center group shadow-inner">
                {!image ? (
                   <label className="flex flex-col items-center justify-center gap-6 cursor-pointer w-full h-full p-20 text-center">
                      <div className="w-24 h-24 bg-zinc-900 rounded-[2rem] border border-zinc-800 flex items-center justify-center group-hover:scale-110 group-hover:border-primary/50 transition-all duration-500 shadow-2xl">
                         <Upload className="w-8 h-8 text-zinc-700 group-hover:text-primary transition-colors" />
                      </div>
                      <div className="space-y-2">
                         <h3 className="text-xl font-bold text-zinc-300 tracking-tight">Drop Image or Browse</h3>
                         <p className="text-[10px] uppercase font-black tracking-widest text-zinc-600">Supports PNG, JPG, WEBP, SVG</p>
                      </div>
                      <input type="file" className="hidden" accept="image/*" onChange={handleUpload} />
                   </label>
                ) : (
                  <div className="relative cursor-crosshair">
                     <canvas 
                       ref={canvasRef}
                       onMouseMove={getColorAtPixel}
                       onMouseDown={getColorAtPixel}
                       onMouseLeave={() => setMagnifier(prev => ({ ...prev, show: false }))}
                       className="max-w-full h-auto block"
                     />
                     {magnifier.show && (
                       <div 
                         className="absolute w-24 h-24 border-4 border-white rounded-full pointer-events-none shadow-2xl overflow-hidden flex items-center justify-center"
                         style={{ 
                           left: magnifier.x - 48, 
                           top: magnifier.y - 48,
                           backgroundColor: pickedColor,
                           boxShadow: `0 0 40px ${pickedColor}44`
                         }}
                       >
                          <div className={cn(
                            "text-[10px] font-black uppercase text-center",
                            colord(pickedColor).isDark() ? "text-white" : "text-black"
                          )}>
                             {pickedColor.toUpperCase()}
                          </div>
                       </div>
                     )}
                  </div>
                )}
             </div>
          </div>

          {/* Controls & History */}
          <div className="lg:col-span-4 flex flex-col gap-6">
             {/* Current Color Card */}
             <div className="bg-[#161618] border border-zinc-800 rounded-[2.5rem] p-8 space-y-6 shadow-xl">
                <div className="flex items-center gap-3">
                   <MousePointer2 className="w-4 h-4 text-primary" />
                   <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Current Selection</span>
                </div>
                <div 
                  className="h-32 rounded-3xl border border-zinc-800 flex items-center justify-center group relative overflow-hidden"
                  style={{ backgroundColor: pickedColor }}
                >
                   <div className={cn(
                     "px-6 py-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-full text-xs font-mono font-bold tracking-widest",
                     colord(pickedColor).isDark() ? "text-white" : "text-black bg-white/40"
                   )}>
                      {pickedColor.toUpperCase()}
                   </div>
                   <button 
                     onClick={() => handleCopy(pickedColor)}
                     className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-black/20 flex items-center justify-center transition-opacity"
                   >
                      <Copy className="w-6 h-6 text-white" />
                   </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                   <div className="bg-zinc-950 p-4 rounded-2xl flex flex-col items-center gap-1">
                      <span className="text-[10px] font-bold text-zinc-600 uppercase">RGB</span>
                      <span className="text-xs font-mono text-zinc-400">{colord(pickedColor).toRgb().r}, {colord(pickedColor).toRgb().g}, {colord(pickedColor).toRgb().b}</span>
                   </div>
                   <div className="bg-zinc-950 p-4 rounded-2xl flex flex-col items-center gap-1">
                      <span className="text-[10px] font-bold text-zinc-600 uppercase">HSL</span>
                      <span className="text-xs font-mono text-zinc-400">{colord(pickedColor).toHsl().h}°, {colord(pickedColor).toHsl().s}%, {colord(pickedColor).toHsl().l}%</span>
                   </div>
                </div>
             </div>

             {/* Swatch History */}
             <div className="flex-1 bg-[#161618] border border-zinc-800 rounded-[2.5rem] p-8 flex flex-col gap-6 shadow-xl">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <List className="w-4 h-4 text-primary" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Swatch History</span>
                   </div>
                   <span className="text-[9px] font-bold px-2 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-zinc-600">{history.length}/20</span>
                </div>
                
                <div className="grid grid-cols-5 gap-3 overflow-y-auto max-h-[300px] content-start pr-2 custom-scrollbar">
                   {history.map((h, i) => (
                      <button 
                         key={`${h}-${i}`}
                         onClick={() => {
                            setPickedColor(h);
                            handleCopy(h);
                         }}
                         className="aspect-square rounded-xl border border-zinc-800/50 hover:scale-110 hover:-rotate-6 transition-all shadow-lg cursor-pointer"
                         style={{ backgroundColor: h }}
                         title={h}
                      />
                   ))}
                   {history.length === 0 && (
                      <div className="col-span-5 py-12 flex flex-col items-center justify-center opacity-20 text-center gap-4">
                         <Pipette className="w-8 h-8" />
                         <p className="text-[9px] font-black uppercase tracking-tighter">History will appear here</p>
                      </div>
                   )}
                </div>
             </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #27272a;
          border-radius: 10px;
        }
      `}</style>
    </>
  );
}
