import React from "react";
import { WorkspaceGuard } from "@/components/ui/WorkspaceGuard";

export default function DealerWorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <WorkspaceGuard requiredRole="DEALER">{children}</WorkspaceGuard>;
}
