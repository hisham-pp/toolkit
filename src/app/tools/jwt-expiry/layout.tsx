import { Metadata } from "next";
import { ToolRegistry } from "@/utility/constants/tools";
import ToolLayout from "@/components/ToolLayout";

const tool = ToolRegistry.getById("jwt-expiry")!;

export const metadata: Metadata = {
  title: tool.metaTitle,
  description: tool.metaDescription,
  keywords: tool.keywords,
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ToolLayout tool={tool}>{children}</ToolLayout>;
}
