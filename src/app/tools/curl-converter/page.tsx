"use client";

import React, { useState, useEffect, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import { ToolRegistry } from "@/utility/constants/tools";
import { M3Textarea, M3Select } from "@/components/ui/m3-ui";
import { Button } from "@/components/ui/button";
import { Copy, Trash2, Check, Terminal, Code2, Globe } from "lucide-react";
import { toast } from "sonner";

export default function CurlConverter() {
  const tool = ToolRegistry.getById("curl-converter")!;
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [language, setLanguage] = useState("fetch");
  const [isCopied, setIsCopied] = useState(false);

  const langOptions = [
    { label: "JavaScript (Fetch)", value: "fetch" },
    { label: "JavaScript (Axios)", value: "axios" },
    { label: "Python (Requests)", value: "python" },
    { label: "Go (Native)", value: "go" },
  ];

  const parseCurl = (curl: string) => {
    // Basic regex-based cURL parser
    const result = {
      url: "",
      method: "GET",
      headers: {} as Record<string, string>,
      data: null as string | null,
      auth: null as string | null,
    };

    // Clean up input: remove backslashes and newlines
    const cleanCurl = curl.replace(/\\\n/g, " ").replace(/\s+/g, " ");

    // Extract URL (usually the first string that looks like a URL)
    const urlMatch = cleanCurl.match(/(?:'|")?(https?:\/\/[^\s'"]+)(?:'|")?/);
    if (urlMatch) result.url = urlMatch[1];

    // Extract Method
    const methodMatch = cleanCurl.match(/(?:-X|--request)\s+([A-Z]+)/);
    if (methodMatch) result.method = methodMatch[1];

    // Extract Headers
    const headerMatches = cleanCurl.matchAll(/(?:-H|--header)\s+(['"])(.*?)\1/g);
    for (const match of headerMatches) {
      const parts = match[2].split(":");
      if (parts.length >= 2) {
        result.headers[parts[0].trim()] = parts.slice(1).join(":").trim();
      }
    }

    // Extract Data
    const dataMatch = cleanCurl.match(/(?:-d|--data|--data-raw|--data-binary)\s+(['"])(.*?)\1/);
    if (dataMatch) {
      result.data = dataMatch[2];
      if (result.method === "GET") result.method = "POST";
    }

    // Extract Auth
    const authMatch = cleanCurl.match(/(?:-u|--user)\s+(['"])(.*?)\1/);
    if (authMatch) result.auth = authMatch[2];

    return result;
  };

  const generateCode = useCallback(() => {
    if (!input.trim()) {
      setOutput("");
      return;
    }

    const parsed = parseCurl(input);
    if (!parsed.url) {
      setOutput("// Could not find a valid URL in the cURL command");
      return;
    }

    let code = "";
    if (language === "fetch") code = genFetch(parsed);
    else if (language === "axios") code = genAxios(parsed);
    else if (language === "python") code = genPython(parsed);
    else if (language === "go") code = genGo(parsed);

    setOutput(code);
  }, [input, language]);

  useEffect(() => {
    generateCode();
  }, [generateCode]);

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setIsCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <ToolLayout tool={tool}>
      <div className="flex flex-col h-full gap-6 animate-in fade-in duration-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <M3Select 
            label="Target Language"
            value={language}
            onChange={setLanguage}
            options={langOptions}
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
              disabled={!output || output.includes("//")}
            >
              {isCopied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
              {isCopied ? "Copied" : "Copy Code"}
            </Button>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[500px]">
          <div className="relative flex flex-col group">
            <div className="absolute top-6 right-6 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
               <div className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                 <Terminal className="w-3 h-3 text-primary" />
                 cURL Command
               </div>
            </div>
            <M3Textarea 
              label="cURL Command"
              placeholder="Paste your cURL command here..."
              className="flex-1 font-mono text-xs leading-relaxed"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </div>

          <div className="relative flex flex-col group">
            <div className="absolute top-6 right-6 z-10">
               <div className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2 shadow-2xl">
                 <Code2 className="w-3 h-3" />
                 {langOptions.find(l => l.value === language)?.label}
               </div>
            </div>
            <M3Textarea 
              label="Generated Code"
              readOnly
              placeholder="Production code will appear here..."
              className="flex-1 font-mono text-xs leading-relaxed bg-zinc-950/30 border-zinc-900/50 text-primary/80"
              value={output}
            />
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}

function genFetch(p: any) {
  let code = `fetch("${p.url}", {\n`;
  code += `  method: "${p.method}",\n`;
  
  const headers = { ...p.headers };
  if (p.auth) headers["Authorization"] = `Basic \${btoa("${p.auth}")}`;
  
  if (Object.keys(headers).length > 0) {
    code += `  headers: ${JSON.stringify(headers, null, 4).replace(/\n/g, "\n  ")},\n`;
  }
  
  if (p.data) {
    code += `  body: JSON.stringify(${p.data})\n`;
  } else {
    code = code.slice(0, -2) + "\n";
  }
  
  code += `})\n.then(res => res.json())\n.then(console.log);`;
  return code;
}

function genAxios(p: any) {
  let code = `import axios from "axios";\n\n`;
  code += `axios({\n`;
  code += `  url: "${p.url}",\n`;
  code += `  method: "${p.method}",\n`;
  
  const headers = { ...p.headers };
  if (p.auth) headers["Authorization"] = `Basic \${Buffer.from("${p.auth}").toString("base64")}`;
  
  if (Object.keys(headers).length > 0) {
    code += `  headers: ${JSON.stringify(headers, null, 4).replace(/\n/g, "\n  ")},\n`;
  }
  
  if (p.data) {
    code += `  data: ${p.data}\n`;
  } else {
    code = code.slice(0, -2) + "\n";
  }
  
  code += `})\n.then(res => console.log(res.data));`;
  return code;
}

function genPython(p: any) {
  let code = `import requests\n\n`;
  code += `url = "${p.url}"\n`;
  
  if (Object.keys(p.headers).length > 0) {
    code += `headers = ${JSON.stringify(p.headers, null, 4)}\n`;
  }
  
  code += `response = requests.${p.method.toLowerCase()}(url`;
  if (Object.keys(p.headers).length > 0) code += `, headers=headers`;
  if (p.data) code += `, json=${p.data}`;
  if (p.auth) {
    const [u, pr] = p.auth.split(":");
    code += `, auth=("Subagent ${u}", "${pr}")`;
  }
  code += `)\n\nprint(response.json())`;
  return code;
}

function genGo(p: any) {
  let code = `package main\n\nimport (\n\t"fmt"\n\t"net/http"\n\t"io/ioutil"\n\t"strings"\n)\n\n`;
  code += `func main() {\n`;
  code += `\turl := "${p.url}"\n`;
  
  if (p.data) {
    code += `\tpayload := strings.NewReader(\`${p.data}\`)\n`;
    code += `\treq, _ := http.NewRequest("${p.method}", url, payload)\n`;
  } else {
    code += `\treq, _ := http.NewRequest("${p.method}", url, nil)\n`;
  }
  
  for (const [k, v] of Object.entries(p.headers)) {
    code += `\treq.Header.Add("${k}", "${v}")\n`;
  }
  
  if (p.auth) {
    const [u, pr] = p.auth.split(":");
    code += `\treq.SetBasicAuth("${u}", "${pr}")\n`;
  }
  
  code += `\n\tres, _ := http.DefaultClient.Do(req)\n`;
  code += `\tdefer res.Body.Close()\n`;
  code += `\tbody, _ := ioutil.ReadAll(res.Body)\n\n`;
  code += `\tfmt.Println(string(body))\n}`;
  return code;
}
