import { Code2, Braces, Hash, FileJson, Type } from "lucide-react";
import React from "react";

export type ToolConfig = {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  route: string;
  category: "formatting" | "converters" | "encoding" | "generation";
};

export const TOOLS: ToolConfig[] = [
  {
    id: "json-formatter",
    name: "JSON Formatter",
    description: "Beautify and validate your JSON data with history support.",
    icon: FileJson,
    route: "/tools/json-formatter",
    category: "formatting",
  },
  // Placeholders for future tools
  {
    id: "base64",
    name: "Base64 Encoder",
    description: "Encode or decode strings to Base64 format.",
    icon: Hash,
    route: "/tools/base64",
    category: "encoding",
  },
  {
    id: "jwt-decoder",
    name: "JWT Decoder",
    description: "Decode and inspect JSON Web Tokens.",
    icon: Code2,
    route: "/tools/jwt",
    category: "converters",
  }
];
