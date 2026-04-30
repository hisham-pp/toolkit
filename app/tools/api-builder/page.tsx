"use client";

import React, { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { TOOLS } from "@/lib/tools-config";
import { 
  Send, 
  Plus, 
  Trash2, 
  Clock, 
  Settings2, 
  ChevronRight,
  Loader2,
  Globe,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { M3Input, M3Textarea, M3Select } from "@/components/ui/m3-ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Method = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

interface Header {
  key: string;
  value: string;
  enabled: boolean;
}

interface RequestHistory {
  id: string;
  method: Method;
  url: string;
  status: number;
  time: number;
  timestamp: number;
}

export default function ApiBuilder() {
  const tool = TOOLS.find((t) => t.id === "api-builder")!;
  const [url, setUrl] = useState("https://jsonplaceholder.typicode.com/posts/1");
  const [method, setMethod] = useState<Method>("GET");
  const [headers, setHeaders] = useState<Header[]>([
    { key: "Content-Type", value: "application/json", enabled: true }
  ]);
  const [body, setBody] = useState("");
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<RequestHistory[]>([]);
  const [activeTab, setActiveTab] = useState("response");

  const addHeader = () => {
    setHeaders([...headers, { key: "", value: "", enabled: true }]);
  };

  const removeHeader = (index: number) => {
    setHeaders(headers.filter((_, i) => i !== index));
  };

  const updateHeader = (index: number, updates: Partial<Header>) => {
    const newHeaders = [...headers];
    newHeaders[index] = { ...newHeaders[index], ...updates };
    setHeaders(newHeaders);
  };

  const handleSend = async () => {
    if (!url) {
      toast.error("Please enter a URL");
      return;
    }

    setLoading(true);
    setResponse(null);
    setActiveTab("response");

    const startTime = performance.now();
    const configHeaders: Record<string, string> = {};
    headers.forEach(h => {
      if (h.enabled && h.key) configHeaders[h.key] = h.value;
    });

    try {
      const res = await fetch(url, {
        method,
        headers: configHeaders,
        body: method !== "GET" && body ? body : undefined,
      });

      const endTime = performance.now();
      const status = res.status;
      const responseTime = Math.round(endTime - startTime);

      let data;
      const contentType = res.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        data = await res.json();
      } else {
        data = await res.text();
      }

      setResponse({
        status,
        statusText: res.statusText,
        time: responseTime,
        size: (JSON.stringify(data).length / 1024).toFixed(2) + " KB",
        headers: Object.fromEntries(res.headers.entries()),
        data
      });

      const historyItem: RequestHistory = {
        id: Math.random().toString(36).substr(2, 9),
        method,
        url,
        status,
        time: responseTime,
        timestamp: Date.now()
      };

      setHistory([historyItem, ...history].slice(0, 20));
      toast.success(`Request finished with status ${status}`);
    } catch (err: any) {
      toast.error(err.message || "Request failed");
      setResponse({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolLayout tool={tool}>
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 h-full">
        {/* Main Request Panel */}
        <div className="xl:col-span-8 flex flex-col gap-6">
          <div className="bg-[#161618] border border-zinc-800 rounded-3xl p-6 space-y-6">
            {/* URL Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <M3Select 
                label="Method"
                value={method} 
                onChange={(val) => setMethod(val as Method)}
                options={[
                  { label: "GET", value: "GET" },
                  { label: "POST", value: "POST" },
                  { label: "PUT", value: "PUT" },
                  { label: "DELETE", value: "DELETE" },
                  { label: "PATCH", value: "PATCH" },
                ]}
                className="w-full md:w-40"
              />
              <div className="flex-1 w-full">
                <M3Input
                  label="Endpoint URL"
                  className="font-mono"
                  placeholder="https://api.example.com/v1/..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
              <Button 
                onClick={handleSend} 
                disabled={loading}
                className="h-14 px-10 bg-primary hover:bg-primary/90 text-white font-black italic uppercase tracking-widest gap-3 rounded-2xl shadow-xl shadow-primary/20"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                Execute
              </Button>
            </div>

            {/* Config Tabs */}
            <Tabs defaultValue="headers">
              <TabsList className="bg-zinc-900/50 border border-zinc-800 p-1 w-fit mb-6">
                <TabsTrigger value="headers" className="text-[10px] uppercase tracking-widest font-bold">Headers</TabsTrigger>
                <TabsTrigger value="body" className="text-[10px] uppercase tracking-widest font-bold">Body</TabsTrigger>
                <TabsTrigger value="auth" className="text-[10px] uppercase tracking-widest font-bold">Auth</TabsTrigger>
              </TabsList>

              <TabsContent value="headers" className="space-y-4">
                <div className="space-y-2">
                  <div className="grid grid-cols-12 gap-4 px-2">
                    <div className="col-span-4 text-[10px] font-bold uppercase tracking-widest text-zinc-600">Key</div>
                    <div className="col-span-7 text-[10px] font-bold uppercase tracking-widest text-zinc-600">Value</div>
                  </div>
                  {headers.map((header, i) => (
                    <div key={i} className="grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-4">
                        <M3Input 
                          className="h-10 font-mono text-[10px]"
                          value={header.key}
                          onChange={(e) => updateHeader(i, { key: e.target.value })}
                          placeholder="Key"
                        />
                      </div>
                      <div className="col-span-7">
                        <M3Input 
                          className="h-10 font-mono text-[10px]"
                          value={header.value}
                          onChange={(e) => updateHeader(i, { value: e.target.value })}
                          placeholder="Value"
                        />
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeHeader(i)}
                        className="col-span-1 h-10 px-0 hover:text-red-500 hover:bg-red-500/5 rounded-xl"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={addHeader} className="w-full border-dashed border-zinc-800 h-9 bg-transparent hover:bg-zinc-900">
                    <Plus className="w-3.5 h-3.5 mr-2" /> Add Header
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="body">
                <M3Textarea
                  className="min-h-[200px] font-mono text-[13px] resize-none p-6"
                  placeholder='{ "key": "value" }'
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                />
              </TabsContent>

              <TabsContent value="auth" className="p-8 text-center bg-zinc-950 border border-zinc-800 rounded-xl">
                 <Settings2 className="w-8 h-8 text-zinc-800 mx-auto mb-3" />
                 <p className="text-xs text-zinc-500 italic">Advanced Auth coming soon. Use Headers for now.</p>
              </TabsContent>
            </Tabs>
          </div>

          {/* Response Panel */}
          <div className="flex-1 min-h-[400px] border border-zinc-800 rounded-3xl bg-[#0F0F10] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/50">
              <div className="flex items-center gap-6">
                <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Response</p>
                {response && !response.error && (
                  <div className="flex gap-4 text-[10px] font-mono font-bold uppercase">
                    <span className={cn(
                      response.status < 300 ? "text-green-500" : "text-red-500"
                    )}>Status: {response.status} {response.statusText}</span>
                    <span className="text-zinc-500">Time: {response.time}ms</span>
                    <span className="text-zinc-500">Size: {response.size}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-auto p-6 font-mono text-xs">
              {response ? (
                response.error ? (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 flex items-center gap-3">
                     <AlertCircle className="w-5 h-5 flex-shrink-0" />
                     <p>{response.error}</p>
                  </div>
                ) : (
                  <pre className="text-zinc-300">
                    {JSON.stringify(response.data, null, 2)}
                  </pre>
                )
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-zinc-700 italic space-y-4">
                  <Loader2 className={cn("w-12 h-12 opacity-10", loading && "animate-spin opacity-40")} />
                  <p>{loading ? "Executing request..." : "Response will appear here"}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar / History */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          <div className="bg-[#161618] border border-zinc-800 rounded-3xl p-6 flex flex-col h-full min-h-[400px]">
             <div className="flex items-center justify-between mb-6">
                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5" />
                  Request History
                </h3>
                {history.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={() => setHistory([])} className="h-8 text-zinc-700 hover:text-red-500">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
             </div>

             <div className="flex-1 overflow-auto space-y-2 pr-2 scrollbar-hide">
               {history.length > 0 ? (
                 history.map((item) => (
                   <button
                    key={item.id}
                    onClick={() => {
                      setUrl(item.url);
                      setMethod(item.method);
                    }}
                    className="w-full p-4 bg-zinc-950 border border-zinc-900 rounded-2xl text-left hover:border-primary/40 transition-all group"
                   >
                     <div className="flex items-center justify-between mb-2">
                        <span className={cn(
                          "text-[9px] font-black px-1.5 py-0.5 rounded",
                          item.method === "GET" ? "bg-green-500/10 text-green-500" :
                          item.method === "POST" ? "bg-blue-500/10 text-blue-500" : "bg-zinc-800 text-zinc-400"
                        )}>
                          {item.method}
                        </span>
                        <span className="text-[9px] font-mono text-zinc-600">
                          {new Date(item.timestamp).toLocaleTimeString()}
                        </span>
                     </div>
                     <p className="text-[10px] font-mono text-zinc-400 truncate mb-2">{item.url}</p>
                     <div className="flex items-center justify-between">
                        <span className={cn(
                          "text-[9px] font-bold",
                          item.status < 300 ? "text-green-500" : "text-red-500"
                        )}>
                          {item.status}
                        </span>
                        <span className="text-[9px] text-zinc-600 font-mono italic">{item.time}ms</span>
                     </div>
                   </button>
                 ))
               ) : (
                 <div className="h-full flex flex-col items-center justify-center text-zinc-800 text-center space-y-4">
                   <Clock className="w-10 h-10 opacity-20" />
                   <p className="text-[10px] uppercase font-bold tracking-widest italic opacity-50">Empty history</p>
                 </div>
               )}
             </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
