"use client";

import { useCallback, useState } from "react";

import {
  updateDisplayName,
  updateNickname,
  updateTimezone,
} from "@/app/(app)/settings/actions";
import { SaveStatus } from "@/components/save-status";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useDebounce } from "@/hooks/use-debounce";
import { useSaveStatus } from "@/hooks/use-save-status";

const TIMEZONES = [
  "America/Argentina/Buenos_Aires",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Sao_Paulo",
  "Europe/London",
  "Europe/Paris",
  "Europe/Madrid",
  "Europe/Lisbon",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Tokyo",
  "Australia/Sydney",
  "Pacific/Auckland",
  "UTC",
];

export function SettingsForm({
  timezone: initialTimezone,
  userName,
  userNickname,
}: {
  timezone: string;
  userName: string;
  userNickname: string;
}) {
  const [timezone, setTimezone] = useState(initialTimezone);
  const [displayName, setDisplayName] = useState(userName);
  const [nickname, setNickname] = useState(userNickname);
  const [nicknameError, setNicknameError] = useState<string | null>(null);

  const nameStatus = useSaveStatus();
  const nicknameStatus = useSaveStatus();
  const timezoneStatus = useSaveStatus();

  const persistName = useDebounce(
    useCallback(
      async (name: string) => {
        await nameStatus.wrap(() => updateDisplayName(name));
      },
      [nameStatus],
    ),
    1000,
  );

  const persistNickname = useDebounce(
    useCallback(
      async (value: string) => {
        const result = await nicknameStatus.wrap(() => updateNickname(value));
        if (!result.ok) setNicknameError(result.error ?? "Error al guardar.");
        else setNicknameError(null);
      },
      [nicknameStatus],
    ),
    1000,
  );

  const persistTimezone = useDebounce(
    useCallback(
      async (tz: string) => {
        await timezoneStatus.wrap(() => updateTimezone(tz));
      },
      [timezoneStatus],
    ),
    500,
  );

  return (
    <div className="mx-auto grid max-w-lg grid-cols-1 gap-8">
      <section className="space-y-3">
        <h2 className="w-fit border-b border-primary pb-2 text-sm font-medium italic">
          Perfil
        </h2>

        <div className="space-y-2">
          <Label htmlFor="display-name">Nombre</Label>
          <Input
            id="display-name"
            placeholder="Tu nombre"
            value={displayName}
            onChange={(e) => {
              setDisplayName(e.target.value);
              persistName(e.target.value);
            }}
          />
          <SaveStatus {...nameStatus} />
        </div>

        <div className="space-y-2">
          <div>
            <Label htmlFor="nickname">Nickname</Label>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Nombre público. Único por usuario.
            </p>
          </div>
          <Input
            id="nickname"
            placeholder="ej: lector_curioso"
            value={nickname}
            onChange={(e) => {
              setNickname(e.target.value);
              setNicknameError(null);
              persistNickname(e.target.value);
            }}
          />
          {nicknameError ? (
            <p className="text-xs text-destructive">{nicknameError}</p>
          ) : nicknameStatus.isSaving || nicknameStatus.saved ? (
            <SaveStatus {...nicknameStatus} />
          ) : (
            <p className="text-xs text-muted-foreground">
              Solo letras, números y _ (3-20 caracteres).
            </p>
          )}
        </div>
      </section>

      <Separator />

      <section className="space-y-3">
        <h2 className="text-sm font-medium">Zona horaria</h2>
        <p className="text-xs text-muted-foreground">
          Para fechas y horarios en la app.
        </p>
        <Select
          value={timezone}
          onValueChange={(v) => {
            setTimezone(v);
            persistTimezone(v);
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TIMEZONES.map((tz) => (
              <SelectItem key={tz} value={tz}>
                {tz}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <SaveStatus {...timezoneStatus} />
      </section>
    </div>
  );
}
