import { buildNavigation } from "./build-navigation"
import { panelNavigation } from "./panel-pages"

export const panelNavigationSections = buildNavigation(panelNavigation)

export * from "./filter-by-role"
export type { NavigationItem, NavigationSection, NavigationDefinition } from "./types"
