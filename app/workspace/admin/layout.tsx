import React from "react";
import { WorkspaceGuard } from "@/components/ui/WorkspaceGuard";

export default function AdminWorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <WorkspaceGuard requiredRole="ADMIN">{children}</WorkspaceGuard>;
}
