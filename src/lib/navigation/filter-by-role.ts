import { isRole, type Role } from "@/lib/auth/roles"
import type { NavigationSection } from "./types"

const hasRoleAccess = (role: Role, allowed: Role[]) =>
  allowed.length === 0 || allowed.includes(role)

export const filterSectionsByRole = (
  sections: NavigationSection[],
  role: string | null | undefined
): NavigationSection[] => {
  if (!isRole(role)) {
    return []
  }

  return sections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) =>
        hasRoleAccess(role, item.requiredRoles ?? [])
      ),
    }))
    .filter((section) => section.items.length > 0)
}
