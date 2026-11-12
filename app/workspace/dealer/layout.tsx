import React from "react";
import { WorkspaceFrame } from "@/components/layout/WorkspaceFrame";
import { WorkspaceGuard } from "@/components/ui/WorkspaceGuard";

export default function DealerWorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WorkspaceGuard requiredRole="DEALER">
      <WorkspaceFrame role="DEALER">{children}</WorkspaceFrame>
    </WorkspaceGuard>
  );
}
