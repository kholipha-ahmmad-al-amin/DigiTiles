import React from "react";
import { WorkspaceFrame } from "@/components/layout/WorkspaceFrame";
import { WorkspaceGuard } from "@/components/ui/WorkspaceGuard";

export default function AdminWorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WorkspaceGuard requiredRole="ADMIN">
      <WorkspaceFrame role="ADMIN">{children}</WorkspaceFrame>
    </WorkspaceGuard>
  );
}
