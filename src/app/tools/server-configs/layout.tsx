import ToolLayout from "@/components/ToolLayout";
import { ToolRegistry } from "@/utility/constants/tools";

export default function SSHConfigLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tool = ToolRegistry.getById("server-configs");

  return (
    <ToolLayout
      title={tool?.name || "Server Configs"}
      description={tool?.description || "Manage and generate SSH server configurations."}
    >
      {children}
    </ToolLayout>
  );
}
