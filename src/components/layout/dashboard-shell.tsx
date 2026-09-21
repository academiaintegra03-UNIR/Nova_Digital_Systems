"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { roleOptionFor } from "@/lib/data/roles";
import type { Profile } from "@/lib/types/session";
import { UserMenu } from "@/components/layout/user-menu";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { TooltipProvider } from "@/components/ui/tooltip";

export interface DashboardNavItem {
  href: string;
  label: string;
  /**
   * A rendered icon element (e.g. `<Home />`), not the component reference.
   * These layouts are Server Components — passing the bare Lucide component
   * as a prop into this Client Component isn't serializable across the RSC
   * boundary, but a pre-rendered element is.
   */
  icon: React.ReactNode;
}

export function DashboardShell({
  panelLabel,
  navItems,
  pageSubtitle,
  profile,
  children,
}: {
  panelLabel: string;
  navItems: DashboardNavItem[];
  pageSubtitle?: string;
  profile: Profile;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const userName = profile.nombre || panelLabel;
  const userRoleLabel = roleOptionFor(profile.role)?.label ?? profile.role;
  const pageTitle = navItems.find((item) => item.href === pathname)?.label ?? panelLabel;

  return (
    <TooltipProvider>
      <SidebarProvider>
        <Sidebar collapsible="icon">
          <SidebarHeader className="border-b border-sidebar-border px-3 py-4">
            <Link
              href="/"
              className="flex items-center gap-2.5 px-1 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
            >
              <Image
                src="/Nova-PNG.png"
                alt=""
                width={28}
                height={28}
                className="shrink-0 rounded-full"
              />
              <span className="truncate text-sm font-bold text-sidebar-foreground group-data-[collapsible=icon]:hidden">
                {panelLabel}
              </span>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navegación</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="gap-1!">
                  {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <SidebarMenuItem key={item.href}>
                        {isActive ? (
                          <span
                            className="absolute inset-y-1.5 left-0 w-1 rounded-r-full bg-primary"
                            aria-hidden="true"
                          />
                        ) : null}
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          tooltip={item.label}
                          className="h-9! rounded-lg"
                        >
                          {/* Lucide icons use stroke="currentColor", so setting the
                              link's text color on the active item also tints the icon. */}
                          <Link href={item.href} className="data-active:font-semibold data-active:text-glacier-strong!">
                            {item.icon}
                            <span>{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="gap-3 border-t border-sidebar-border px-3 py-3">
            <div className="flex items-center gap-2.5 px-1 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
              <Avatar className="size-8 shrink-0">
                <AvatarFallback className="bg-primary text-xs font-bold text-white">
                  {userName
                    .split(" ")
                    .slice(0, 2)
                    .map((p) => p[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 group-data-[collapsible=icon]:hidden">
                <div className="truncate text-sm font-bold text-sidebar-foreground">{userName}</div>
                <div className="truncate text-xs text-muted-foreground">{userRoleLabel}</div>
              </div>
            </div>
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>
        <SidebarInset className="bg-muted">
          <header className="flex items-center justify-between gap-4 border-b border-border bg-card px-4 py-3 sm:px-8">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <div>
                <Breadcrumb className="hidden sm:block">
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbLink asChild>
                        <Link href={navItems[0]?.href ?? "/"}>{panelLabel}</Link>
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage>{pageTitle}</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
                <h1 className="text-lg font-extrabold text-heading sm:text-xl">{pageTitle}</h1>
                {pageSubtitle ? (
                  <p className="text-xs text-muted-foreground">{pageSubtitle}</p>
                ) : null}
              </div>
            </div>
            <UserMenu profile={profile} />
          </header>
          <main className="flex-1 p-4 sm:p-8">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
