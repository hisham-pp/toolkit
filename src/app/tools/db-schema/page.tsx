"use client";

import React, { useState, useCallback } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Handle,
  Position,
  NodeProps,
  Edge,
  Connection,
  Node,
} from "@xyflow/react";
import { 
  Plus, 
  Trash2, 
  Key, 
  Type, 
  FileText,
  Hash,
  Calendar,
  Settings
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { M3Input } from "@/components/ui/m3-ui";

// Custom Table Node Component
const TableNode = ({ data }: NodeProps) => {
  const columns = data.columns as any[];
  const tableName = data.label as string;

  return (
    <div className="shadow-2xl rounded-lg bg-card border border-border min-w-[200px] overflow-hidden">
      <div className="bg-primary/10 px-3 py-2 border-b border-border flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-primary">{tableName}</span>
        <Settings className="w-3 h-3 opacity-50" />
      </div>
      <div className="p-0">
        {columns.map((col, idx) => (
          <div key={idx} className="px-3 py-1.5 flex items-center justify-between text-[11px] border-b border-border/50 last:border-0 relative group hover:bg-muted/50 transition-colors">
            <Handle 
              type="target" 
              position={Position.Left} 
              id={`target-${col.name}`}
              className="w-1.5 h-1.5 !bg-primary/50" 
            />
            <div className="flex items-center gap-2">
              {col.isPk ? <Key className="w-3 h-3 text-yellow-500" /> : <div className="w-3" />}
              <span className="font-medium">{col.name}</span>
            </div>
            <span className="opacity-50 font-mono italic">{col.type}</span>
            <Handle 
              type="source" 
              position={Position.Right} 
              id={`source-${col.name}`}
              className="w-1.5 h-1.5 !bg-primary/50" 
            />
          </div>
        ))}
      </div>
      <div className="p-2 bg-muted/30 border-t border-border flex justify-center">
        <Button variant="ghost" size="sm" className="h-6 text-[10px] w-full hover:bg-primary/10">
          <Plus className="w-3 h-3 mr-1" /> Add Column
        </Button>
      </div>
    </div>
  );
};

const nodeTypes = {
  table: TableNode,
};

const initialNodes: Node[] = [
  {
    id: "users",
    type: "table",
    position: { x: 50, y: 50 },
    data: { 
      label: "users", 
      columns: [
        { name: "id", type: "uuid", isPk: true },
        { name: "email", type: "varchar", isPk: false },
        { name: "password", type: "text", isPk: false },
        { name: "created_at", type: "timestamp", isPk: false },
      ]
    },
  },
  {
    id: "posts",
    type: "table",
    position: { x: 400, y: 50 },
    data: { 
      label: "posts", 
      columns: [
        { name: "id", type: "uuid", isPk: true },
        { name: "author_id", type: "uuid", isPk: false },
        { name: "title", type: "varchar", isPk: false },
        { name: "content", type: "text", isPk: false },
        { name: "status", type: "varchar", isPk: false },
      ]
    },
  },
];

const initialEdges: Edge[] = [
  { 
    id: "e-users-posts", 
    source: "users", 
    target: "posts", 
    sourceHandle: "source-id", 
    targetHandle: "target-author_id",
    animated: true,
    style: { stroke: "#6366f1" }
  },
];

export default function DbSchemaPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [newTableName, setNewTableName] = useState("");

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const addTable = () => {
    if (!newTableName) return;
    const newNode: Node = {
      id: newTableName.toLowerCase(),
      type: "table",
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: { 
        label: newTableName.toLowerCase(), 
        columns: [
          { name: "id", type: "uuid", isPk: true },
        ]
      },
    };
    setNodes((nds) => nds.concat(newNode));
    setNewTableName("");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold tracking-tight">Database Schema Designer</h2>
      </div>

      <div className="flex flex-1 gap-6 overflow-hidden">
        <Card className="w-64 p-4 bg-muted/20 border-none shadow-none flex flex-col gap-4">
          <span className="text-xs font-medium uppercase tracking-wider opacity-60">Schema Management</span>
          
          <div className="space-y-2">
            <span className="text-[10px] font-bold opacity-40 uppercase tracking-widest">New Table</span>
            <div className="flex gap-2">
              <M3Input 
                value={newTableName}
                onChange={(e) => setNewTableName(e.target.value)}
                placeholder="Table name..."
                className="h-8 text-xs"
              />
              <Button size="sm" className="h-8 w-8 p-0 shrink-0" onClick={addTable}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="mt-4 space-y-2">
             <span className="text-[10px] font-bold opacity-40 uppercase tracking-widest">Data Types</span>
             <div className="grid grid-cols-2 gap-1 opacity-60">
                {["uuid", "varchar", "text", "int4", "timestamp", "bool"].map(t => (
                  <div key={t} className="px-2 py-1 bg-background/50 rounded text-[9px] font-mono text-center border border-border/50">
                    {t}
                  </div>
                ))}
             </div>
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
