import React from "react";
import { WorkspaceFrame } from "@/components/layout/WorkspaceFrame";
import { WorkspaceGuard } from "@/components/ui/WorkspaceGuard";

export default function CustomerWorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WorkspaceGuard requiredRole="CUSTOMER">
      <WorkspaceFrame role="CUSTOMER">{children}</WorkspaceFrame>
    </WorkspaceGuard>
  );
}
