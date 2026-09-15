import Wrapper from "@/components/Wrapper/Wrapper";
import Spinner from "@/components/ui/spinner";

export default function Loading() {
  return (
    <Wrapper>
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-10 w-10">
          <Spinner className="text-muted-foreground" />
        </div>
      </div>
    </Wrapper>
  );
}
