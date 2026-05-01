import React from "react";
import ToolLayout from "@/components/ToolLayout";
import { ToolRegistry } from "@/utility/constants/tools";
import { notFound } from "next/navigation";

export default function TextAnalyzerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tool = ToolRegistry.getById("text-analyzer");

  if (!tool) {
    return notFound();
  }

  return (
    <ToolLayout tool={tool}>
      {children}
    </ToolLayout>
  );
}
