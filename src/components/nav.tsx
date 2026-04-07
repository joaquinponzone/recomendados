import Image from "next/image";
import Link from "next/link";

import { NavLinks } from "@/components/nav-links";
import { ThemeToggle } from "@/components/theme-toggle";
import { getUser } from "@/lib/dal";

export async function Nav() {
  let role = "user";
  let userId: number | null = null;
  try {
    const user = await getUser();
    role = user.role;
    userId = user.id;
  } catch {
    // DB not reachable during build or before setup
  }

  return (
    <nav className="border-b">
      <div className="mx-auto flex w-full items-center justify-between gap-6 px-4 py-3 xl:max-w-[70%]">
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-medium text-primary"
        >
          <Image
            src="/recomendados.png"
            alt=""
            width={32}
            height={32}
            className="size-8 shrink-0 object-contain"
            priority
          />
          <span>Recomendados</span>
        </Link>
        <div className="flex flex-1 items-center justify-end gap-3">
          <NavLinks role={role} userId={userId} />
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
