import { Metadata } from 'next';
import { TOOLS } from '@/utility/constants/tools';

const tool = TOOLS.find(t => t.id === 'json-formatter')!;

export const metadata: Metadata = {
  title: tool.metaTitle,
  description: tool.metaDescription,
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
