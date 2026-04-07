"use client";

import Link from "next/link";
import {
  useActionState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { createRecommendation } from "@/app/(app)/recommendations/new/actions";
import { RecommendationCreatePreview } from "@/components/recommendation-create-preview";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RECOMMENDATION_IMAGE_MAX_BYTES } from "@/lib/recommendation-image-limits";
import type { FormState } from "@/lib/validations";

const allowedClientMime = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "",
]);

export function NewRecommendationForm({
  authorLabel,
  userId,
}: {
  authorLabel: string;
  userId: number;
}) {
  const pickedFileRef = useRef<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const boundAction = useMemo(
    () => async (prev: FormState, formData: FormData) => {
      const fromForm = formData.get("imageFile");
      const hasFormFile =
        fromForm instanceof File && fromForm.size > 0;
      const file = hasFormFile ? fromForm : pickedFileRef.current;
      if (file && file.size > 0) {
        formData.set("imageFile", file);
      } else {
        formData.delete("imageFile");
      }
      return createRecommendation(prev, formData);
    },
    [],
  );

  const [state, action, pending] = useActionState(boundAction, {});
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [imageFieldError, setImageFieldError] = useState("");
  const [filePickError, setFilePickError] = useState("");
  const [previewObjectUrl, setPreviewObjectUrl] = useState<string | null>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    if (mq.matches) titleInputRef.current?.focus();
  }, []);

  useEffect(() => {
    return () => {
      if (previewObjectUrl) {
        URL.revokeObjectURL(previewObjectUrl);
      }
    };
  }, [previewObjectUrl]);

  const revokeAndClearPreviewUrl = useCallback(() => {
    setPreviewObjectUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  }, []);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-lg font-medium">Nueva recomendación</h1>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/">Volver</Link>
        </Button>
      </div>
      <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
        <form
          action={action}
          className="flex max-w-lg flex-col gap-4"
          onSubmit={(e) => {
            const hasFile = pickedFileRef.current !== null;
            const hasUrl = imageUrl.trim().length > 0;
            if (!hasFile && !hasUrl) {
              e.preventDefault();
              setImageFieldError("Subí una imagen o pegá una URL.");
            }
          }}
        >
          {state.error ? (
            <Alert variant="destructive" aria-live="polite" aria-atomic="true">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          ) : null}
          <div className="flex flex-col gap-2">
            <Label htmlFor="title">Título</Label>
            <Input
              ref={titleInputRef}
              id="title"
              name="title"
              required
              maxLength={200}
              autoComplete="off"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Descripción</Label>
            <textarea
              id="description"
              name="description"
              required
              rows={6}
              maxLength={8000}
              autoComplete="off"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[120px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="imageFile">Imagen de portada</Label>
            <p className="text-muted-foreground text-sm">
              Elegí un archivo (máx. 4 MB) o pegá una URL más abajo. La subida a
              Vercel ocurre solo al publicar.
            </p>
            <Input
              ref={fileInputRef}
              id="imageFile"
              name="imageFile"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              disabled={pending}
              className="cursor-pointer disabled:cursor-not-allowed"
              onChange={(e) => {
                const input = e.target;
                const file = input.files?.[0];
                setFilePickError("");
                setImageFieldError("");
                if (!file) {
                  pickedFileRef.current = null;
                  revokeAndClearPreviewUrl();
                  return;
                }
                if (file.size > RECOMMENDATION_IMAGE_MAX_BYTES) {
                  setFilePickError("La imagen no puede superar 4 MB.");
                  input.value = "";
                  pickedFileRef.current = null;
                  revokeAndClearPreviewUrl();
                  return;
                }
                const t = file.type?.trim();
                if (t && !allowedClientMime.has(t)) {
                  setFilePickError(
                    "Formato no permitido. Usá JPEG, PNG, WebP o GIF.",
                  );
                  input.value = "";
                  pickedFileRef.current = null;
                  revokeAndClearPreviewUrl();
                  return;
                }
                pickedFileRef.current = file;
                setImageUrl("");
                revokeAndClearPreviewUrl();
                setPreviewObjectUrl(URL.createObjectURL(file));
              }}
            />
            {filePickError ? (
              <p className="text-destructive text-sm" role="alert">
                {filePickError}
              </p>
            ) : null}
            <Label htmlFor="imageUrl" className="mt-2">
              URL de la imagen
            </Label>
            <Input
              id="imageUrl"
              name="imageUrl"
              type="url"
              inputMode="url"
              autoComplete="off"
              spellCheck={false}
              placeholder="https://…"
              value={imageUrl}
              onChange={(e) => {
                const v = e.target.value;
                setImageUrl(v);
                setImageFieldError("");
                setFilePickError("");
                if (v.trim()) {
                  pickedFileRef.current = null;
                  if (fileInputRef.current) fileInputRef.current.value = "";
                  revokeAndClearPreviewUrl();
                }
              }}
            />
            {imageFieldError ? (
              <p className="text-destructive text-sm" role="alert">
                {imageFieldError}
              </p>
            ) : null}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="externalUrl">
              Enlace a la ficha (película, serie o libro)
            </Label>
            <Input
              id="externalUrl"
              name="externalUrl"
              type="url"
              inputMode="url"
              required
              autoComplete="off"
              spellCheck={false}
              placeholder="https://…"
              value={externalUrl}
              onChange={(e) => setExternalUrl(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={pending} className="w-full">
            {pending ? "Publicando…" : "Publicar"}
          </Button>
        </form>
        <div className="lg:sticky lg:top-6">
          <RecommendationCreatePreview
            title={title}
            description={description}
            imageUrl={imageUrl}
            imagePreviewUrl={previewObjectUrl ?? undefined}
            externalUrl={externalUrl}
            authorLabel={authorLabel}
            userId={userId}
          />
        </div>
      </div>
    </div>
  );
}
