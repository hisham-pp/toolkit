"use client";

import React, { useState } from "react";
import { M3Textarea } from "@/components/ui/m3-ui";
import MermaidViewer from "@/components/MermaidViewer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Copy, Play } from "lucide-react";
import { toast } from "sonner";

const DEFAULT_CHART = `sequenceDiagram
    participant User
    participant API Gateway
    participant Auth Service
    participant User Service
    participant Database

    User->>API Gateway: GET /profile
    API Gateway->>Auth Service: Validate Token
    Auth Service-->>API Gateway: Token Valid (User ID: 123)
    API Gateway->>User Service: Get Profile (ID: 123)
    User Service->>Database: Query User Data
    Database-->>User Service: User Record
    User Service-->>API Gateway: User Profile JSON
    API Gateway-->>User: 200 OK (Profile Data)`;

export default function ApiFlowPage() {
  const [input, setInput] = useState(DEFAULT_CHART);

  const handleCopy = () => {
    navigator.clipboard.writeText(input);
    toast.success("Mermaid syntax copied to clipboard");
  };

  const handleClear = () => {
    setInput("");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold tracking-tight">API Flow Visualizer</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleCopy}>
            <Copy className="mr-2 h-4 w-4" />
            Copy
          </Button>
          <Button variant="outline" size="sm" onClick={handleClear} className="text-destructive hover:bg-destructive/10">
            <Trash2 className="mr-2 h-4 w-4" />
            Clear
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 overflow-hidden">
        <Card className="flex flex-col p-4 bg-muted/20 border-none shadow-none overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium uppercase tracking-wider opacity-60">Mermaid Syntax</span>
          </div>
          <M3Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter Mermaid sequence diagram syntax..."
            className="flex-1 font-mono text-sm resize-none bg-background/50"
          />
        </Card>

        <Card className="flex flex-col p-4 bg-muted/20 border-none shadow-none overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium uppercase tracking-wider opacity-60">Live Preview</span>
          </div>
          <MermaidViewer chart={input} />
        </Card>
      </div>
    </div>
  );
}
