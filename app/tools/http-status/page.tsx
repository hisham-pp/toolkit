"use client";

import React, { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { TOOLS } from "@/lib/tools-config";
import { Search, Globe, Info } from "lucide-react";
import { Input } from "@/components/ui/input";

const HTTP_STATUS_CODES = [
  { code: 100, name: "Continue", description: "The server has received the request headers and the client should proceed to send the request body." },
  { code: 101, name: "Switching Protocols", description: "The requester has asked the server to switch protocols." },
  { code: 102, name: "Processing", description: "The server has received and is processing the request, but no response is available yet." },
  { code: 200, name: "OK", description: "The standard response for successful HTTP requests." },
  { code: 201, name: "Created", description: "The request has been fulfilled, resulting in the creation of a new resource." },
  { code: 202, name: "Accepted", description: "The request has been accepted for processing, but the processing has not been completed." },
  { code: 204, name: "No Content", description: "The server successfully processed the request and is not returning any content." },
  { code: 301, name: "Moved Permanently", description: "This and all future requests should be directed to the given URI." },
  { code: 302, name: "Found", description: "The resource was found, but at a different URI." },
  { code: 304, name: "Not Modified", description: "Indicates that the resource has not been modified since the version specified by the request headers." },
  { code: 400, name: "Bad Request", description: "The server cannot or will not process the request due to an apparent client error." },
  { code: 401, name: "Unauthorized", description: "Similar to 403 Forbidden, but specifically for use when authentication is required and has failed or has not yet been provided." },
  { code: 403, name: "Forbidden", description: "The request contained valid data and was understood by the server, but the server is refusing action." },
  { code: 404, name: "Not Found", description: "The requested resource could not be found but may be available in the future." },
  { code: 405, name: "Method Not Allowed", description: "A request method is not supported for the requested resource." },
  { code: 429, name: "Too Many Requests", description: "The user has sent too many requests in a given amount of time." },
  { code: 500, name: "Internal Server Error", description: "A generic error message, given when an unexpected condition was encountered and no more specific message is suitable." },
  { code: 502, name: "Bad Gateway", description: "The server was acting as a gateway or proxy and received an invalid response from the upstream server." },
  { code: 503, name: "Service Unavailable", description: "The server is currently unavailable (because it is overloaded or down for maintenance)." },
  { code: 504, name: "Gateway Timeout", description: "The server was acting as a gateway or proxy and did not receive a timely response from the upstream server." },
];

export default function HttpStatusTool() {
  const tool = TOOLS.find((t) => t.id === "http-status")!;
  const [search, setSearch] = useState("");

  const filtered = HTTP_STATUS_CODES.filter(s => 
    s.code.toString().includes(search) || 
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const getCategoryColor = (code: number) => {
    if (code >= 500) return "text-red-400";
    if (code >= 400) return "text-orange-400";
    if (code >= 300) return "text-blue-400";
    if (code >= 200) return "text-green-400";
    return "text-zinc-400";
  };

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input 
            placeholder="Search by status code or name..." 
            className="h-14 pl-12 bg-[#161618] border-zinc-800 focus-visible:ring-primary/20 transition-all text-lg"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((status) => (
            <div key={status.code} className="p-6 bg-[#161618]/50 border border-zinc-800 rounded-2xl hover:border-zinc-700 transition-all group">
              <div className="flex items-center gap-4 mb-3">
                <span className={`text-3xl font-black font-mono ${getCategoryColor(status.code)}`}>
                  {status.code}
                </span>
                <h3 className="font-bold text-lg text-zinc-100">{status.name}</h3>
              </div>
              <p className="text-sm text-zinc-500 leading-relaxed">
                {status.description}
              </p>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full py-20 text-center space-y-4">
              <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto">
                <Info className="w-8 h-8 text-zinc-700" />
              </div>
              <p className="text-zinc-500">No status codes found matching "{search}"</p>
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}
