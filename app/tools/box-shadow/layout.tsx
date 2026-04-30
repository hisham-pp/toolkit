import { Metadata } from 'next';
import { TOOLS } from '@/lib/tools-config';

const tool = TOOLS.find(t => t.id === 'box-shadow')!;

export const metadata: Metadata = {
  title: tool.metaTitle,
  description: tool.metaDescription,
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
