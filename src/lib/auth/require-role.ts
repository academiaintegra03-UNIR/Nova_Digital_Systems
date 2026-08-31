import "server-only";

import { redirect } from "next/navigation";
import { getAuthenticatedProfile } from "@/lib/auth/get-profile";
import { roleOptionFor } from "@/lib/data/roles";
import type { Profile, Role } from "@/lib/types/session";

/**
 * Server-only panel guard. Call at the top of each dashboard layout:
 *
 *   const profile = await requireRole("estudiante");
 *
 * - No session → redirect to /login?next=<this panel>.
 * - Session but wrong role → redirect to *that user's own* panel, never to
 *   the one they asked for (a colegio account can't land on /admin just by
 *   typing the URL).
 */
export async function requireRole(role: Role): Promise<Profile> {
  const profile = await getAuthenticatedProfile();
  const homePath = roleOptionFor(role)?.homePath ?? "/";

  if (!profile) {
    redirect(`/login?next=${encodeURIComponent(homePath)}`);
  }

  if (profile.role !== role) {
    redirect(roleOptionFor(profile.role)?.homePath ?? "/");
  }

  return profile;
}

/**
 * Same as requireRole, but accepts any of several roles — for actions
 * shared across panels (ej. crear materias: admin o tutor).
 */
export async function requireAnyRole(roles: Role[]): Promise<Profile> {
  const profile = await getAuthenticatedProfile();
  const homePath = roleOptionFor(roles[0])?.homePath ?? "/";

  if (!profile) {
    redirect(`/login?next=${encodeURIComponent(homePath)}`);
  }

  if (!roles.includes(profile.role)) {
    redirect(roleOptionFor(profile.role)?.homePath ?? "/");
  }

  return profile;
}
