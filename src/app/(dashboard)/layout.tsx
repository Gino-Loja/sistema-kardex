import type { ReactNode } from "react"

import { AppNavbar } from "@/components/layout/app-navbar"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-background min-h-svh">
        <AppNavbar />
        <main className="px-2 pt-6 md:px-2">
          <div className=" w-full max-w-full">{children}</div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
