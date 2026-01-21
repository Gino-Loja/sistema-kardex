import type { ComponentType } from "react"

import type { Role } from "@/lib/auth/roles"

export type NavigationItem = {
  id: string
  label: string
  href: string
  order: number
  sectionId: string
  requiredRoles: Role[]
  icon?: ComponentType<{ className?: string }>
}

export type NavigationSection = {
  id: string
  label: string
  order: number
  isCollapsible: boolean
  items: NavigationItem[]
}

export type NavigationDefinition = {
  sections: NavigationSection[]
}
