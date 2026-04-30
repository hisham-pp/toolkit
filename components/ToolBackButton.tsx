"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function ToolBackButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="p-2 hover:bg-zinc-800 rounded-xl transition-colors group cursor-pointer"
      aria-label="Go back"
    >
      <ArrowLeft className="w-5 h-5 text-zinc-500 group-hover:text-primary transition-colors" />
    </button>
  );
}
