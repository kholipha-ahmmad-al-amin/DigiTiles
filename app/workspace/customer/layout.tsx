import React from "react";
import { WorkspaceGuard } from "@/components/ui/WorkspaceGuard";

export default function CustomerWorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <WorkspaceGuard requiredRole="CUSTOMER">{children}</WorkspaceGuard>;
}
