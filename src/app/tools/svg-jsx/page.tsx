"use client";

import React, { useState, useEffect, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import { ToolRegistry } from "@/utility/constants/tools";
import { M3Textarea, M3Input } from "@/components/ui/m3-ui";
import { Button } from "@/components/ui/button";
import { Copy, Trash2, Check, FileCode, Wand2, Palette } from "lucide-react";
import { toast } from "sonner";

export default function SvgJsx() {
  const tool = ToolRegistry.getById("svg-jsx")!;
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [componentName, setComponentName] = useState("Icon");
  const [isCopied, setIsCopied] = useState(false);

  const optimizeSvg = useCallback(() => {
    if (!input.trim()) {
      setOutput("");
      return;
    }

    try {
      let jsx = input;

      // 1. Remove XML declarations and doctypes
      jsx = jsx.replace(/<\?xml.*?\?>/gi, "");
      jsx = jsx.replace(/<!DOCTYPE.*?>/gi, "");
      jsx = jsx.replace(/<!--.*?-->/gs, "");

      // 2. Remove unnecessary attributes usually found in exports
      const attrsToRemove = [
        "xmlns:xlink",
        "xml:space",
        "version",
        "id",
        "xmlns",
      ];
      attrsToRemove.forEach((attr) => {
        const regex = new RegExp(`${attr}=".*?"`, "gi");
        jsx = jsx.replace(regex, "");
      });

      // 3. Convert kebab-case attributes to camelCase for JSX
      const attributeMap: Record<string, string> = {
        "accent-height": "accentHeight",
        "alignment-baseline": "alignmentBaseline",
        "arabic-form": "arabicForm",
        "baseline-shift": "baselineShift",
        "cap-height": "capHeight",
        "clip-path": "clipPath",
        "clip-rule": "clipRule",
        "color-interpolation": "colorInterpolation",
        "color-interpolation-filters": "colorInterpolationFilters",
        "color-profile": "colorProfile",
        "color-rendering": "colorRendering",
        "dominant-baseline": "dominantBaseline",
        "enable-background": "enableBackground",
        "fill-opacity": "fillOpacity",
        "fill-rule": "fillRule",
        "flood-color": "floodColor",
        "flood-opacity": "floodOpacity",
        "font-family": "fontFamily",
        "font-size": "fontSize",
        "font-size-adjust": "fontSizeAdjust",
        "font-stretch": "fontStretch",
        "font-style": "fontStyle",
        "font-variant": "fontVariant",
        "font-weight": "fontWeight",
        "glyph-name": "glyphName",
        "glyph-orientation-horizontal": "glyphOrientationHorizontal",
        "glyph-orientation-vertical": "glyphOrientationVertical",
        "horiz-adv-x": "horizAdvX",
        "horiz-origin-x": "horizOriginX",
        "image-rendering": "imageRendering",
        "letter-spacing": "letterSpacing",
        "lighting-color": "lightingColor",
        "marker-end": "markerEnd",
        "marker-mid": "markerMid",
        "marker-start": "markerStart",
        "overline-position": "overlinePosition",
        "overline-thickness": "overlineThickness",
        "paint-order": "paintOrder",
        "panose-1": "panose1",
        "pointer-events": "pointerEvents",
        "rendering-intent": "renderingIntent",
        "shape-rendering": "shapeRendering",
        "stop-color": "stopColor",
        "stop-opacity": "stopOpacity",
        "strikethrough-position": "strikethroughPosition",
        "strikethrough-thickness": "strikethroughThickness",
        "stroke-dasharray": "strokeDasharray",
        "stroke-dashoffset": "strokeDashoffset",
        "stroke-linecap": "strokeLinecap",
        "stroke-linejoin": "strokeLinejoin",
        "stroke-miterlimit": "strokeMiterlimit",
        "stroke-opacity": "strokeOpacity",
        "stroke-width": "strokeWidth",
        "text-anchor": "textAnchor",
        "text-decoration": "textDecoration",
        "text-rendering": "textRendering",
        "underline-position": "underlinePosition",
        "underline-thickness": "underlineThickness",
        "unicode-bidi": "unicodeBidi",
        "unicode-range": "unicodeRange",
        "units-per-em": "unitsPerEm",
        "v-alphabetic": "vAlphabetic",
        "v-hanging": "vHanging",
        "v-ideographic": "vIdeographic",
        "v-mathematical": "vMathematical",
        "vector-effect": "vectorEffect",
        "vert-adv-y": "vertAdvY",
        "vert-origin-x": "vertOriginX",
        "vert-origin-y": "vertOriginY",
        "word-spacing": "wordSpacing",
        "writing-mode": "writingMode",
        "x-height": "xHeight",
        class: "className",
      };

      Object.entries(attributeMap).forEach(([kebab, camel]) => {
        const regex = new RegExp(`\\s${kebab}=`, "gi");
        jsx = jsx.replace(regex, ` ${camel}=`);
      });

      // 4. Clean up whitespace and empty lines
      jsx = jsx.trim().replace(/\s+/g, " ");

      // 5. Wrap in React Component
      const name = componentName.trim() || "Icon";
      const finalCode = `import React from 'react';\n\nconst ${name} = (props: React.SVGProps<SVGSVGElement>) => (\n  ${jsx.replace(
        "<svg",
        "<svg {...props}"
      )}\n);\n\nexport default ${name};`;

      setOutput(finalCode);
    } catch (err) {
      setOutput("// Error parsing SVG input");
    }
  }, [input, componentName]);

  useEffect(() => {
    optimizeSvg();
  }, [optimizeSvg]);

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setIsCopied(true);
    toast.success("Copied JSX code");
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <ToolLayout tool={tool}>
      <div className="flex flex-col h-full gap-6 animate-in fade-in duration-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <M3Input 
            label="Component Name"
            placeholder="e.g. LogoIcon"
            value={componentName}
            onChange={(e) => setComponentName(e.target.value)}
            icon={<FileCode className="w-4 h-4" />}
          />
          <div className="flex items-end gap-3">
            <Button 
              variant="outline" 
              className="h-14 flex-1 rounded-2xl border-zinc-800 bg-zinc-950/50 hover:bg-zinc-900 text-zinc-400 hover:text-white"
              onClick={() => setInput("")}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear
            </Button>
            <Button 
              className="h-14 flex-1 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold"
              onClick={handleCopy}
              disabled={!output || output.includes("Error")}
            >
              {isCopied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
              {isCopied ? "Copied" : "Copy JSX"}
            </Button>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[500px]">
          <div className="relative flex flex-col group">
            <div className="absolute top-6 right-6 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
               <div className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                 <Palette className="w-3 h-3 text-primary" />
                 Raw SVG
               </div>
            </div>
            <M3Textarea 
              label="Raw SVG Input"
              placeholder="Paste your <svg>...</svg> code here..."
              className="flex-1 font-mono text-xs leading-relaxed"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </div>

          <div className="relative flex flex-col group">
            <div className="absolute top-6 right-6 z-10">
               <div className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2 shadow-2xl">
                 <Wand2 className="w-3 h-3" />
                 React Component (JSX)
               </div>
            </div>
            <M3Textarea 
              label="Optimized JSX Output"
              readOnly
              placeholder="JSX will appear here..."
              className="flex-1 font-mono text-xs leading-relaxed bg-zinc-950/30 border-zinc-900/50 text-primary/80"
              value={output}
            />
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
