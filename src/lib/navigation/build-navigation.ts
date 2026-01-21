import type { NavigationDefinition, NavigationSection } from "./types"

const sortByOrder = <T extends { order: number }>(items: T[]) =>
  [...items].sort((a, b) => a.order - b.order)

export const buildNavigation = (
  definition: NavigationDefinition
): NavigationSection[] =>
  sortByOrder(definition.sections).map((section) => ({
    ...section,
    items: sortByOrder(section.items),
  }))
