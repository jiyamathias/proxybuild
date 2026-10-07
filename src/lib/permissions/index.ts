import type { SessionUser } from "@/lib/auth/session";

export const STAFF_ROLES = [
  "SUPER_ADMIN",
  "ADMIN",
  "PROJECT_MANAGER",
  "SITE_SUPERVISOR",
  "FINANCE",
] as const;

export type StaffRole = (typeof STAFF_ROLES)[number];

export function isStaff(session: SessionUser): boolean {
  return STAFF_ROLES.includes(session.role as StaffRole);
}

export function canManageProjects(session: SessionUser): boolean {
  return ["SUPER_ADMIN", "ADMIN", "PROJECT_MANAGER"].includes(session.role);
}

export function canManageFinance(session: SessionUser): boolean {
  return ["SUPER_ADMIN", "ADMIN", "FINANCE"].includes(session.role);
}

export function canManageTeam(session: SessionUser): boolean {
  return ["SUPER_ADMIN", "ADMIN"].includes(session.role);
}

export function canViewAuditLogs(session: SessionUser): boolean {
  return ["SUPER_ADMIN", "ADMIN"].includes(session.role);
}
