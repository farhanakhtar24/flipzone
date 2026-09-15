import Wrapper from "@/components/Wrapper/Wrapper";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <Wrapper>
      <div className="flex items-start gap-6 py-6">
        <aside className="hidden w-64 shrink-0 space-y-4 md:block">
          <Skeleton className="h-10 w-full rounded-lg" />
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </aside>
        <div className="min-w-0 flex-1">
          <div className="mb-4 flex items-center justify-between">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-9 w-44" />
          </div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[4/5] w-full rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-9 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Wrapper>
  );
}
