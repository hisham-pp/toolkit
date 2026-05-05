# Toolkit Project Guide

This project is a comprehensive developer toolkit built with Next.js, providing a collection of client-side utilities for encoding, formatting, security, and more.

## Project Overview

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (v4)
- **UI Components:** shadcn/ui with custom "M3" (Material 3 inspired) components.
- **Icons:** Lucide React & Iconify
- **Architecture:** Modular tool-based structure where each tool is a self-contained route.

## Core Directories

- `src/app/tools/`: Contains the implementation for each tool (e.g., `aes-tool`, `json-formatter`).
- `src/components/`: Shared React components.
  - `ui/`: Base UI components (shadcn/ui).
  - `ToolLayout.tsx`: The standard wrapper for all tool pages.
- `src/utility/`: Shared logic and metadata.
  - `constants/`: Registry-style data (e.g., `tools.ts`).
  - `helpers/`: Hooks and utility functions.
  - `types/`: Domain-specific TypeScript interfaces.

## Development Workflow

### Adding a New Tool

1.  **Create Tool Directory:** Create a new folder in `src/app/tools/<tool-id>/`.
2.  **Implement Page:** Create a `page.tsx` (and optionally `layout.tsx`). Use `ToolLayout` to wrap your tool content.
3.  **Register Tool:** Add the tool metadata to the `ToolRegistry` in `src/utility/constants/tools.ts`.
    ```typescript
    new Tool(
      "my-new-tool",
      "My New Tool",
      "Short description of what it does.",
      IconName, // Lucide icon
      "/tools/my-new-tool",
      ToolCategory.Utils,
      ["keyword1", "keyword2"]
    )
    ```
4.  **Follow Conventions:** Adhere to the rules in `CONVENTIONS.md`.

### Building and Running

- `npm install`: Install dependencies.
- `npm run dev`: Start the development server at `http://localhost:3000`.
- `npm run build`: Create a production build.
- `npm run start`: Start the production server.
- `npm run lint`: Run ESLint checks.

## Key Design Patterns

- **Local-Only Processing:** Most tools perform operations entirely in the browser (client-side) for privacy and speed. Avoid server-side processing unless strictly necessary (e.g., `excel-diff` might use a route handler).
- **M3 UI:** Prefer using the custom M3-styled components (`src/components/ui/m3-ui.tsx`) for inputs, textareas, and passwords to maintain a consistent aesthetic.
- **Surgical Updates:** When modifying existing tools, maintain the established styling and layout patterns found in `src/components/ToolLayout.tsx`.

## Critical Files

- `CONVENTIONS.md`: Absolute source of truth for code style and layout.
- `src/utility/constants/tools.ts`: The central registry for all tools.
- `src/app/globals.css`: Global styles and Tailwind configuration.
- `src/components/ToolLayout.tsx`: The primary layout component for all tool routes.
