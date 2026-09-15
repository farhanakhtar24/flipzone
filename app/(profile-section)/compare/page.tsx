import { getComparisonProducts } from "@/actions/comparison.action";
import { auth } from "@/auth";
import ComparisonTable from "./_components/ComparisonTable";
import { Scale } from "lucide-react";

export const dynamic = "force-dynamic";

const ComparePage = async () => {
  const session = await auth();

  if (!session?.user?.id) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-20 text-center">
        <p className="text-muted-foreground">
          Please sign in to compare products.
        </p>
      </div>
    );
  }

  const { data: products, error } = await getComparisonProducts();

  if (error) {
    return (
      <div className="p-10 text-center text-destructive">{error}</div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-20 text-center">
        <Scale className="h-12 w-12 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Nothing to compare</h2>
        <p className="max-w-md text-muted-foreground">
          Add products to your comparison list from any product page by checking
          the &quot;Compare&quot; checkbox.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full p-6">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">
        Compare Products ({products.length})
      </h1>
      <ComparisonTable products={products} />
    </div>
  );
};

export default ComparePage;
