"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import * as React from "react"
import { IconChevronDown } from "@tabler/icons-react"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
} from "@/components/ui/sidebar"
import { authClient } from "@/lib/auth/auth-client"
import { cn } from "@/lib/utils"
import { filterSectionsByRole, panelNavigationSections } from "@/lib/navigation"

import styles from "./panel-navbar.module.css"

const isActivePath = (pathname: string, href: string) => {
  if (href === "/") {
    return pathname === "/"
  }

  return pathname === href || pathname.startsWith(`${href}/`)
}

export function PanelNavbar() {
  const pathname = usePathname()
  const { data, isPending } = authClient.useSession()
  const role = data?.user?.role ?? null
  const sections = filterSectionsByRole(panelNavigationSections, role)
  const [openSections, setOpenSections] = React.useState<Record<string, boolean>>(
    {}
  )
  const menuButtonClass = cn(
    "data-active:bg-amber-200/70 data-active:text-amber-950 data-active:shadow-sm",
    "dark:data-active:bg-amber-500/20 dark:data-active:text-amber-100",
    "data-active:[&_svg]:text-amber-700 dark:data-active:[&_svg]:text-amber-200",
    "group-data-[collapsible=icon]/sidebar-wrapper:justify-center"
  )

  React.useEffect(() => {
    setOpenSections((prev) => {
      const next = { ...prev }

      sections.forEach((section) => {
        const hasActiveItem = section.items.some((item) =>
          isActivePath(pathname, item.href)
        )

        if (next[section.id] === undefined) {
          next[section.id] = true
        }

        if (hasActiveItem) {
          next[section.id] = true
        }
      })

      return next
    })
  }, [sections, pathname])

  if (isPending) {
    return (
      <SidebarGroup>
        <SidebarGroupLabel>Panel</SidebarGroupLabel>
        <SidebarGroupContent>
          <div className="flex flex-col gap-2">
            <SidebarMenuSkeleton showIcon />
            <SidebarMenuSkeleton showIcon />
            <SidebarMenuSkeleton showIcon />
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    )
  }

  if (sections.length === 0) {
    return (
      <SidebarGroup>
        <SidebarGroupLabel>Panel</SidebarGroupLabel>
        <SidebarGroupContent>
          <div className="rounded-lg border border-dashed border-border/60 px-3 py-3 text-xs text-muted-foreground">
            No tienes paginas disponibles para tu rol.
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {sections.map((section) => {
        const hasActiveItem = section.items.some((item) =>
          isActivePath(pathname, item.href)
        )
        const isCollapsible = section.isCollapsible
        const isOpen = openSections[section.id] ?? true

        return (
          <SidebarGroup key={section.id}>
            {isCollapsible ? (
              <details
                open={isOpen}
                className="group/section"
                onToggle={(event) => {
                  const target = event.currentTarget
                  setOpenSections((prev) => ({
                    ...prev,
                    [section.id]: target.open,
                  }))
                }}
              >
                <SidebarGroupLabel asChild>
                  <summary
                    className={cn(
                      "flex cursor-pointer items-center justify-between rounded-md px-2 text-xs font-medium",
                      "transition-colors hover:bg-sidebar-accent",
                      styles.sectionSummary
                    )}
                  >
                    <span>{section.label}</span>
                    <IconChevronDown className="size-4 transition-transform group-open/section:rotate-180" />
                  </summary>
                </SidebarGroupLabel>
                <SidebarGroupContent className={styles.scrollArea}>
                  <SidebarMenu className="mt-1">
                    {section.items.map((item) => {
                      const isActive = isActivePath(pathname, item.href)
                      const Icon = item.icon

                      return (
                        <SidebarMenuItem key={item.id}>
                          <SidebarMenuButton
                            asChild
                            isActive={isActive}
                            tooltip={item.label}
                            className={menuButtonClass}
                          >
                            <Link href={item.href}>
                              {Icon ? <Icon className="size-4" /> : null}
                              <span className="group-data-[collapsible=icon]/sidebar-wrapper:hidden">
                                {item.label}
                              </span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      )
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </details>
            ) : (
              <>
                <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu className="mt-1">
                    {section.items.map((item) => {
                      const isActive = isActivePath(pathname, item.href)
                      const Icon = item.icon

                      return (
                        <SidebarMenuItem key={item.id}>
                          <SidebarMenuButton
                            asChild
                            isActive={isActive}
                            tooltip={item.label}
                            className={menuButtonClass}
                          >
                            <Link href={item.href}>
                              {Icon ? <Icon className="size-4" /> : null}
                              <span className="group-data-[collapsible=icon]/sidebar-wrapper:hidden">
                                {item.label}
                              </span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      )
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </>
            )}
          </SidebarGroup>
        )
      })}
    </div>
  )
}
