import type { Metadata } from "next";
import ToolsDirectory from "@/components/ToolsDirectory";

export const metadata: Metadata = {
  title: "Tool Directory | Discover Developer Utilities",
  description: "Browse our comprehensive collection of developer tools. Everything from JSON formatting and Regex testing to Diff checkers and Base64 conversion.",
  keywords: ["developer tools catalog", "utility directory", "web tools list"],
};

export default function ToolsIndexPage() {
  return <ToolsDirectory />;
}
