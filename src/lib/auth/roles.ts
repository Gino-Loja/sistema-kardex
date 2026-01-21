export const ROLES = ["admin", "bodeguero"] as const;
export type Role = (typeof ROLES)[number];

export const PERMISSIONS = [
  "dashboard:read",
  "movements:read",
  "movements:write",
  "inventory:read",
  "inventory:write",
  "masters:read",
  "masters:write",
  "reports:read",
  "users:manage",
  "audit:read",
] as const;
export type Permission = (typeof PERMISSIONS)[number];

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  admin: [...PERMISSIONS],
  bodeguero: [
    "dashboard:read",
    "movements:read",
    "movements:write",
    "inventory:read",
    "reports:read",
    "masters:read",
    "masters:write",
  ],
};

export const isRole = (value: string | null | undefined): value is Role =>
  !!value && (ROLES as readonly string[]).includes(value);
