"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  IconHexagon,
  IconLogout,
  IconUserCircle,
} from "@tabler/icons-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,

  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth/auth-client"
import { PanelNavbar } from "@/components/navbar/panel-navbar"

export function AppSidebar() {
  const router = useRouter()
  const { data, isPending } = authClient.useSession()
  const user = data?.user ?? null
  const userName = user?.name ?? user?.email ?? "Usuario"
  const userEmail = user?.email ?? ""

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader className="gap-3">
        <Link
          href="/dashboard"
          className="text-foreground flex items-center gap-2 rounded-md px-2 py-1 text-sm font-semibold"
        >
          <IconHexagon className="size-5 text-primary" />
          <span className="group-data-[collapsible=icon]:hidden">
            Kardex NIIF
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <PanelNavbar />
      </SidebarContent>
      <SidebarFooter className="gap-2">
        <div className="flex items-center gap-2 rounded-md px-2 py-2 text-sm">
          <IconUserCircle className="size-7 text-primary" />
          <div className="min-w-0 leading-tight group-data-[collapsible=icon]:hidden">
            <div className="truncate font-medium">
              {isPending ? "Cargando..." : userName}
            </div>
            {userEmail ? (
              <div className="truncate text-xs text-muted-foreground">
                {userEmail}
              </div>
            ) : null}
          </div>
        </div>
        <Button
          type="button"
          variant="destructive"
          className="justify-start"
          onClick={async () => {
            await authClient.signOut()
            router.replace("/login")
          }}
        >
          <IconLogout className="size-5" />
          <span className="group-data-[collapsible=icon]:hidden">
            Cerrar sesion
          </span>
        </Button>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
