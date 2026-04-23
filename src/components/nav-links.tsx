"use client";

import { LogOutIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/actions/logout";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Inicio", exact: true },
  { href: "/recommendations/new", label: "Nueva", exact: false },
  { href: "/settings", label: "Configuración", exact: false },
];

const adminLinks = [{ href: "/admin/users", label: "Usuarios", exact: false }];

export function NavLinks({
  role,
  userId,
}: {
  role: string;
  userId: number | null;
}) {
  const pathname = usePathname();
  const baseLinks = role === "admin" ? [...links, ...adminLinks] : links;
  const profileHref = userId != null ? `/users/${userId}` : null;

  return (
    <div className="hidden min-w-0 flex-1 items-center gap-4 text-sm md:flex">
      <div className="flex w-full min-w-0 items-center justify-end gap-6">
        {profileHref ? (
          <Link
            href={profileHref}
            aria-label="Mi perfil"
            className={cn(
              "flex items-center gap-1.5 transition-colors hover:text-foreground",
              pathname === profileHref
                ? "border-b-2 border-primary font-medium text-foreground"
                : "text-muted-foreground duration-700 animate-in fade-in-0",
            )}
          >
            Mi perfil
          </Link>
        ) : null}
        {baseLinks.map(({ href, label, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-1.5 transition-colors hover:text-foreground",
                active
                  ? "border-b-2 border-primary font-medium text-foreground"
                  : "text-muted-foreground duration-700 animate-in fade-in-0",
              )}
            >
              {label}
            </Link>
          );
        })}
        <form action={logout}>
          <button
            type="submit"
            aria-label="Cerrar sesión"
            className="flex cursor-pointer items-center gap-1.5 text-destructive transition-colors duration-700 animate-in fade-in-0 hover:text-destructive/80"
          >
            <LogOutIcon className="size-4" aria-hidden="true" />
            Salir
          </button>
        </form>
      </div>
    </div>
  );
}
