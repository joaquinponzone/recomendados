import { BottomNav } from "@/components/bottom-nav";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:ring-2 focus:ring-ring"
      >
        Saltar al contenido
      </a>
      <Nav />
      <main
        id="main"
        className="mx-auto w-full max-w-full flex-1 px-4 py-6 pb-24 md:pb-6 lg:max-w-[90%]"
      >
        {children}
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
}
