import { getUser } from "@/lib/dal";
import { BottomNavLinks } from "@/components/bottom-nav-links";

export async function BottomNav() {
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
    <nav
      aria-label="Navegación principal"
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur-md md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <BottomNavLinks role={role} userId={userId} />
    </nav>
  );
}
