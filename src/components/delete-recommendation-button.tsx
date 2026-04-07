"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useActionState, useState } from "react";

import { deleteRecommendationAction } from "@/app/(app)/recommendations/actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

function DeleteRecommendationForm({
  recommendationId,
  title,
}: {
  recommendationId: number;
  title: string;
}) {
  const [state, action, pending] = useActionState(
    deleteRecommendationAction,
    {},
  );

  return (
    <>
      <DialogHeader>
        <DialogTitle>Borrar recomendación</DialogTitle>
        <DialogDescription>
          ¿Seguro que querés borrar{" "}
          <span className="font-medium text-foreground">
            &ldquo;{title}&rdquo;
          </span>
          ? Esta acción no se puede deshacer.
        </DialogDescription>
      </DialogHeader>
      {state.error ? (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}
      <form action={action}>
        <input type="hidden" name="recommendationId" value={recommendationId} />
        <DialogFooter showCloseButton={true}>
          <Button type="submit" variant="destructive" disabled={pending}>
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Borrando…
              </>
            ) : (
              "Borrar definitivamente"
            )}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}

export function DeleteRecommendationButton({
  recommendationId,
  title,
}: {
  recommendationId: number;
  title: string;
}) {
  const [open, setOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setFormKey((k) => k + 1);
      }}
    >
      <DialogTrigger asChild>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="size-4" />
          Eliminar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DeleteRecommendationForm
          key={formKey}
          recommendationId={recommendationId}
          title={title}
        />
      </DialogContent>
    </Dialog>
  );
}
