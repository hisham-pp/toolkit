"use client";

import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

import { cn } from "@/utility/helpers/utils";
import { useSync } from "@/components/sync-provider";

export default function SyncRefreshButton() {
  const router = useRouter();
  const { hasActiveConnection, isRefreshing, requestManualSync } = useSync();

  return (
    <button
      type="button"
      onClick={() => {
        if (!hasActiveConnection) {
          router.push("/settings");
          return;
        }
        void requestManualSync();
      }}
      className={cn(
        "rounded-lg p-2 transition-colors",
        hasActiveConnection ? "text-zinc-500 hover:bg-zinc-800 hover:text-white" : "text-zinc-700 hover:bg-zinc-800 hover:text-zinc-300",
      )}
      title={hasActiveConnection ? "Sync from this device" : "Open Settings & Sync"}
      aria-label={hasActiveConnection ? "Sync from this device" : "Open Settings & Sync"}
    >
      <RefreshCw className={cn("h-5 w-5", isRefreshing && "animate-spin", hasActiveConnection && !isRefreshing && "text-primary")} />
    </button>
  );
}
