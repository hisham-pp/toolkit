"use client";

import React, { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";

interface MermaidViewerProps {
  chart: string;
  className?: string;
}

// Initialize mermaid once
mermaid.initialize({
  startOnLoad: false,
  theme: "dark",
  securityLevel: "loose",
  fontFamily: "Inter, sans-serif",
});

export default function MermaidViewer({ chart, className = "" }: MermaidViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const renderChart = async () => {
      if (!chart || !containerRef.current) return;

      try {
        setError(null);
        // Unique ID for each render
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
        const { svg } = await mermaid.render(id, chart);
        setSvg(svg);
      } catch (err) {
        console.error("Mermaid rendering error:", err);
        setError("Invalid Mermaid syntax. Please check your input.");
      }
    };

    renderChart();
  }, [chart]);

  return (
    <div className={`w-full h-full flex flex-col items-center justify-center p-4 bg-muted/30 rounded-lg overflow-auto ${className}`}>
      {error ? (
        <div className="text-destructive text-sm font-mono p-4 bg-destructive/10 border border-destructive/20 rounded">
          {error}
        </div>
      ) : (
        <div 
          ref={containerRef} 
          className="mermaid-container w-full h-full flex items-center justify-center"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      )}
    </div>
  );
}
