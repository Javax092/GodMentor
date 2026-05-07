import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <Card className="hero-glow border-white/10">
        <CardContent className="space-y-4 p-6">
          <Skeleton className="h-4 w-36 rounded-full bg-white/10" />
          <Skeleton className="h-12 w-2/3 rounded-2xl bg-white/10" />
          <Skeleton className="h-24 w-full rounded-[28px] bg-white/10" />
        </CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="border-white/10">
            <CardContent className="space-y-4 p-5">
              <Skeleton className="h-4 w-24 rounded-full bg-white/10" />
              <Skeleton className="h-8 w-28 rounded-2xl bg-white/10" />
              <Skeleton className="h-3 w-full rounded-full bg-white/10" />
              <Skeleton className="h-12 w-full rounded-2xl bg-white/10" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
