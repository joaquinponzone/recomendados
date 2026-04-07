export const dynamic = "force-dynamic";

import { SettingsForm } from "@/components/settings-form";
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
    </div>
  );
}
