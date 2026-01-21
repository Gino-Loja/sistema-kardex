import { isRole, ROLE_PERMISSIONS, type Permission, type Role } from "./roles";

export type SessionUser = {
  id: string;
  role?: string | null;
  email?: string | null;
};

export type Session = {
  user?: SessionUser | null;
};

export const hasRole = (
  role: string | null | undefined,
  allowed: Role | Role[],
): boolean => {
  if (!isRole(role)) {
    return false;
  }

  return Array.isArray(allowed) ? allowed.includes(role) : role === allowed;
};

export const hasPermission = (
  role: string | null | undefined,
  permission: Permission,
): boolean => {
  if (!isRole(role)) {
    return false;
  }

  return ROLE_PERMISSIONS[role].includes(permission);
};

export const requireSession = (session?: Session | null): SessionUser => {
  if (!session?.user) {
    throw new Error("UNAUTHENTICATED");
  }

  return session.user;
};

export const requireRole = (
  session: Session | null | undefined,
  allowed: Role | Role[],
): SessionUser => {
  const user = requireSession(session);

  if (!hasRole(user.role, allowed)) {
    throw new Error("FORBIDDEN");
  }

  return user;
};

export const requirePermission = (
  session: Session | null | undefined,
  permission: Permission,
): SessionUser => {
  const user = requireSession(session);

  if (!hasPermission(user.role, permission)) {
    throw new Error("FORBIDDEN");
  }

  return user;
};
