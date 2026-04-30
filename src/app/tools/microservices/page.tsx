"use client";

import React, { useState } from "react";
import { M3Textarea } from "@/components/ui/m3-ui";
import MermaidViewer from "@/components/MermaidViewer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Copy, RefreshCw } from "lucide-react";
import { toast } from "sonner";

const DEFAULT_CHART = `graph TD
    subgraph Frontend
        Web[React Dashboard]
        Mobile[Flutter App]
    end

    subgraph "API Layer"
        Gateway[API Gateway]
    end

    subgraph "Core Services"
        Auth[Auth Service]
        Inventory[Inventory Service]
        Order[Order Service]
        Payment[Payment Service]
    end

    subgraph "Storage"
        DB1[(Postgres - User)]
        DB2[(Redis - Cache)]
        DB3[(MongoDB - Orders)]
    end

    Web --> Gateway
    Mobile --> Gateway

    Gateway --> Auth
    Gateway --> Inventory
    Gateway --> Order

    Order --> Payment
    Order --> Inventory
    
    Auth --> DB1
    Inventory --> DB2
    Order --> DB3`;

export default function MicroservicesPage() {
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
        <h2 className="text-xl font-semibold tracking-tight">Service Dependency Mapper</h2>
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
            <span className="text-xs font-medium uppercase tracking-wider opacity-60">Topology Definition</span>
          </div>
          <M3Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter Mermaid graph syntax..."
            className="flex-1 font-mono text-sm resize-none bg-background/50"
          />
        </Card>

        <Card className="flex flex-col p-4 bg-muted/20 border-none shadow-none overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium uppercase tracking-wider opacity-60">Topology Preview</span>
          </div>
          <MermaidViewer chart={input} />
        </Card>
      </div>
    </div>
  );
}
