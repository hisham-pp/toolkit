import { Metadata } from "next";
import ToolLayout from "@/components/ToolLayout";
import { ToolRegistry } from "@/utility/constants/tools";

export const metadata: Metadata = {
  title: "Image Generator",
  description: "Generate custom images from icons or text with various styles.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const tool = ToolRegistry.getById("image-generator");
  if (!tool) return null;

  return <ToolLayout tool={tool}>{children}</ToolLayout>;
}
