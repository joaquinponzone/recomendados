"use client";

import {
  HomeIcon,
  PlusCircleIcon,
  SettingsIcon,
  UserIcon,
  UsersIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const mainLinks = [
  { href: "/", label: "Inicio", icon: HomeIcon, exact: true },
  {
    href: "/recommendations/new",
    label: "Nueva",
    icon: PlusCircleIcon,
    exact: false,
  },
  { href: "/settings", label: "Config.", icon: SettingsIcon, exact: false },
];

const adminLink = {
  href: "/admin/users",
  label: "Usuarios",
  icon: UsersIcon,
  exact: false,
};

export function BottomNavLinks({
  role,
  userId,
}: {
  role: string;
  userId: number | null;
}) {
  const pathname = usePathname();
  const profileHref = userId != null ? `/users/${userId}` : null;

  const links = [
    ...(profileHref
      ? [{ href: profileHref, label: "Perfil", icon: UserIcon, exact: true }]
      : []),
    ...mainLinks,
    ...(role === "admin" ? [adminLink] : []),
  ];

  return (
    <div className="flex h-16 items-stretch">
      {links.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-label={label}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-0.5 transition-colors",
              active
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="size-5 shrink-0" aria-hidden="true" />
            <span
              className={cn(
                "text-[10px] leading-none font-medium",
                active ? "opacity-100" : "opacity-60",
              )}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
