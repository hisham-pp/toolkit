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
  ListFilter,
  ListTodo,
  Network,
  Database,
  Activity,
  Server,ArrowRightLeft
} from "lucide-react";
import { ToolCategory } from "@/utility/enums/tool-category";
import { Tool } from "@/utility/types/tool";

export { Tool };

export class ToolRegistry {
  private static tools: Tool[] = [
    new Tool(
      "system-diagram",
      "System Diagram",
      "Create complex system architecture diagrams with drag-and-drop nodes.",
      Network,
      "/tools/system-diagram",
      ToolCategory.System,
      ["architecture", "diagram", "nodes", "flowchart", "system"]
    ),
    new Tool(
      "db-schema",
      "Database Schema Designer",
      "Visual database schema designer with table relations and field types.",
      Database,
      "/tools/db-schema",
      ToolCategory.System,
      ["database", "sql", "schema", "erd", "relations", "tables"]
    ),
    new Tool(
      "api-flow",
      "API Flow Visualizer",
      "Map API requests to services and databases using sequence diagrams.",
      Activity,
      "/tools/api-flow",
      ToolCategory.System,
      ["api", "flow", "sequence", "mermaid", "tracing", "mapping"]
    ),
    new Tool(
      "server-configs",
      "Server Configs",
      "Manage SSH server configurations, generate connection commands and download config files.",
      Server,
      "/tools/server-configs",
      ToolCategory.System,
      ["ssh", "server", "config", "remote", "terminal", "connection"]
    ),
    new Tool(
      "microservices",
      "Service Dependency Mapper",
      "Visualize dependencies and interactions between microservices.",
      Server,
      "/tools/microservices",
      ToolCategory.System,
      ["microservices", "dependencies", "topology", "mesh", "architecture"]
    ),
    new Tool(
      "env-manager",
      "Env Manager",
      "Format, obscure, and manage .env file variables securely.",
      Settings2,
      "/tools/env-manager",
      ToolCategory.Formatting,
      ["environment", "variables", "secrets", "config", "dotenv"]
    ),
    new Tool(
      "json-type-gen",
      "JSON Type Generator",
      "Convert JSON objects into TypeScript Interfaces, Zod Schemas, or Go Structs.",
      Zap,
      "/tools/json-type-gen",
      ToolCategory.Converters,
      ["json", "typescript", "zod", "go", "schema", "interface", "converter"]
    ),
    new Tool(
      "json-formatter",
      "JSON Formatter",
      "Prettify, minify, and validate complex JSON data structures.",
      FileJson,
      "/tools/json-formatter",
      ToolCategory.Formatting,
      ["json", "format", "pretty", "minify", "validate"]
    ),
    new Tool(
      "sql-formatter",
      "SQL Formatter",
      "Beautify and standardize SQL queries for various dialects.",
      Code2,
      "/tools/sql-formatter",
      ToolCategory.Formatting,
      ["sql", "format", "pretty", "query", "database"]
    ),
    new Tool(
      "code-diff",
      "Code Diff Checker",
      "Compare two snippets of code or text to highlight structural differences.",
      Split,
      "/tools/code-diff",
      ToolCategory.Diff,
      ["diff", "compare", "code", "text", "changes"]
    ),
    new Tool(
      "json-diff",
      "JSON Diff Tool",
      "Identify structural and value differences between two JSON objects.",
      Files,
      "/tools/json-diff",
      ToolCategory.Diff,
      ["json", "diff", "compare", "structure", "values"]
    ),
    new Tool(
      "deep-compare",
      "Deep Compare",
      "Deeply compare two JSON objects and find differences.",
      ArrowRightLeft,
      "/tools/deep-compare",
      ToolCategory.Diff,
      ["json", "diff", "compare", "deep", "structure"]
    ),
    new Tool(
      "text-diff",
      "Text Diff",
      "Simple side-by-side text comparison with line-by-line highlights.",
      AlignLeft,
      "/tools/text-diff",
      ToolCategory.Diff,
      ["text", "diff", "compare", "string"]
    ),
    new Tool(
      "excel-diff",
      "Excel/CSV Diff",
      "Compare two spreadsheet files and highlight modified rows and cells.",
      FileSpreadsheet,
      "/tools/excel-diff",
      ToolCategory.Diff,
      ["excel", "csv", "diff", "compare", "spreadsheet"]
    ),
    new Tool(
      "yaml-diff",
      "YAML Diff",
      "Compare YAML configurations and see structural differences clearly.",
      Files,
      "/tools/yaml-diff",
      ToolCategory.Diff,
      ["yaml", "diff", "compare", "config", "structure"]
    ),
    new Tool(
      "json-flattener",
      "JSON Flattener",
      "Transform nested JSON objects into single-level key-value pairs.",
      Minimize2,
      "/tools/json-flattener",
      ToolCategory.Formatting,
      ["json", "flatten", "unflatten", "nested"]
    ),
    new Tool(
      "json-duplicates",
      "JSON Duplicate Finder",
      "Locate and remove duplicate keys or values within JSON data.",
      Files,
      "/tools/json-duplicates",
      ToolCategory.Formatting,
      ["json", "duplicates", "cleanup", "unique"]
    ),
    new Tool(
      "json-sorter",
      "JSON Sorter",
      "Alphabetically sort JSON keys for consistent structure and readability.",
      AlignLeft,
      "/tools/json-sorter",
      ToolCategory.Formatting,
      ["json", "sort", "keys", "alphabetical"]
    ),
    new Tool(
      "curl-converter",
      "cURL Converter",
      "Convert cURL commands into production-ready Fetch, Axios, Python, or Go code.",
      Terminal,
      "/tools/curl-converter",
      ToolCategory.Converters,
      ["curl", "api", "fetch", "axios", "python", "go", "request", "converter"]
    ),
    new Tool(
      "xml-json",
      "XML to JSON",
      "Seamlessly convert XML data to JSON format and vice versa.",
      Scaling,
      "/tools/xml-json",
      ToolCategory.Converters,
      ["xml", "json", "convert", "transform"]
    ),
    new Tool(
      "csv-json",
      "CSV to JSON",
      "Convert CSV data to structured JSON arrays or objects easily.",
      FileSpreadsheet,
      "/tools/csv-json",
      ToolCategory.Converters,
      ["csv", "json", "convert", "transform"]
    ),
    new Tool(
      "yaml-json",
      "YAML to JSON",
      "Convert between YAML and JSON configurations without data loss.",
      Files,
      "/tools/yaml-json",
      ToolCategory.Converters,
      ["yaml", "json", "convert", "transform"]
    ),
    new Tool(
      "base64",
      "Base64 Text",
      "Encode and decode text strings to and from Base64 format.",
      Link2,
      "/tools/base64",
      ToolCategory.Encoding,
      ["base64", "encode", "decode", "text"]
    ),
    new Tool(
      "base64-file",
      "Base64 File",
      "Convert binary files to Base64 strings for easy embedding or transfer.",
      Files,
      "/tools/base64-file",
      ToolCategory.Encoding,
      ["base64", "file", "encode", "decode", "binary"]
    ),
    new Tool(
      "url-encoder",
      "URL Encoder/Decoder",
      "Safely encode or decode URL components to ensure valid web addresses.",
      Globe,
      "/tools/url-encoder",
      ToolCategory.Encoding,
      ["url", "encode", "decode", "uri"]
    ),
    new Tool(
      "aes-tool",
      "AES 256 Tool",
      "Encrypt and decrypt text using industrial-grade AES-256 encryption.",
      Lock,
      "/tools/aes-tool",
      ToolCategory.Security,
      ["aes", "encryption", "decryption", "security", "crypto"]
    ),
    new Tool(
      "file-encryptor",
      "File Guard",
      "Securely encrypt and decrypt files with military-grade AES-256 password protection.",
      ShieldCheck,
      "/tools/file-encryptor",
      ToolCategory.Security,
      ["file", "encryption", "decryption", "security", "password", "protect"]
    ),
    new Tool(
      "bcrypt-generator",
      "Bcrypt Generator",
      "Generate secure Bcrypt hashes for passwords with adjustable cost.",
      Fingerprint,
      "/tools/bcrypt-generator",
      ToolCategory.Security,
      ["bcrypt", "hash", "password", "security"]
    ),
    new Tool(
      "bcrypt-comparator",
      "Bcrypt Comparator",
      "Verify if a plain text password matches a given Bcrypt hash.",
      ShieldCheck,
      "/tools/bcrypt-comparator",
      ToolCategory.Security,
      ["bcrypt", "compare", "verify", "password"]
    ),
    new Tool(
      "hash-generator",
      "Hash Generator",
      "Generate MD5, SHA-1, SHA-256, and SHA-512 hashes for any data.",
      Hash,
      "/tools/hash-generator",
      ToolCategory.Security,
      ["hash", "md5", "sha256", "security", "sha1", "sha512"]
    ),
    new Tool(
      "hmac-generator",
      "HMAC Generator",
      "Create keyed-hash message authentication codes (HMAC) for security.",
      ShieldPlus,
      "/tools/hmac-generator",
      ToolCategory.Security,
      ["hmac", "security", "authentication", "hash"]
    ),
    new Tool(
      "jwt-decoder",
      "JWT Decoder",
      "Inspect and decode JSON Web Tokens (JWT) to view payload data.",
      Eye,
      "/tools/jwt-decoder",
      ToolCategory.Security,
      ["jwt", "decode", "token", "auth", "inspect"]
    ),
    new Tool(
      "jwt-expiry",
      "JWT Expiry Checker",
      "Verify the expiration status and validity window of JWT tokens.",
      Timer,
      "/tools/jwt-expiry",
      ToolCategory.Security,
      ["jwt", "expiry", "token", "check", "validation"]
    ),
    new Tool(
      "two-step-authenticator",
      "2FA Authenticator",
      "Generate and manage 2FA (TOTP/HOTP) tokens for your accounts.",
      Timer,
      "/tools/two-step-authenticator",
      ToolCategory.Security,
      ["2fa", "otp", "totp", "hotp", "auth", "authenticator"]
    ),
    new Tool(
      "password-generator",
      "Password Generator",
      "Generate strong, random passwords with custom complexity rules.",
      Key,
      "/tools/password-generator",
      ToolCategory.Security,
      ["password", "generator", "random", "security"]
    ),
    new Tool(
      "password-strength",
      "Password Strength",
      "Analyze password entropy and estimate time to crack.",
      Zap,
      "/tools/password-strength",
      ToolCategory.Security,
      ["password", "strength", "entropy", "security"]
    ),
    new Tool(
      "password-policy",
      "Password Policy",
      "Define and test password complexity policies for your apps.",
      ShieldCheck,
      "/tools/password-policy",
      ToolCategory.Security,
      ["password", "policy", "rules", "security"]
    ),
    new Tool(
      "psk-generator",
      "PSK Generator",
      "Create high-entropy Pre-Shared Keys for VPNs, WiFi, or APIs.",
      Key,
      "/tools/psk-generator",
      ToolCategory.Security,
      ["psk", "key", "vpn", "wifi", "security"]
    ),
    new Tool(
      "uuid-generator",
      "UUID/ULID Generator",
      "Generate universally unique identifiers (v1, v4) and ULIDs.",
      Fingerprint,
      "/tools/uuid-generator",
      ToolCategory.Generation,
      ["uuid", "ulid", "guid", "generator", "unique"]
    ),
    new Tool(
      "lorem-ipsum",
      "Lorem Ipsum",
      "Generate placeholder text for layouts, mockups, and designs.",
      AlignLeft,
      "/tools/lorem-ipsum",
      ToolCategory.Generation,
      ["lorem", "ipsum", "placeholder", "text", "mockup"]
    ),
    new Tool(
      "data-generator",
      "Mock Data Generator",
      "Create realistic mock data (names, emails, dates) in various formats.",
      Braces,
      "/tools/data-generator",
      ToolCategory.Generation,
      ["mock", "data", "fake", "generator", "testing"]
    ),
    new Tool(
      "image-generator",
      "Image Generator",
      "Generate custom images from icons or text with various styles.",
      ImagePlus,
      "/tools/image-generator",
      ToolCategory.Generation,
      ["icon", "image", "generator", "text", "asset", "creation"]
    ),
    new Tool(
      "animation-generator",
      "CSS Animation",
      "Design and preview CSS animations and keyframes visually.",
      Film,
      "/tools/animation-generator",
      ToolCategory.Generation,
      ["css", "animation", "keyframes", "motion", "ui"]
    ),
    new Tool(
      "gradient-generator",
      "Gradient Studio",
      "Create and copy CSS linear and radial gradients with live preview.",
      Palette,
      "/tools/gradient-generator",
      ToolCategory.Generation,
      ["css", "gradient", "color", "preview", "style"]
    ),
    new Tool(
      "box-shadow",
      "Shadow Designer",
      "Visual designer for CSS box-shadows with multiple layer support.",
      Layers,
      "/tools/box-shadow",
      ToolCategory.Generation,
      ["css", "shadow", "depth", "visual", "ui"]
    ),
    new Tool(
      "theme-generator",
      "Color Theme Generator",
      "Generate accessible color palettes and themes for your applications.",
      Paintbrush,
      "/tools/theme-generator",
      ToolCategory.Generation,
      ["theme", "color", "palette", "accessibility", "design"]
    ),
    new Tool(
      "color-picker",
      "Color Picker",
      "Pick, convert, and contrast test colors for web and design.",
      Pipette,
      "/tools/color-picker",
      ToolCategory.Utils,
      ["color", "picker", "contrast", "convert", "hex", "rgb"]
    ),
    new Tool(
      "image-color-picker",
      "Image Color Picker",
      "Extract dominant colors and specific hex codes from uploaded images.",
      Pipette,
      "/tools/image-color-picker",
      ToolCategory.Utils,
      ["image", "color", "picker", "extraction", "palette"]
    ),
    new Tool(
      "text-analyzer",
      "Text Analyzer",
      "Detailed statistics for text: word count, reading time, and more.",
      AlignLeft,
      "/tools/text-analyzer",
      ToolCategory.Utils,
      ["text", "analyze", "count", "stats", "reading-time"]
    ),
    new Tool(
      "case-converter",
      "Case Converter",
      "Switch between camelCase, snake_case, PascalCase, and more.",
      Type,
      "/tools/case-converter",
      ToolCategory.Utils,
      ["case", "convert", "camelCase", "snake_case", "text"]
    ),
    new Tool(
      "regex-tester",
      "Regex Tester",
      "Test and debug regular expressions with live highlighting and groups.",
      Code2,
      "/tools/regex-tester",
      ToolCategory.Utils,
      ["regex", "test", "debug", "text", "pattern"]
    ),
    new Tool(
      "cron-parser",
      "Cron Parser",
      "Decode cron expressions into human-readable text and next run times.",
      Clock,
      "/tools/cron-parser",
      ToolCategory.Utils,
      ["cron", "schedule", "parser", "human-readable"]
    ),
    new Tool(
      "calculator",
      "Dev Calculator",
      "Standard and scientific calculator with programmer-focused features.",
      Calculator,
      "/tools/calculator",
      ToolCategory.Utils,
      ["calculator", "math", "programmer", "scientific"]
    ),
    new Tool(
      "weight-converter",
      "Weight Converter",
      "Convert between metric and imperial weight units accurately.",
      Scale,
      "/tools/weight-converter",
      ToolCategory.Converters,
      ["weight", "convert", "mass", "units"]
    ),
    new Tool(
      "distance-converter",
      "Distance Converter",
      "Transform lengths between various units like km, miles, and feet.",
      Ruler,
      "/tools/distance-converter",
      ToolCategory.Converters,
      ["distance", "convert", "length", "units"]
    ),
    new Tool(
      "time-converter",
      "Time Converter",
      "Convert between various time formats and units effortlessly.",
      Clock,
      "/tools/time-converter",
      ToolCategory.Converters,
      ["time", "convert", "duration", "units"]
    ),
    new Tool(
      "timestamp-diff",
      "Timestamp Diff",
      "Compare two timestamps and see the exact difference in multiple units.",
      ArrowRightLeft,
      "/tools/timestamp-diff",
      ToolCategory.Converters,
      ["timestamp", "diff", "compare", "time", "interval"]
    ),
    new Tool(
      "timezone-converter",
      "Timezone Converter",
      "Convert times between different world timezones easily.",
      Globe,
      "/tools/timezone-converter",
      ToolCategory.Converters,
      ["timezone", "convert", "world-time", "units"]
    ),
    new Tool(
      "markdown-preview",
      "Markdown Preview",
      "Real-time previewer for Markdown text with GFM support.",
      Eye,
      "/tools/markdown-preview",
      ToolCategory.Utils,
      ["markdown", "preview", "gfm", "viewer"]
    ),
    new Tool(
      "markdown-html",
      "Markdown to HTML",
      "Convert Markdown strings to clean, semantic HTML code.",
      Code2,
      "/tools/markdown-html",
      ToolCategory.Converters,
      ["markdown", "html", "convert", "transform"]
    ),
    new Tool(
      "text-pdf",
      "Text to PDF",
      "Generate clean PDF documents from plain text inputs.",
      FileType,
      "/tools/text-pdf",
      ToolCategory.Converters,
      ["text", "pdf", "convert", "transform"]
    ),
    new Tool(
      "md-pdf",
      "Markdown to PDF",
      "Export your Markdown documents as professionally styled PDF files.",
      FileType,
      "/tools/md-pdf",
      ToolCategory.Converters,
      ["markdown", "pdf", "convert", "transform"]
    ),
    new Tool(
      "md-gdocs",
      "Markdown to GDocs",
      "Optimize Markdown for pasting directly into Google Docs.",
      FileText,
      "/tools/md-gdocs",
      ToolCategory.Converters,
      ["markdown", "google-docs", "convert", "transform"]
    ),
    new Tool(
      "html-pdf",
      "HTML to PDF",
      "Render HTML strings or websites into high-quality PDF files.",
      FileType,
      "/tools/html-pdf",
      ToolCategory.Converters,
      ["html", "pdf", "convert", "transform"]
    ),
    new Tool(
      "http-status",
      "HTTP Status Codes",
      "Comprehensive directory of HTTP status codes and their meanings.",
      Globe,
      "/tools/http-status",
      ToolCategory.Utils,
      ["http", "status", "codes", "lookup"]
    ),
    new Tool(
      "shortcut-cheatsheet",
      "Shortcut Cheatsheet",
      "Common development shortcuts for OS and popular IDEs.",
      Keyboard,
      "/tools/shortcut-cheatsheet",
      ToolCategory.Utils,
      ["shortcuts", "cheatsheet", "dev", "productivity"]
    ),
    new Tool(
      "api-builder",
      "API Builder",
      "Visually design and prototype API endpoints and responses.",
      Zap,
      "/tools/api-builder",
      ToolCategory.System,
      ["api", "builder", "prototype", "design", "endpoint"]
    ),
    new Tool(
      "advanced-todos",
      "Dev Todo Board",
      "Feature-rich todo manager with priority, labels, and local storage.",
      ListTodo,
      "/tools/advanced-todos",
      ToolCategory.Utils,
      ["todo", "tasks", "management", "productivity", "dev"]
    ),
    new Tool(
      "json-sorter",
      "JSON Sorter",
      "Sort JSON keys alphabetically or by length.",
      ListFilter,
      "/tools/json-sorter",
      ToolCategory.Formatting,
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

function new_tool(id: string, name: string, description: string, icon: any, path: string, category: ToolCategory, keywords: string[]) {
  return new Tool(id, name, description, icon, path, category, keywords);
}

export const TOOLS = ToolRegistry.getAll();
