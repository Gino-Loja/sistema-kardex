import type { Permission } from "@/lib/auth/roles";

type RoutePermission = {
  pattern: RegExp;
  permission: Permission;
};

const ROUTE_PERMISSIONS: RoutePermission[] = [
  { pattern: /^\/dashboard(\/|$)/, permission: "dashboard:read" },
  { pattern: /^\/kardex(\/|$)/, permission: "reports:read" },
  { pattern: /^\/movements(\/|$)/, permission: "movements:read" },
  { pattern: /^\/items\/import(\/|$)/, permission: "masters:write" },
  { pattern: /^\/items(\/|$)/, permission: "masters:read" },
  { pattern: /^\/categories\/create(\/|$)/, permission: "masters:write" },
  { pattern: /^\/categories\/[^/]+\/edit(\/|$)/, permission: "masters:write" },
  { pattern: /^\/categories(\/|$)/, permission: "masters:read" },
  { pattern: /^\/third-parties(\/|$)/, permission: "masters:read" },
  { pattern: /^\/warehouses\/create(\/|$)/, permission: "masters:write" },
  { pattern: /^\/warehouses\/[^/]+\/edit(\/|$)/, permission: "masters:write" },
  { pattern: /^\/warehouses(\/|$)/, permission: "masters:read" },
  { pattern: /^\/settings\/users(\/|$)/, permission: "users:manage" },
  { pattern: /^\/settings\/audit-log(\/|$)/, permission: "audit:read" },
];

export const getRequiredPermission = (pathname: string): Permission | null => {
  const match = ROUTE_PERMISSIONS.find((entry) => entry.pattern.test(pathname));
  return match?.permission ?? null;
};
