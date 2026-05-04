"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  Download, 
  RefreshCw, 
  Dice5, 
  ExternalLink, 
  Copy, 
  Plus, 
  Trash2, 
  Image as ImageIcon,
  Type,
  Grid
} from "lucide-react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { toPng } from "html-to-image";
import { cn } from "@/utility/helpers/utils";
import { ICONIFY_ICONS } from "@/utility/constants/iconify-icons";

type GenerationMode = "icon" | "text";

interface GeneratedImage {
  id: string;
  mode: GenerationMode;
  content: string;
  color: string;
  bgColor: string;
  size: number;
  padding: number;
  borderRadius: number;
  fontSize: number;
}

export default function ImageGeneratorPage() {
  const [mode, setMode] = useState<GenerationMode>("icon");
  const [content, setContent] = useState("mdi:account");
  const [color, setColor] = useState("#ffffff");
  const [bgColor, setBgColor] = useState("#3b82f6");
  const [size, setSize] = useState(256);
  const [padding, setPadding] = useState(64);
  const [borderRadius, setBorderRadius] = useState(48);
  const [fontSize, setFontSize] = useState(128);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const containerRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const getRandomIcon = () => {
    return ICONIFY_ICONS[Math.floor(Math.random() * ICONIFY_ICONS.length)];
  };

  const getRandomColor = () => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  const handleAdd = () => {
    const newImage: GeneratedImage = {
      id: Math.random().toString(36).substring(2, 11),
      mode,
      content,
      color,
      bgColor,
      size,
      padding,
      borderRadius,
      fontSize,
    };
    setGeneratedImages([newImage, ...generatedImages]);
    toast.success("Image configuration added to queue");
  };

  const handleRandomize = () => {
    const isIcon = Math.random() > 0.5;
    const newMode: GenerationMode = isIcon ? "icon" : "text";
    const newContent = isIcon ? getRandomIcon() : "DEV";
    const newColor = "#ffffff";
    const newBgColor = getRandomColor();
    
    const newImage: GeneratedImage = {
      id: Math.random().toString(36).substring(2, 11),
      mode: newMode,
      content: newContent,
      color: newColor,
      bgColor: newBgColor,
      size,
      padding,
      borderRadius,
      fontSize,
    };
    setGeneratedImages([newImage, ...generatedImages]);
    toast.success("Random image added");
  };

  const handleGenerateMany = (count: number) => {
    const newImages: GeneratedImage[] = [];
    for (let i = 0; i < count; i++) {
      const isIcon = Math.random() > 0.3; // Favor icons slightly
      const newMode: GenerationMode = isIcon ? "icon" : "text";
      const newContent = isIcon ? getRandomIcon() : ["HUB", "DEV", "APP", "SYS", "CODE"][Math.floor(Math.random() * 5)];
      
      newImages.push({
        id: Math.random().toString(36).substring(2, 11),
        mode: newMode,
        content: newContent,
        color: "#ffffff",
        bgColor: getRandomColor(),
        size,
        padding,
        borderRadius,
        fontSize,
      });
    }
    setGeneratedImages([...newImages, ...generatedImages]);
    toast.success(`Added ${count} random images to queue`);
  };

  const downloadImage = async (id: string, name: string) => {
    const ref = containerRefs.current[id];
    if (!ref) return;

    try {
      const dataUrl = await toPng(ref, { quality: 1.0 });
      const link = document.createElement("a");
      link.download = `${name.replace(/[:\s]/g, "-")}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      toast.error("Failed to generate image");
      console.error(err);
    }
  };

  const downloadAll = async () => {
    if (generatedImages.length === 0) return;
    setIsGenerating(true);
    toast.info("Generating all images, please wait...");

    for (const img of generatedImages) {
      await downloadImage(img.id, `gen-${img.content}-${img.id}`);
      // Small delay to prevent browser issues
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    setIsGenerating(false);
    toast.success("All images generated!");
  };

  const removeImage = (id: string) => {
    setGeneratedImages(generatedImages.filter(img => img.id !== id));
  };

  const clearAll = () => {
    setGeneratedImages([]);
    toast.success("Queue cleared");
  };

  return (
    <div className="flex flex-col h-full max-w-7xl mx-auto gap-8 pt-6 pb-24">
      {/* Configuration Header */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#161618] border border-zinc-800 rounded-[2rem] p-8 space-y-8 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black uppercase tracking-widest text-white">Generator Config</h2>
              <Dice5 
                className="w-5 h-5 text-zinc-600 hover:text-primary cursor-pointer transition-colors" 
                onClick={() => {
                  if (mode === "icon") setContent(getRandomIcon());
                  setBgColor(getRandomColor());
                }}
              />
            </div>

            <Tabs value={mode} onValueChange={(v) => setMode(v as GenerationMode)} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-zinc-950/50 p-1 rounded-xl">
                <TabsTrigger value="icon" className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg gap-2 text-xs font-bold uppercase tracking-widest">
                  <ImageIcon className="w-4 h-4" /> Icon
                </TabsTrigger>
                <TabsTrigger value="text" className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg gap-2 text-xs font-bold uppercase tracking-widest">
                  <Type className="w-4 h-4" /> Text
                </TabsTrigger>
              </TabsList>

              <div className="pt-6 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                      {mode === "icon" ? "Icon Name (Iconify)" : "Text Content"}
                    </label>
                    {mode === "icon" && (
                      <a 
                        href="https://icon-sets.iconify.design/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1 hover:underline"
                      >
                        Find Icons <ExternalLink className="w-2 h-2" />
                      </a>
                    )}
                  </div>
                  <Input 
                    placeholder={mode === "icon" ? "mdi:account" : "ABC"}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="h-12 bg-zinc-950/50 border-zinc-800 rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Foreground</label>
                    <div className="flex gap-2">
                      <div className="w-12 h-12 rounded-xl border border-zinc-800" style={{ backgroundColor: color }} />
                      <Input 
                        type="color" 
                        value={color} 
                        onChange={(e) => setColor(e.target.value)} 
                        className="h-12 p-1 bg-zinc-950/50 border-zinc-800 rounded-xl cursor-pointer"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Background</label>
                    <div className="flex gap-2">
                      <div className="w-12 h-12 rounded-xl border border-zinc-800" style={{ backgroundColor: bgColor }} />
                      <Input 
                        type="color" 
                        value={bgColor} 
                        onChange={(e) => setBgColor(e.target.value)} 
                        className="h-12 p-1 bg-zinc-950/50 border-zinc-800 rounded-xl cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-6 pt-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Image Size</label>
                      <span className="text-[10px] font-mono font-bold text-primary">{size}px</span>
                    </div>
                    <Slider value={[size]} min={64} max={1024} step={8} onValueChange={(v) => setSize(Array.isArray(v) ? v[0] : v)} />
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Padding</label>
                      <span className="text-[10px] font-mono font-bold text-primary">{padding}px</span>
                    </div>
                    <Slider value={[padding]} min={0} max={256} step={4} onValueChange={(v) => setPadding(Array.isArray(v) ? v[0] : v)} />
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Border Radius</label>
                      <span className="text-[10px] font-mono font-bold text-primary">{borderRadius}px</span>
                    </div>
                    <Slider value={[borderRadius]} min={0} max={size / 2} step={1} onValueChange={(v) => setBorderRadius(Array.isArray(v) ? v[0] : v)} />
                  </div>

                  {mode === "text" && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Font Size</label>
                        <span className="text-[10px] font-mono font-bold text-primary">{fontSize}px</span>
                      </div>
                      <Slider value={[fontSize]} min={16} max={512} step={4} onValueChange={(v) => setFontSize(Array.isArray(v) ? v[0] : v)} />
                    </div>
                  )}
                </div>
              </div>
            </Tabs>

            <div className="flex flex-col gap-3 pt-4">
              <Button 
                onClick={handleAdd}
                className="h-14 bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest gap-2 shadow-xl shadow-primary/20"
              >
                <Plus className="w-4 h-4" /> Add to Queue
              </Button>
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  onClick={handleRandomize}
                  variant="outline"
                  className="h-12 border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white gap-2 font-bold uppercase tracking-widest text-[10px]"
                >
                  <Dice5 className="w-3.5 h-3.5" /> Randomize
                </Button>
                <Button 
                  onClick={() => handleGenerateMany(5)}
                  variant="outline"
                  className="h-12 border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white gap-2 font-bold uppercase tracking-widest text-[10px]"
                >
                  <Grid className="w-3.5 h-3.5" /> Batch (5)
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Preview / Queue Area */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          <div className="flex items-center justify-between px-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 flex items-center gap-3">
              Generated Assets <span className="bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-full text-zinc-400">{generatedImages.length}</span>
            </h3>
            {generatedImages.length > 0 && (
              <div className="flex gap-4">
                <button 
                  onClick={clearAll}
                  className="text-[9px] font-black uppercase tracking-widest text-zinc-700 hover:text-red-500 transition-colors"
                >
                  Clear All
                </button>
                <Button 
                  onClick={downloadAll}
                  disabled={isGenerating}
                  className="h-8 px-4 bg-primary text-white text-[9px] font-black uppercase tracking-widest rounded-lg shadow-lg shadow-primary/20 gap-2"
                >
                  {isGenerating ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                  Download All
                </Button>
              </div>
            )}
          </div>

          <div className="flex-1 min-h-[500px] bg-[#0c0c0e] border border-zinc-900 rounded-[3rem] p-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-10 content-start overflow-auto">
            {generatedImages.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center opacity-10 py-20 grayscale gap-6">
                <ImageIcon className="w-32 h-32" />
                <div className="text-center space-y-2">
                  <p className="text-2xl font-black uppercase tracking-[0.3em] italic leading-tight">No Assets in Queue</p>
                  <p className="text-xs font-bold uppercase tracking-widest">Configure and add images to the grid</p>
                </div>
              </div>
            ) : (
              generatedImages.map((img) => (
                <div 
                  key={img.id}
                  className="group relative animate-in fade-in zoom-in duration-300 flex flex-col items-center"
                >
                  {/* Invisible container for high-quality export */}
                  <div 
                    ref={el => { containerRefs.current[img.id] = el }}
                    className="absolute opacity-0 pointer-events-none"
                    style={{
                      width: `${img.size}px`,
                      height: `${img.size}px`,
                      backgroundColor: img.bgColor,
                      borderRadius: `${img.borderRadius}px`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: `${img.padding}px`,
                      overflow: "hidden"
                    }}
                  >
                    {img.mode === "icon" ? (
                      <Icon 
                        icon={img.content} 
                        style={{ color: img.color, width: "100%", height: "100%" }} 
                      />
                    ) : (
                      <span style={{ 
                        color: img.color, 
                        fontSize: `${img.fontSize}px`, 
                        fontWeight: "black",
                        fontFamily: "var(--font-sans)"
                      }}>
                        {img.content}
                      </span>
                    )}
                  </div>

                  {/* Visual Preview Card */}
                  <div className="w-full max-w-[200px] space-y-4">
                    <div 
                      className="aspect-square bg-zinc-950 border border-zinc-800 rounded-3xl flex items-center justify-center overflow-hidden shadow-2xl group-hover:border-primary/50 transition-all group-hover:scale-[1.02] duration-500"
                      style={{ 
                        backgroundColor: img.bgColor,
                        borderRadius: `${(img.borderRadius / img.size) * 200}px`, 
                        padding: `${(img.padding / img.size) * 200}px` 
                      }}
                    >
                      {img.mode === "icon" ? (
                        <Icon 
                          icon={img.content} 
                          style={{ color: img.color, width: "100%", height: "100%" }} 
                        />
                      ) : (
                        <span style={{ 
                          color: img.color, 
                          fontSize: `${(img.fontSize / img.size) * 200}px`,
                          fontWeight: "black" 
                        }}>
                          {img.content}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between px-1">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] font-black uppercase text-zinc-300 tracking-wider truncate w-28">{img.content}</span>
                        <span className="text-[9px] font-mono font-bold text-zinc-600">{img.size}×{img.size}</span>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Tooltip>
                          <TooltipTrigger>
                            <button 
                              onClick={() => downloadImage(img.id, `gen-${img.content}`)}
                              className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-500 hover:text-primary hover:border-primary/50 transition-all shadow-lg"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent className="text-[10px] bg-zinc-950 border-zinc-800">Download PNG</TooltipContent>
                        </Tooltip>
                        <button 
                          onClick={() => removeImage(img.id)}
                          className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-500 hover:text-red-500 hover:border-red-500/50 transition-all shadow-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modern Status Footer */}
      <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-[2rem] flex items-center justify-center gap-4">
        <ImageIcon className="w-4 h-4 text-primary" />
        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest text-center">
          GPU Accelerated Rendering • Lossless PNG Export • Infinite Customization
        </p>
      </div>
    </div>
  );
}
