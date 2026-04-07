import { submitVote } from "@/app/(app)/recommendations/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function RecommendationVoteForm({
  recommendationId,
  currentVote,
  disabled,
}: {
  recommendationId: number;
  currentVote: 1 | -1 | null;
  disabled?: boolean;
}) {
  if (disabled) {
    return <p className="text-xs text-muted-foreground">Es tu recomendación</p>;
  }
  return (
    <div className="flex flex-wrap items-center gap-2">
      <form action={submitVote}>
        <input type="hidden" name="recommendationId" value={recommendationId} />
        <input type="hidden" name="value" value="1" />
        <Button
          type="submit"
          size="sm"
          variant={currentVote === 1 ? "default" : "outline"}
          className={cn(currentVote === 1 && "border-primary")}
        >
          +1
        </Button>
      </form>
      <form action={submitVote}>
        <input type="hidden" name="recommendationId" value={recommendationId} />
        <input type="hidden" name="value" value="-1" />
        <Button
          type="submit"
          size="sm"
          variant={currentVote === -1 ? "destructive" : "outline"}
        >
          −1
        </Button>
      </form>
    </div>
  );
}
