import type { Metadata } from "next";
import MarkdownPreviewClient from "@/components/MarkdownPreviewClient";

export const metadata: Metadata = {
  title: "Markdown Previewer & Editor",
  description: "Real-time Markdown editor with GitHub Flavored Markdown (GFM) support. Export to .md or copy formatted text instantly.",
  keywords: ["markdown editor", "gfm preview", "online markdown viewer", "markdown to html"],
};

export default function MarkdownPreview() {
  return <MarkdownPreviewClient />;
}
