import Wrapper from "@/components/Wrapper/Wrapper";
import { Button } from "@/components/ui/button";
import { SearchX } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <Wrapper>
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <SearchX className="h-12 w-12 text-muted-foreground" />
        <h2 className="text-2xl font-bold">Page not found</h2>
        <p className="max-w-md text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link href="/">
          <Button variant="outline">Go home</Button>
        </Link>
      </div>
    </Wrapper>
  );
}
