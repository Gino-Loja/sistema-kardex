"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  IconBell,
  IconChevronRight,
  IconUserCircle,
} from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

const segmentLabels: Record<string, string> = {
  dashboard: "Dashboard",
  projects: "Proyectos",
  reports: "Reportes",
  settings: "Configuracion",
}

const toTitle = (value: string) =>
  value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")

const buildBreadcrumbs = (pathname: string) => {
  const segments = pathname.split("/").filter(Boolean)

  return segments.map((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join("/")}`
    const label = segmentLabels[segment] ?? toTitle(segment)

    return { href, label }
  })
}

export function AppNavbar() {
  const pathname = usePathname()
  const { state, isMobile } = useSidebar()
  const breadcrumbs = buildBreadcrumbs(pathname)
  const currentCrumb =
    breadcrumbs[breadcrumbs.length - 1] ?? { href: "/", label: "Inicio" }

  return (
    <header
      className={cn(
        "border-b border-border/50 bg-background/80 backdrop-blur",
        "fixed top-0 z-40 w-full"
      )}
    >
      <div className="flex h-14 items-center justify-between gap-2 px-3 sm:gap-3 sm:px-4 md:px-6">
        {/* Left section - Sidebar trigger */}
        <div className="flex shrink-0 items-center">
          <SidebarTrigger className="rounded-md" />
        </div>

        {/* Center section - Breadcrumbs */}
        <nav 
          aria-label="Breadcrumbs" 
          className="flex min-w-0 flex-1 items-center overflow-hidden"
        >
          {/* Desktop breadcrumbs - hidden on mobile */}
          <ol className="hidden min-w-0 items-center text-sm text-muted-foreground sm:flex">
            {breadcrumbs.map((crumb, index) => (
              <li key={crumb.href} className="flex min-w-0 items-center">
                {index > 0 && (
                  <IconChevronRight className="mx-1 size-4 shrink-0 text-muted-foreground/70" />
                )}
                <Link
                  href={crumb.href}
                  className={cn(
                    "truncate transition-colors hover:text-foreground",
                    index === breadcrumbs.length - 1
                      ? "font-medium text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {crumb.label}
                </Link>
              </li>
            ))}
          </ol>

          {/* Mobile breadcrumb - only current page */}
          <div className="flex min-w-0 items-center sm:hidden">
            <Link
              href={currentCrumb.href}
              className="truncate text-sm font-medium text-foreground"
            >
              {currentCrumb.label}
            </Link>
          </div>
        </nav>

        {/* Right section - Actions */}
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            className="rounded-md sm:inline-flex"
            aria-label="Notificaciones"
          >
            <IconBell className="size-5" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="inline-flex rounded-md"
                aria-label="Perfil"
              >
                <IconUserCircle className="size-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem asChild>
                <Link href="/settings/profile">Mi perfil</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings">Configuracion</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}