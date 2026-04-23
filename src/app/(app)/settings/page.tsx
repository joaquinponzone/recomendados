export const dynamic = "force-dynamic";

import { logout } from "@/app/actions/logout";
import { SettingsForm } from "@/components/settings-form";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getUser } from "@/lib/dal";

export default async function SettingsPage() {
  const user = await getUser();

  return (
    <div className="space-y-4">
      <h1 className="text-sm font-medium text-muted-foreground">
        Configuración
      </h1>
      <Separator />
      <SettingsForm
        timezone={user.timezone}
        userName={user.name}
        userNickname={user.nickname ?? ""}
      />
      <div className="mx-auto max-w-lg md:hidden">
        <Separator />
        <form action={logout} className="pt-6">
          <Button type="submit" variant="destructive" className="w-full">
            Cerrar sesión
          </Button>
        </form>
      </div>
    </div>
  );
}
