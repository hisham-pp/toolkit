# DevHub New Tool Roadmap

This document tracks the implementation of new utilities for the DevHub toolkit.

## Priority 1: High Impact
- [x] **JSON to TypeScript/Zod Generator** (Converters/Generation)
  - *Description:* Convert JSON objects into TypeScript Interfaces or Zod Schemas.
  - *Priority:* Critical
- [ ] **cURL to Code Converter** (Converters)
  - *Description:* Convert cURL commands to Fetch, Axios, Python, etc.
  - *Priority:* High

## Priority 2: Medium Impact
- [ ] **SVG to JSX Optimizer** (Formatting/Utils)
  - *Description:* Clean and convert SVGs to React components.
  - *Priority:* Medium
- [ ] **Visual Cron Builder** (Utils/Generation)
  - *Description:* UI-based cron expression generator.
  - *Priority:* Medium

## Priority 3: Low/Niche Impact
- [ ] **Byte/Data Size Converter** (Converters)
  - *Description:* Convert between bytes, KB, MB, GB, TB (Decimal vs Binary).
  - *Priority:* Low

---
*Note: Tools should be implemented one by one, registered in `src/utility/constants/tools.ts`, and follow the M3 design system.*
