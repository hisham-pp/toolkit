import type { Metadata } from "next";
import RegexTesterClient from "@/components/RegexTesterClient";

export const metadata: Metadata = {
  title: "Regex Tester & Debugger",
  description: "Test and debug regular expressions in real-time. Support for global, multiline, and case-insensitive flags with visual match highlighting.",
  keywords: ["regex debugger", "javascript regex test", "regular expression playground", "regex matcher"],
};

export default function RegexTester() {
  return <RegexTesterClient />;
}
