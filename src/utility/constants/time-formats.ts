import { 
  Calendar, 
  Hash, 
  Clock, 
  ArrowRightLeft,
  FileCode,
  Globe,
  Database
} from "lucide-react";

/**
 * GUIDE: HOW TO ADD CUSTOM FORMATS
 * 1. Add your format string to the DATE_FORMAT_STRINGS object.
 * 2. Add a new object to the TIME_FORMAT_CONFIGS array.
 * 3. Use the label, format key, and an appropriate Lucide icon.
 */

export const DATE_FORMAT_STRINGS = {
  UTC: "yyyy-MM-dd HH:mm:ss 'UTC'",
  LOCAL_FULL: "PPPPpppp",
  RFC_2822: "EEE, dd MMM yyyy HH:mm:ss XX",
  SQL: "yyyy-MM-dd HH:mm:ss",
  DATE_ONLY: "yyyy-MM-dd",
  TIME_ONLY: "HH:mm:ss.SSS",
  SHORT_DATE: "MMM d, yyyy",
  CHRONO: "yyyyMMddHHmmss",
} as const;

export type DateFormatKey = keyof typeof DATE_FORMAT_STRINGS;

export interface TimeFormatConfig {
  label: string;
  icon: any;
  // If 'formatKey' is provided, we use the string from DATE_FORMAT_STRINGS
  formatKey?: DateFormatKey;
  // If 'getValue' is provided, we use a custom function (e.g., for relative time or ISO)
  getValue?: (date: Date, fns: any) => string;
}

export const TIME_FORMAT_CONFIGS: TimeFormatConfig[] = [
  { 
    label: "ISO 8601", 
    getValue: (date) => date.toISOString(), 
    icon: Calendar 
  },
  { 
    label: "Unix Timestamp (s)", 
    getValue: (date, { getUnixTime }: any) => getUnixTime(date).toString(), 
    icon: Hash 
  },
  { 
    label: "Unix Timestamp (ms)", 
    getValue: (date, { getTime }: any) => getTime(date).toString(), 
    icon: Hash 
  },
  { 
    label: "Relative Time", 
    getValue: (date, { formatDistanceToNow }: any) => formatDistanceToNow(date, { addSuffix: true }), 
    icon: ArrowRightLeft 
  },
  { 
    label: "UTC Standard", 
    formatKey: "UTC", 
    icon: Globe 
  },
  { 
    label: "Local Full", 
    formatKey: "LOCAL_FULL", 
    icon: Clock 
  },
  { 
    label: "SQL / Database", 
    formatKey: "SQL", 
    icon: Database 
  },
  { 
    label: "Short Date", 
    formatKey: "SHORT_DATE", 
    icon: Calendar 
  },
  { 
    label: "Time Only", 
    formatKey: "TIME_ONLY", 
    icon: Clock 
  },
  { 
    label: "RFC 2822", 
    formatKey: "RFC_2822", 
    icon: FileCode 
  },
  { 
    label: "Chrono String", 
    formatKey: "CHRONO", 
    icon: Hash 
  },
];
