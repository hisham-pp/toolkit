import { 
  Code2, 
  Braces, 
  Hash, 
  FileJson, 
  Type, 
  Link2, 
  Fingerprint, 
  Globe, 
  FileSpreadsheet, 
  FileType, 
  Key, 
  AlignLeft, 
  Clock, 
  ShieldCheck, 
  Eye,
  Plus,
  Search
} from "lucide-react";
import React from "react";

export type ToolConfig = {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  route: string;
  category: "formatting" | "converters" | "encoding" | "generation" | "security" | "utils";
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
  {
    id: "base64",
    name: "Base64 Tool",
    description: "Encode or decode strings to Base64 format.",
    icon: Hash,
    route: "/tools/base64",
    category: "encoding",
  },
  {
    id: "url-encoder",
    name: "URL Encoder",
    description: "Encode or decode URL components safely.",
    icon: Link2,
    route: "/tools/url-encoder",
    category: "encoding",
  },
  {
    id: "jwt-decoder",
    name: "JWT Decoder",
    description: "Decode and inspect JSON Web Tokens payloads.",
    icon: Code2,
    route: "/tools/jwt-decoder",
    category: "security",
  },
  {
    id: "uuid-generator",
    name: "UUID Gen",
    description: "Generate v4 UUIDs for your projects.",
    icon: Fingerprint,
    route: "/tools/uuid-generator",
    category: "generation",
  },
  {
    id: "http-status",
    name: "HTTP Status",
    description: "Explore HTTP status codes and their meanings.",
    icon: Globe,
    route: "/tools/http-status",
    category: "utils",
  },
  {
    id: "csv-json",
    name: "CSV to JSON",
    description: "Convert CSV data to JSON objects and vice versa.",
    icon: FileSpreadsheet,
    route: "/tools/csv-json",
    category: "converters",
  },
  {
    id: "yaml-json",
    name: "YAML to JSON",
    description: "Convert between YAML and JSON formats.",
    icon: FileType,
    route: "/tools/yaml-json",
    category: "converters",
  },
  {
    id: "password-gen",
    name: "Password Gen",
    description: "Create secure, random passwords instantly.",
    icon: Key,
    route: "/tools/password-generator",
    category: "security",
  },
  {
    id: "lorem-ipsum",
    name: "Lorem Ipsum",
    description: "Generate placeholder text for your designs.",
    icon: AlignLeft,
    route: "/tools/lorem-ipsum",
    category: "generation",
  },
  {
    id: "timezone",
    name: "Timezone Tool",
    description: "Convert and compare times across zones.",
    icon: Clock,
    route: "/tools/timezone-converter",
    category: "utils",
  },
  {
    id: "hash-gen",
    name: "Hash Gen",
    description: "Generate MD5, SHA256 hashes for any text.",
    icon: ShieldCheck,
    route: "/tools/hash-generator",
    category: "security",
  },
  {
    id: "bcrypt-gen",
    name: "Bcrypt Gen",
    description: "Securely hash passwords using Bcrypt algorithm.",
    icon: ShieldCheck,
    route: "/tools/bcrypt-generator",
    category: "security",
  },
  {
    id: "bcrypt-comp",
    name: "Bcrypt Check",
    description: "Verify if a password matches a Bcrypt hash.",
    icon: ShieldCheck,
    route: "/tools/bcrypt-comparator",
    category: "security",
  },
  {
    id: "sql-formatter",
    name: "SQL Format",
    description: "Format and beautify your SQL queries.",
    icon: FileJson,
    route: "/tools/sql-formatter",
    category: "formatting",
  },
  {
    id: "regex-tester",
    name: "Regex Test",
    description: "Test and debug regular expressions.",
    icon: Search,
    route: "/tools/regex-tester",
    category: "utils",
  },
  {
    id: "markdown-preview",
    name: "Markdown Pre",
    description: "Write and preview markdown in real-time.",
    icon: Eye,
    route: "/tools/markdown-preview",
    category: "formatting",
  },
];
