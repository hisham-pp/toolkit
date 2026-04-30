"use client";

import React, { useState, useCallback, useMemo } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Panel,
  Handle,
  Position,
  NodeProps,
  Edge,
  Connection,
  XYPosition,
  Node,
} from "@xyflow/react";
import { 
  Server, 
  Database, 
  Globe, 
  Smartphone, 
  Layers, 
  Shield, 
  Cpu, 
  HardDrive,
  Cloud,
  MessageSquare,
  Search,
  Activity,
  Plus,
  Zap
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Custom Node Component
const SystemNode = ({ data }: NodeProps) => {
  const Icon = data.icon as React.ElementType;
  
  return (
    <div className="px-4 py-2 shadow-xl rounded-xl bg-card border-2 border-primary/20 flex flex-col items-center gap-2 min-w-[120px] transition-all hover:border-primary/50 group">
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-primary" />
      <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <div className="text-xs font-bold text-center tracking-tight truncate w-full">
        {data.label as string}
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-primary" />
    </div>
  );
};

const nodeTypes = {
  system: SystemNode,
};

const initialNodes: Node[] = [
  {
    id: "1",
    type: "system",
    position: { x: 250, y: 50 },
    data: { label: "Web Client", icon: Globe },
  },
  {
    id: "2",
    type: "system",
    position: { x: 250, y: 200 },
    data: { label: "API Gateway", icon: Shield },
  },
  {
    id: "3",
    type: "system",
    position: { x: 250, y: 350 },
    data: { label: "App Server", icon: Server },
  },
  {
    id: "4",
    type: "system",
    position: { x: 250, y: 500 },
    data: { label: "Postgres", icon: Database },
  },
];

const initialEdges: Edge[] = [
  { id: "e1-2", source: "1", target: "2", animated: true },
  { id: "e2-3", source: "2", target: "3", animated: true },
  { id: "e3-4", source: "3", target: "4" },
];

const COMPONENT_TYPES = [
  { label: "Web Client", icon: Globe },
  { label: "Mobile App", icon: Smartphone },
  { label: "App Server", icon: Server },
  { label: "Database", icon: Database },
  { label: "Microservice", icon: Cpu },
  { label: "Load Balancer", icon: Layers },
  { label: "Auth / Security", icon: Shield },
  { label: "Cache / Redis", icon: Zap },
  { label: "Storage / S3", icon: HardDrive },
  { label: "Cloud Service", icon: Cloud },
  { label: "Message Queue", icon: MessageSquare },
  { label: "Search Engine", icon: Search },
];

export default function SystemDiagramPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const addNode = (type: { label: string; icon: React.ElementType }) => {
    const id = `${nodes.length + 1}`;
    const newNode: Node = {
      id,
      type: "system",
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: { label: type.label, icon: type.icon },
    };
    setNodes((nds) => nds.concat(newNode));
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold tracking-tight">System Diagram Builder</h2>
      </div>

      <div className="flex flex-1 gap-6 overflow-hidden">
        <Card className="w-64 p-4 bg-muted/20 border-none shadow-none flex flex-col gap-4 overflow-y-auto custom-scrollbar">
          <span className="text-xs font-medium uppercase tracking-wider opacity-60">Components</span>
          <div className="grid grid-cols-1 gap-2">
            {COMPONENT_TYPES.map((type) => (
              <Button
                key={type.label}
                variant="outline"
                size="sm"
                className="justify-start h-auto py-2 px-3 border-none bg-background/50 hover:bg-primary/10 transition-colors group"
                onClick={() => addNode(type)}
              >
                <type.icon className="mr-3 h-4 w-4 text-primary opacity-70 group-hover:opacity-100" />
                <span className="text-xs font-medium">{type.label}</span>
              </Button>
            ))}
          </div>
        </Card>

        <Card className="flex-1 bg-muted/20 border-none shadow-none overflow-hidden relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            colorMode="dark"
          >
            <Background />
            <Controls />
            <MiniMap 
              nodeStrokeColor="#6366f1"
              nodeColor="#18181b"
              maskColor="rgba(0, 0, 0, 0.5)"
              style={{ backgroundColor: "#09090b" }}
            />
          </ReactFlow>
        </Card>
      </div>
    </div>
  );
}
