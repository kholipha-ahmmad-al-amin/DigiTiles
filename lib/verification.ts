import type { VerificationStatus } from "./types";

type VerificationDecision = Exclude<VerificationStatus, "DRAFT" | "SUBMITTED">;

const adminTransitions: Record<VerificationStatus, readonly VerificationDecision[]> = {
  DRAFT: [],
  SUBMITTED: ["UNDER_REVIEW"],
  UNDER_REVIEW: ["VERIFIED", "REJECTED"],
  VERIFIED: ["SUSPENDED", "EXPIRED"],
  REJECTED: [],
  SUSPENDED: ["UNDER_REVIEW", "EXPIRED"],
  EXPIRED: [],
};

export function availableVerificationDecisions(state: VerificationStatus): readonly VerificationDecision[] {
  return adminTransitions[state] ?? [];
}

export function canSubmitVerification(state: VerificationStatus): boolean {
  return state === "DRAFT" || state === "REJECTED" || state === "EXPIRED";
}
