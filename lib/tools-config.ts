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

export type ToolCategory = "formatting" | "converters" | "encoding" | "generation" | "security" | "utils";

export class Tool {
  constructor(
    public id: string,
    public name: string,
    public description: string,
    public icon: React.ElementType,
    public route: string,
    public category: ToolCategory
  ) {}

  get metaTitle() {
    return `${this.name} | DevHub`;
  }

  get metaDescription() {
    return this.description;
  }
}

export class ToolRegistry {
  private static tools: Tool[] = [
    new Tool(
      "json-formatter",
      "JSON Formatter",
      "Beautify and validate your JSON data with history support.",
      FileJson,
      "/tools/json-formatter",
      "formatting"
    ),
    new Tool(
      "base64",
      "Base64 Tool",
      "Encode or decode strings to Base64 format.",
      Hash,
      "/tools/base64",
      "encoding"
    ),
    new Tool(
      "url-encoder",
      "URL Encoder",
      "Encode or decode URL components safely.",
      Link2,
      "/tools/url-encoder",
      "encoding"
    ),
    new Tool(
      "jwt-decoder",
      "JWT Decoder",
      "Decode and inspect JSON Web Tokens payloads.",
      Code2,
      "/tools/jwt-decoder",
      "security"
    ),
    new Tool(
      "uuid-generator",
      "UUID Generator",
      "Generate v4 UUIDs for your projects.",
      Fingerprint,
      "/tools/uuid-generator",
      "generation"
    ),
    new Tool(
      "http-status",
      "HTTP Status",
      "Explore HTTP status codes and their meanings.",
      Globe,
      "/tools/http-status",
      "utils"
    ),
    new Tool(
      "csv-json",
      "CSV to JSON",
      "Convert CSV data to JSON objects and vice versa.",
      FileSpreadsheet,
      "/tools/csv-json",
      "converters"
    ),
    new Tool(
      "yaml-json",
      "YAML to JSON",
      "Convert between YAML and JSON formats.",
      FileType,
      "/tools/yaml-json",
      "converters"
    ),
    new Tool(
      "password-gen",
      "Password Generator",
      "Create secure, random passwords instantly.",
      Key,
      "/tools/password-generator",
      "security"
    ),
    new Tool(
      "lorem-ipsum",
      "Lorem Ipsum",
      "Generate placeholder text for your designs.",
      AlignLeft,
      "/tools/lorem-ipsum",
      "generation"
    ),
    new Tool(
      "timezone",
      "Timezone Converter",
      "Convert and compare times across zones.",
      Clock,
      "/tools/timezone-converter",
      "utils"
    ),
    new Tool(
      "hash-gen",
      "Hash Generator",
      "Generate MD5, SHA256 hashes for any text.",
      ShieldCheck,
      "/tools/hash-generator",
      "security"
    ),
    new Tool(
      "bcrypt-gen",
      "Bcrypt Generator",
      "Securely hash passwords using Bcrypt algorithm.",
      ShieldCheck,
      "/tools/bcrypt-generator",
      "security"
    ),
    new Tool(
      "bcrypt-comp",
      "Bcrypt Checker",
      "Verify if a password matches a Bcrypt hash.",
      ShieldCheck,
      "/tools/bcrypt-comparator",
      "security"
    ),
    new Tool(
      "sql-formatter",
      "SQL Formatter",
      "Format and beautify your SQL queries.",
      FileJson,
      "/tools/sql-formatter",
      "formatting"
    ),
    new Tool(
      "regex-tester",
      "Regex Tester",
      "Test and debug regular expressions.",
      Search,
      "/regex-tester",
      "utils"
    ),
    new Tool(
      "markdown-preview",
      "Markdown Preview",
      "Write and preview markdown in real-time.",
      Eye,
      "/markdown-preview",
      "formatting"
    ),
  ];

  static getAll() {
    return this.tools;
  }

  static getById(id: string) {
    return this.tools.find((t) => t.id === id);
  }

  static getByCategory(category: ToolCategory) {
    return this.tools.filter((t) => t.category === category);
  }
}

export const TOOLS = ToolRegistry.getAll();
