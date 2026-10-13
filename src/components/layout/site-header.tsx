"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { marketingNavGroups, marketingNavPrimary } from "@/lib/data/nav";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { UserMenu } from "@/components/layout/user-menu";
import type { Profile } from "@/lib/types/session";
import { cn } from "@/lib/utils";

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function SiteHeader({ profile }: { profile: Profile | null }) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <a
        href="#contenido-principal"
        className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:top-2 focus-visible:left-2 focus-visible:z-100 focus-visible:rounded-lg focus-visible:bg-background focus-visible:px-4 focus-visible:py-2 focus-visible:text-sm focus-visible:font-semibold focus-visible:text-heading focus-visible:shadow-lg focus-visible:ring-2 focus-visible:ring-ring"
      >
        Saltar al contenido principal
      </a>
      <header className="sticky top-0 z-50 border-b border-border bg-background/90 text-foreground backdrop-blur-md supports-backdrop-filter:bg-background/75">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2.5 sm:px-8">
          <Logo />

          <Separator orientation="vertical" className="mx-1 hidden h-6! lg:block" />

          <NavigationMenu viewport={false} className="hidden lg:flex">
            <NavigationMenuList className="gap-0.5">
              {marketingNavGroups.map((group) => {
                const groupActive = group.items.some((item) => isActive(pathname, item.href));
                return (
                  <NavigationMenuItem key={group.label}>
                    <NavigationMenuTrigger
                      className={cn(
                        "bg-transparent text-sm font-semibold text-foreground/80 data-open:text-heading",
                        groupActive && "bg-muted/50 text-heading",
                      )}
                    >
                      {group.label}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-64 gap-1 p-1">
                        {group.items.map((item) => (
                          <li key={item.href}>
                            <NavigationMenuLink asChild active={isActive(pathname, item.href)}>
                              <Link
                                href={item.href}
                                className="flex-col items-start gap-0.5"
                                aria-current={isActive(pathname, item.href) ? "page" : undefined}
                              >
                                <span className="text-sm font-semibold text-heading">{item.label}</span>
                                {item.description ? (
                                  <span className="text-xs text-muted-foreground">{item.description}</span>
                                ) : null}
                              </Link>
                            </NavigationMenuLink>
                          </li>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                );
              })}

              {marketingNavPrimary.map((item) => (
                <NavigationMenuItem key={item.href}>
                  <NavigationMenuLink
                    asChild
                    active={isActive(pathname, item.href)}
                    className="h-9 rounded-lg px-2.5 text-sm font-semibold text-foreground/80 data-active:bg-muted data-active:text-heading"
                  >
                    <Link href={item.href} aria-current={isActive(pathname, item.href) ? "page" : undefined}>
                      {item.label}
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          <div className="ml-auto flex items-center gap-2">
            <UserMenu profile={profile} compact />

            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Abrir menú">
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <SheetHeader>
                  <SheetTitle asChild>
                    <Logo withTagline={false} />
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-4 overflow-y-auto px-4 pb-4">
                  {marketingNavGroups.map((group) => (
                    <div key={group.label}>
                      <div className="mb-1 px-3 text-xs font-bold tracking-wide text-muted-foreground uppercase">
                        {group.label}
                      </div>
                      <div className="flex flex-col gap-0.5">
                        {group.items.map((item) => {
                          const active = isActive(pathname, item.href);
                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={() => setOpen(false)}
                              aria-current={active ? "page" : undefined}
                              className={cn(
                                "rounded-lg px-3 py-2 text-sm font-semibold text-foreground hover:bg-muted",
                                active && "bg-muted text-heading",
                              )}
                            >
                              {item.label}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  <Separator />

                  <div className="flex flex-col gap-0.5">
                    {marketingNavPrimary.map((item) => {
                      const active = isActive(pathname, item.href);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setOpen(false)}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            "rounded-lg px-3 py-2 text-sm font-semibold text-foreground hover:bg-muted",
                            active && "bg-muted text-heading",
                          )}
                        >
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                </nav>
                <div className="mt-auto border-t border-border px-4 pt-4">
                  <UserMenu profile={profile} />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
    </>
  );
}
