"use client";

import { useEffect } from "react";
import { trackToolVisit } from "@/utility/helpers/tools";

interface ToolTrackerProps {
  toolId: string;
}

export default function ToolTracker({ toolId }: ToolTrackerProps) {
  useEffect(() => {
    trackToolVisit(toolId);
  }, [toolId]);

  return null;
}
