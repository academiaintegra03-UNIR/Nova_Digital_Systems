"use client";

import Link from "next/link";
import { LogOut, UserRoundCog } from "lucide-react";
import { signOut } from "@/lib/auth/actions";
import { roleOptionFor } from "@/lib/data/roles";
import type { Profile } from "@/lib/types/session";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function initials(name: string) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0])
      .join("")
      .toUpperCase() || "?"
  );
}

export function UserMenu({
  profile,
  compact,
}: {
  profile: Profile | null;
  /**
   * True in the main site header, where a mobile hamburger menu already
   * shows this same component uncollapsed — so below `lg` (where that menu
   * takes over) these two full-width buttons would otherwise just crowd the
   * logo and menu trigger. False (default) for the copy rendered inside
   * that mobile menu itself, which should always show both actions.
   */
  compact?: boolean;
}) {
  if (!profile) {
    return (
      <div className={cn("flex items-center gap-2", compact && "hidden lg:flex")}>
        <Button variant="ghost" asChild>
          <Link href="/login">Iniciar sesión</Link>
        </Button>
        <Button variant="cta" asChild>
          <Link href="/diagnostico">Comenzar ahora</Link>
        </Button>
      </div>
    );
  }

  const option = roleOptionFor(profile.role);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-auto gap-2 px-2 py-1.5">
          <Avatar className="size-7">
            <AvatarFallback className="bg-secondary text-xs font-bold text-heading">
              {initials(profile.nombre)}
            </AvatarFallback>
          </Avatar>
          <span className="hidden text-left sm:block">
            <span className="block text-xs font-semibold leading-tight">{profile.nombre}</span>
            <span className="block text-xs leading-tight text-muted-foreground">
              {option?.label ?? profile.role}
            </span>
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {option ? (
          <DropdownMenuItem asChild>
            <Link href={option.homePath}>
              <UserRoundCog /> Ir a mi panel
            </Link>
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={() => void signOut()}>
          <LogOut /> Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
