import { createAccessControl } from "better-auth/plugins/access";
import { adminAc, defaultStatements } from "better-auth/plugins/admin/access";

export const statement = {
  ...defaultStatements,
  dashboard: ["read"],
  movements: ["read", "write"],
  inventory: ["read", "write"],
  masters: ["read", "write"],
  reports: ["read"],
  users: ["manage"],
  audit: ["read"],
} as const;

export const ac = createAccessControl(statement);

export const adminRole = ac.newRole({
  ...adminAc.statements,
  dashboard: ["read"],
  movements: ["read", "write"],
  inventory: ["read", "write"],
  masters: ["read", "write"],
  reports: ["read"],
  users: ["manage"],
  audit: ["read"],
});

export const bodegueroRole = ac.newRole({
  dashboard: ["read"],
  movements: ["read", "write"],
  inventory: ["read"],
  masters: ["read", "write"],
  reports: ["read"],
});
