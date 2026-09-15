"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  currentPage: number;
  totalPages: number;
};

/** URL-driven pager — preserves every other search param and scrolls to top. */
const Pagination = ({ currentPage, totalPages }: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const goTo = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page <= 1) params.delete("page");
    else params.set("page", String(page));
    router.push(`${pathname}?${params.toString()}`, { scroll: true });
  };

  return (
    <nav
      aria-label="Pagination"
      className="mt-8 flex items-center justify-center gap-2"
    >
      <Button
        variant="outline"
        size="sm"
        onClick={() => goTo(currentPage - 1)}
        disabled={currentPage <= 1}
      >
        <ChevronLeft className="mr-1 h-4 w-4" />
        Previous
      </Button>
      <span className="text-muted-foreground px-3 text-sm">
        Page <span className="font-medium text-foreground">{currentPage}</span>{" "}
        of {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => goTo(currentPage + 1)}
        disabled={currentPage >= totalPages}
      >
        Next
        <ChevronRight className="ml-1 h-4 w-4" />
      </Button>
    </nav>
  );
};

export default Pagination;
