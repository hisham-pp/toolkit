"use client";

import React, { useState, useEffect, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import { ToolRegistry } from "@/utility/constants/tools";
import { M3Textarea, M3Select, M3Input } from "@/components/ui/m3-ui";
import { Button } from "@/components/ui/button";
import { Copy, Trash2, Check, Braces, Code2, Zap } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function JSONTypeGen() {
  const tool = ToolRegistry.getById("json-type-gen")!;
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [rootName, setRootName] = useState("Root");
  const [format, setFormat] = useState("typescript");
  const [isCopied, setIsCopied] = useState(false);

  const formatOptions = [
    { label: "TypeScript Interface", value: "typescript" },
    { label: "Zod Schema", value: "zod" },
    { label: "Go Struct", value: "go" },
  ];

  const generateTypes = useCallback(() => {
    if (!input.trim()) {
      setOutput("");
      return;
    }

    try {
      const parsed = JSON.parse(input);
      let generated = "";

      if (format === "typescript") {
        generated = generateTS(parsed, rootName);
      } else if (format === "zod") {
        generated = generateZod(parsed, rootName);
      } else if (format === "go") {
        generated = generateGo(parsed, rootName);
      }

      setOutput(generated);
    } catch (err) {
      setOutput("// Invalid JSON input");
    }
  }, [input, format, rootName]);

  useEffect(() => {
    generateTypes();
  }, [generateTypes]);

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setIsCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleClear = () => {
    setInput("");
    setOutput("");
    toast.info("Cleared workspace");
  };

  return (
    <ToolLayout tool={tool}>
      <div className="flex flex-col h-full gap-6 animate-in fade-in duration-700">
        {/* Header Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <M3Input 
            label="Root Object Name"
            placeholder="e.g. UserResponse"
            value={rootName}
            onChange={(e) => setRootName(e.target.value)}
            icon={<Braces className="w-4 h-4" />}
          />
          <M3Select 
            label="Output Format"
            value={format}
            onChange={setFormat}
            options={formatOptions}
          />
          <div className="flex items-end gap-3">
            <Button 
              variant="outline" 
              className="h-14 flex-1 rounded-2xl border-zinc-800 bg-zinc-950/50 hover:bg-zinc-900 text-zinc-400 hover:text-white"
              onClick={handleClear}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear
            </Button>
            <Button 
              className="h-14 flex-1 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold"
              onClick={handleCopy}
              disabled={!output || output.includes("Invalid")}
            >
              {isCopied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
              {isCopied ? "Copied" : "Copy Result"}
            </Button>
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[500px]">
          <div className="relative flex flex-col group">
            <div className="absolute top-6 right-6 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
               <div className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                 <Zap className="w-3 h-3 text-primary" />
                 JSON Input
               </div>
            </div>
            <M3Textarea 
              label="JSON Input"
              placeholder='Paste your JSON here... {"id": 1, "name": "John Doe"}'
              className="flex-1 font-mono text-xs leading-relaxed"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </div>

          <div className="relative flex flex-col group">
            <div className="absolute top-6 right-6 z-10">
               <div className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2 shadow-2xl">
                 <Code2 className="w-3 h-3" />
                 Generated Code
               </div>
            </div>
            <M3Textarea 
              label="Generated Schema/Type"
              readOnly
              placeholder="Output will appear here..."
              className="flex-1 font-mono text-xs leading-relaxed bg-zinc-950/30 border-zinc-900/50 text-primary/80"
              value={output}
            />
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}

// Helper: Title Case
function toTitleCase(str: string) {
  return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}

// Conversion Logic: TypeScript
function generateTS(obj: any, name: string): string {
  const interfaces: string[] = [];

  function process(current: any, currentName: string): string {
    if (current === null) return "any";
    if (Array.isArray(current)) {
      if (current.length === 0) return "any[]";
      const type = process(current[0], currentName + "Item");
      return `${type}[]`;
    }
    if (typeof current === "object") {
      const interfaceName = toTitleCase(currentName);
      let res = `interface ${interfaceName} {\n`;
      for (const key in current) {
        const type = process(current[key], key);
        res += `  ${key}: ${type};\n`;
      }
      res += `}`;
      interfaces.push(res);
      return interfaceName;
    }
    return typeof current;
  }

  process(obj, name);
  return interfaces.reverse().join("\n\n");
}

// Conversion Logic: Zod
function generateZod(obj: any, name: string): string {
  const schemas: string[] = [];

  function process(current: any, currentName: string): string {
    if (current === null) return "z.any()";
    if (Array.isArray(current)) {
      if (current.length === 0) return "z.array(z.any())";
      const type = process(current[0], currentName + "Item");
      return `z.array(${type})`;
    }
    if (typeof current === "object") {
      const schemaName = currentName.charAt(0).toLowerCase() + currentName.slice(1) + "Schema";
      let res = `const ${schemaName} = z.object({\n`;
      for (const key in current) {
        const type = process(current[key], key);
        res += `  ${key}: ${type},\n`;
      }
      res += `});`;
      schemas.push(res);
      return schemaName;
    }
    if (typeof current === "string") return "z.string()";
    if (typeof current === "number") return "z.number()";
    if (typeof current === "boolean") return "z.boolean()";
    return "z.any()";
  }

  process(obj, name);
  const header = `import { z } from "zod";\n\n`;
  return header + schemas.reverse().join("\n\n");
}

// Conversion Logic: Go
function generateGo(obj: any, name: string): string {
  const structs: string[] = [];

  function process(current: any, currentName: string): string {
    if (current === null) return "interface{}";
    if (Array.isArray(current)) {
      if (current.length === 0) return "[]interface{}";
      const type = process(current[0], currentName + "Item");
      return `[]${type}`;
    }
    if (typeof current === "object") {
      const structName = toTitleCase(currentName);
      let res = `type ${structName} struct {\n`;
      for (const key in current) {
        const type = process(current[key], key);
        const goKey = toTitleCase(key);
        res += `\t${goKey} ${type} \`json:"${key}"\`\n`;
      }
      res += `}`;
      structs.push(res);
      return structName;
    }
    if (typeof current === "string") return "string";
    if (typeof current === "number") return Number.isInteger(current) ? "int" : "float64";
    if (typeof current === "boolean") return "bool";
    return "interface{}";
  }

  process(obj, name);
  return structs.reverse().join("\n\n");
}
