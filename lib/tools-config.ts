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
  Search,
  Settings2,
  ImagePlus,
  Zap,
  LayoutGrid,
  Split,
  Files,
  FileCode,
  Palette,
  Pipette,
  Layers,
  Film,
  Paintbrush,
  Calculator,
  Ruler,
  Scale,
  ShieldPlus,
  Lock,
  Timer,
  FileSpreadsheet as FileText, // Re-using or mapping for GDocs
  Terminal,
  CopyCheck,
  Scaling,
  Minimize2,
  Dice5,
  Keyboard,
  ListFilter
} from "lucide-react";
import React from "react";

export type ToolCategory = "formatting" | "converters" | "encoding" | "generation" | "security" | "utils" | "diff";

export class Tool {
  constructor(
    public id: string,
    public name: string,
    public description: string,
    public icon: React.ElementType,
    public route: string,
    public category: ToolCategory,
    public keywords: string[] = []
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
      "env-manager",
      "Env Manager",
      "Format, obscure, and manage .env file variables securely.",
      Settings2,
      "/tools/env-manager",
      "formatting",
      ["environment", "variables", "secrets", "config", "dotenv"]
    ),
    new Tool(
      "base64-file",
      "File to Base64",
      "Convert images and files to Base64 data strings for embedding.",
      ImagePlus,
      "/tools/base64-file",
      "encoding",
      ["image", "upload", "string", "data-uri", "binary"]
    ),
    new Tool(
      "api-builder",
      "API Builder",
      "Mini Postman-style UI for testing REST API requests.",
      Globe,
      "/tools/api-builder",
      "utils",
      ["rest", "http", "request", "fetch", "endpoint", "postman"]
    ),
    new Tool(
      "code-diff",
      "Code Diff",
      "Compare various code languages with syntax highlighting support.",
      Split,
      "/tools/code-diff",
      "diff",
      ["compare", "git", "merge", "syntax", "highlight"]
    ),
    new Tool(
      "yaml-diff",
      "YAML Diff",
      "Structural comparison for YAML configuration files.",
      Files,
      "/tools/yaml-diff",
      "diff",
      ["config", "kubernetes", "infra", "comparison"]
    ),
    new Tool(
      "excel-diff",
      "Excel Diff",
      "Compare two Spreadsheet/CSV files for row differences.",
      FileSpreadsheet,
      "/tools/excel-diff",
      "diff",
      ["csv", "data", "spreadsheet", "rows", "columns"]
    ),
    new Tool(
      "json-diff",
      "JSON Diff",
      "Compare two JSON payloads and see the differences.",
      FileJson,
      "/tools/json-diff",
      "diff",
      ["api", "payload", "structure", "object", "comparison"]
    ),
    new Tool(
      "text-diff",
      "Text Diff",
      "Compare two blocks of text side-by-side.",
      AlignLeft,
      "/tools/text-diff",
      "diff",
      ["letter", "word", "line", "comparison"]
    ),
    new Tool(
      "box-shadow",
      "Box Shadow",
      "Interactive CSS box-shadow generator and preview.",
      LayoutGrid,
      "/tools/box-shadow",
      "generation",
      ["style", "css", "visual", "ui", "design"]
    ),
    new Tool(
      "cron-parser",
      "Cron Parser",
      "Decode cron expressions into human-readable text.",
      Clock,
      "/tools/cron-parser",
      "utils",
      ["schedule", "time", "job", "linux", "automation"]
    ),
    new Tool(
      "password-strength",
      "Strength Check",
      "Analyze password strength and entropy.",
      ShieldCheck,
      "/tools/password-strength",
      "security",
      ["auth", "entropy", "security", "bits"]
    ),
    new Tool(
      "markdown-html",
      "MD to HTML",
      "Convert Markdown content into clean, semantic HTML code.",
      FileCode,
      "/tools/markdown-html",
      "converters",
      ["convert", "web", "rich-text", "blog", "md", "markdown"]
    ),
    new Tool(
      "xml-json",
      "XML to JSON",
      "Convert between XML and JSON formats easily.",
      FileType,
      "/tools/xml-json",
      "converters",
      ["soap", "rest", "parsing"]
    ),
    new Tool(
      "json-formatter",
      "JSON Formatter",
      "Beautify and validate your JSON data with history support.",
      FileJson,
      "/tools/json-formatter",
      "formatting",
      ["pretty", "lint", "validate", "history", "beautify", "json", "format"]
    ),
    new Tool(
      "base64",
      "Base64 Tool",
      "Encode or decode strings to Base64 format.",
      Hash,
      "/tools/base64",
      "encoding",
      ["encode", "decode", "binary", "data", "b64", "base64"]
    ),
    new Tool(
      "url-encoder",
      "URL Encoder",
      "Encode or decode URL components safely.",
      Link2,
      "/tools/url-encoder",
      "encoding",
      ["uri", "params", "query", "web"]
    ),
    new Tool(
      "jwt-decoder",
      "JWT Decoder",
      "Decode and inspect JSON Web Tokens payloads.",
      Code2,
      "/tools/jwt-decoder",
      "security",
      ["auth", "token", "payload", "header", "signature", "jwt", "json"]
    ),
    new Tool(
      "uuid-generator",
      "UUID Generator",
      "Generate v4 UUIDs for your projects.",
      Fingerprint,
      "/tools/uuid-generator",
      "generation",
      ["guid", "id", "random", "unique", "uuid", "v4"]
    ),
    new Tool(
      "http-status",
      "HTTP Status",
      "Explore HTTP status codes and their meanings.",
      Globe,
      "/tools/http-status",
      "utils",
      ["error", "response", "codes", "lookup"]
    ),
    new Tool(
      "csv-json",
      "CSV to JSON",
      "Convert CSV data to JSON objects and vice versa.",
      FileSpreadsheet,
      "/tools/csv-json",
      "converters",
      ["excel", "export", "import", "data"]
    ),
    new Tool(
      "yaml-json",
      "YAML to JSON",
      "Convert between YAML and JSON formats.",
      FileType,
      "/tools/yaml-json",
      "converters",
      ["config", "docker", "parsing"]
    ),
    new Tool(
      "password-gen",
      "Password Generator",
      "Create secure, random passwords instantly.",
      Key,
      "/tools/password-generator",
      "security",
      ["random", "entropy", "privacy"]
    ),
    new Tool(
      "lorem-ipsum",
      "Lorem Ipsum",
      "Generate placeholder text for your designs.",
      AlignLeft,
      "/tools/lorem-ipsum",
      "generation",
      ["filler", "text", "mock", "dummy"]
    ),
    new Tool(
      "timezone",
      "Timezone Converter",
      "Convert and compare times across zones.",
      Clock,
      "/tools/timezone-converter",
      "utils",
      ["world", "clock", "offset", "utc"]
    ),
    new Tool(
      "hash-gen",
      "Hash Generator",
      "Generate MD5, SHA256 hashes for any text.",
      ShieldCheck,
      "/tools/hash-generator",
      "security",
      ["crypto", "md5", "sha256", "integrity"]
    ),
    new Tool(
      "bcrypt-gen",
      "Bcrypt Generator",
      "Securely hash passwords using Bcrypt algorithm.",
      ShieldCheck,
      "/tools/bcrypt-generator",
      "security",
      ["hash", "crypto", "rounds", "auth"]
    ),
    new Tool(
      "bcrypt-comp",
      "Bcrypt Checker",
      "Verify if a password matches a Bcrypt hash.",
      ShieldCheck,
      "/tools/bcrypt-comparator",
      "security",
      ["compare", "verify", "auth"]
    ),
    new Tool(
      "sql-formatter",
      "SQL Formatter",
      "Format and beautify your SQL queries.",
      FileJson,
      "/tools/sql-formatter",
      "formatting",
      ["database", "postgres", "mysql", "pretty"]
    ),
    new Tool(
      "regex-tester",
      "Regex Tester",
      "Test and debug regular expressions.",
      Search,
      "/tools/regex-tester",
      "utils",
      ["match", "replace", "pattern", "expression"]
    ),
    new Tool(
      "markdown-preview",
      "Markdown Preview",
      "Write and preview markdown in real-time.",
      Eye,
      "/tools/markdown-preview",
      "formatting",
      ["live", "render", "gfm", "editor", "md", "markdown"]
    ),
    new Tool(
      "color-picker",
      "Color Picker",
      "Advanced color selector with HSL, RGB, and Hex support.",
      Palette,
      "/tools/color-picker",
      "generation",
      ["ui", "palette", "design", "hex", "rgb"]
    ),
    new Tool(
      "image-color-picker",
      "Image Color Picker",
      "Extract colors and pick specific pixels from uploaded images.",
      Pipette,
      "/tools/image-color-picker",
      "generation",
      ["upload", "palette", "extraction"]
    ),
    new Tool(
      "theme-generator",
      "Theme Generator",
      "Generate cohesive color themes and palettes from base colors.",
      Layers,
      "/tools/theme-generator",
      "generation",
      ["shadcn", "sidebar", "layout", "visual"]
    ),
    new Tool(
      "animation-generator",
      "Animation Gen",
      "Build CSS animations and keyframes with live previews.",
      Film,
      "/tools/animation-generator",
      "generation",
      ["motion", "keyframes", "css", "transitions"]
    ),
    new Tool(
      "gradient-generator",
      "Gradient Gen",
      "Design complex CSS gradients with multiple color stops.",
      Paintbrush,
      "/tools/gradient-generator",
      "generation",
      ["radial", "linear", "style", "css"]
    ),
    new Tool(
      "md-gdocs",
      "Docs MD",
      "Convert Markdown to Rich Text for Google Docs pasting.",
      FileText,
      "/tools/md-gdocs",
      "converters",
      ["google", "docs", "formatting", "rich-text", "md", "markdown"]
    ),
    new Tool(
      "calculator",
      "Calculator",
      "Perform basic and scientific mathematical operations.",
      Calculator,
      "/tools/calculator",
      "utils",
      ["math", "sum", "scientific", "numbers"]
    ),
    new Tool(
      "distance-converter",
      "Distance Conv",
      "Convert between kilometers, miles, meters, and more.",
      Ruler,
      "/tools/distance-converter",
      "converters",
      ["length", "units", "imperial", "metric"]
    ),
    new Tool(
      "weight-converter",
      "Weight Conv",
      "Convert between kilograms, pounds, ounces, and grams.",
      Scale,
      "/tools/weight-converter",
      "converters",
      ["mass", "units", "imperial", "metric"]
    ),
    new Tool(
      "hmac-generator",
      "HMAC Gen",
      "Generate Hash-based Message Authentication Codes.",
      ShieldPlus,
      "/tools/hmac-generator",
      "security",
      ["crypto", "token", "sha256", "signature"]
    ),
    new Tool(
      "aes-tool",
      "AES Tool",
      "Encrypt and decrypt data using AES-256 algorithm.",
      Lock,
      "/tools/aes-tool",
      "security",
      ["crypto", "encryption", "privacy", "secure"]
    ),
    new Tool(
      "jwt-expiry",
      "JWT Simulator",
      "Simulate and check JWT token expiration states.",
      Timer,
      "/tools/jwt-expiry",
      "security",
      ["auth", "token", "session", "expiration"]
    ),
    new Tool(
      "password-policy",
      "Policy Builder",
      "Build and test enterprise-grade password policies.",
      ShieldCheck,
      "/tools/password-policy",
      "security",
      ["auth", "validation", "requirements", "enterprise"]
    ),
    new Tool(
      "psk-generator",
      "PSK Generator",
      "Generate secure Pre-Shared Keys for WPA/VPN/IPSec protocols.",
      Key,
      "/tools/psk-generator",
      "security",
      ["wpa2", "wpa3", "vpn", "ipsec", "encryption", "wifi", "password", "key"]
    ),
    new Tool(
      "json-duplicates",
      "Duplicate Finder",
      "Identify and remove duplicates from JSON arrays.",
      CopyCheck,
      "/tools/json-duplicates",
      "utils",
      ["json", "duplicates", "cleaning", "unique", "dedupe", "array"]
    ),
    new Tool(
      "deep-compare",
      "Deep Compare",
      "Deeply compare two JSON objects and find differences.",
      Scaling,
      "/tools/deep-compare",
      "diff",
      ["comparison", "diff", "deep", "json"]
    ),
    new Tool(
      "json-flattener",
      "JSON Flattener",
      "Flatten and unflatten nested JSON objects.",
      Minimize2,
      "/tools/json-flattener",
      "converters",
      ["flatten", "unflatten", "nested", "dot-notation"]
    ),
    new Tool(
      "case-converter",
      "Case Converter",
      "Convert text between camel, snake, kebab, and pascal cases.",
      Type,
      "/tools/case-converter",
      "utils",
      ["case", "string", "camel", "snake", "pascal"]
    ),
    new Tool(
      "data-generator",
      "Data Generator",
      "Generate mock data like names, emails, and addresses.",
      Dice5,
      "/tools/data-generator",
      "generation",
      ["mock", "faker", "random", "test-data", "fake", "dummy"]
    ),
    new Tool(
      "shortcut-cheatsheet",
      "Shortcuts",
      "Keyboard shortcut cheat sheet for developers.",
      Keyboard,
      "/tools/shortcut-cheatsheet",
      "utils",
      ["hotkeys", "keyboard", "productivity", "cheat-sheet"]
    ),
    new Tool(
      "json-sorter",
      "JSON Sorter",
      "Sort and visualize JSON object keys and array elements.",
      ListFilter,
      "/tools/json-sorter",
      "formatters" as ToolCategory,
      ["sort", "organize", "alphabetical", "visualize"]
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
