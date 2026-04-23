"use client";

import Link from "next/link";
import { EyeIcon, EyeOffIcon } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RECOMMENDATION_IMAGE_MAX_BYTES } from "@/lib/recommendation-image-limits";
import type { FormState, RecommendationKind } from "@/lib/validations";

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
      const hasFormFile = fromForm instanceof File && fromForm.size > 0;
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
  const [kind, setKind] = useState<RecommendationKind>("movie");
  const [imageUrl, setImageUrl] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [bookAuthor, setBookAuthor] = useState("");
  const [director, setDirector] = useState("");
  const [mainActors, setMainActors] = useState("");
  const [filePickError, setFilePickError] = useState("");
  const [previewObjectUrl, setPreviewObjectUrl] = useState<string | null>(null);
  const [showMobilePreview, setShowMobilePreview] = useState(false);
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
        <form action={action} className="flex max-w-lg flex-col gap-4">
          <input type="hidden" name="kind" value={kind} />
          {state.error ? (
            <Alert variant="destructive" aria-live="polite" aria-atomic="true">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          ) : null}
          <div className="flex flex-col gap-2">
            <Label htmlFor="rec-kind">Tipo</Label>
            <Select
              value={kind}
              onValueChange={(v) => setKind(v as RecommendationKind)}
              disabled={pending}
            >
              <SelectTrigger id="rec-kind" className="w-full max-w-full">
                <SelectValue placeholder="Elegí el tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="movie">Película</SelectItem>
                <SelectItem value="series">Serie</SelectItem>
                <SelectItem value="book">Libro</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
              className="flex min-h-[120px] w-full rounded-2xl border border-input bg-input/30 px-3 py-2 text-base outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
            />
          </div>
          {kind === "book" ? (
            <div className="flex flex-col gap-2">
              <Label htmlFor="bookAuthor">Autor</Label>
              <Input
                id="bookAuthor"
                name="bookAuthor"
                maxLength={300}
                autoComplete="off"
                value={bookAuthor}
                onChange={(e) => setBookAuthor(e.target.value)}
                placeholder="Opcional"
              />
            </div>
          ) : null}
          {kind === "movie" || kind === "series" ? (
            <>
              <div className="flex flex-col gap-2">
                <Label htmlFor="director">Director</Label>
                <Input
                  id="director"
                  name="director"
                  maxLength={300}
                  autoComplete="off"
                  value={director}
                  onChange={(e) => setDirector(e.target.value)}
                  placeholder="Opcional"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="mainActors">Actores principales</Label>
                <Input
                  id="mainActors"
                  name="mainActors"
                  maxLength={500}
                  autoComplete="off"
                  value={mainActors}
                  onChange={(e) => setMainActors(e.target.value)}
                  placeholder="Opcional, separados por comas"
                />
              </div>
            </>
          ) : null}
          <div className="flex flex-col gap-2">
            <Label htmlFor="imageFile">Imagen de portada</Label>
            <p className="text-muted-foreground text-sm">
              Opcional: archivo (máx. 4 MB) o URL más abajo. La subida a Vercel
              ocurre solo al publicar.
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
              placeholder="https://… (opcional)"
              value={imageUrl}
              onChange={(e) => {
                const v = e.target.value;
                setImageUrl(v);
                setFilePickError("");
                if (v.trim()) {
                  pickedFileRef.current = null;
                  if (fileInputRef.current) fileInputRef.current.value = "";
                  revokeAndClearPreviewUrl();
                }
              }}
            />
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
              autoComplete="off"
              spellCheck={false}
              placeholder="https://… (opcional)"
              value={externalUrl}
              onChange={(e) => setExternalUrl(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={pending} className="w-full">
            {pending ? "Publicando…" : "Publicar"}
          </Button>
        </form>

        {/* Mobile preview toggle */}
        <button
          type="button"
          onClick={() => setShowMobilePreview((v) => !v)}
          className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground lg:hidden"
        >
          {showMobilePreview ? (
            <EyeOffIcon className="size-4" aria-hidden="true" />
          ) : (
            <EyeIcon className="size-4" aria-hidden="true" />
          )}
          {showMobilePreview ? "Ocultar vista previa" : "Ver vista previa"}
        </button>

        <div className={cn("lg:sticky lg:top-6", !showMobilePreview && "hidden lg:block")}>
          <RecommendationCreatePreview
            title={title}
            description={description}
            kind={kind}
            imageUrl={imageUrl}
            imagePreviewUrl={previewObjectUrl ?? undefined}
            externalUrl={externalUrl}
            bookAuthor={bookAuthor}
            director={director}
            mainActors={mainActors}
            authorLabel={authorLabel}
            userId={userId}
          />
        </div>
      </div>
    </div>
  );
}
