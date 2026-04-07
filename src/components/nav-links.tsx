"use client";

import {
  HomeIcon,
  LogOutIcon,
  PlusCircleIcon,
  SettingsIcon,
  UserIcon,
  UsersIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/actions/logout";
import { cn } from "@/lib/utils";

const links = [
  {
    href: "/",
    label: "Inicio",
    exact: true,
    icon: <HomeIcon className="block size-5 md:hidden" />,
  },
  {
    href: "/recommendations/new",
    label: "Nueva",
    exact: false,
    icon: <PlusCircleIcon className="block size-5 md:hidden" />,
  },
  {
    href: "/settings",
    label: "Configuración",
    exact: false,
    icon: <SettingsIcon className="block size-5 md:hidden" />,
  },
];

const adminLinks = [
  {
    href: "/admin/users",
    label: "Usuarios",
    exact: false,
    icon: <UsersIcon className="block size-5 md:hidden" />,
  },
];

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
    <div className="flex min-w-0 flex-1 items-center gap-4 text-sm">
      <div className="flex w-full min-w-0 items-center justify-end gap-6">
        {profileHref ? (
          <Link
            href={profileHref}
            className={cn(
              "flex items-center gap-1.5 transition-colors hover:text-foreground",
              pathname === profileHref
                ? "font-medium text-foreground md:border-b-2 md:border-primary"
                : "text-muted-foreground duration-700 animate-in fade-in-0",
            )}
          >
            <span className="hidden md:block">Mi perfil</span>
            <UserIcon className="block size-5 md:hidden" />
          </Link>
        ) : null}
        {baseLinks.map(({ href, label, exact, icon }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-1.5 transition-colors hover:text-foreground",
                active
                  ? "font-medium text-foreground md:border-b-2 md:border-primary"
                  : "text-muted-foreground duration-700 animate-in fade-in-0",
              )}
            >
              <span className="hidden md:block">{label}</span>
              <span className="block md:hidden">{icon}</span>
            </Link>
          );
        })}
        <form action={logout}>
          <button
            type="submit"
            className="flex cursor-pointer items-center gap-1.5 text-muted-foreground transition-colors duration-700 animate-in fade-in-0 hover:text-foreground"
          >
            <span className="hidden text-destructive md:block">Salir</span>
            <LogOutIcon className="block size-5 text-destructive md:hidden" />
          </button>
        </form>
      </div>
    </div>
  );
}
