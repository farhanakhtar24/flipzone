import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ProductsCard from "@/components/Product/ProductsCard";
import { IproductWithCartStatus } from "@/interfaces/actionInterface";
import { PAGE_ROUTES } from "@/routes";

type Props = {
  title: string;
  products: IproductWithCartStatus[];
  viewAllHref?: string;
};

/**
 * A horizontally scrolling product rail (bestsellers, deals, related, …).
 * Cards get a fixed width so the rail scrolls instead of wrapping.
 */
const ProductRail = ({ title, products, viewAllHref }: Props) => {
  if (products.length === 0) return null;

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold tracking-tight md:text-2xl">
          {title}
        </h2>
        {viewAllHref ? (
          <Link
            href={viewAllHref}
            className="text-primary flex items-center gap-1 text-sm font-medium hover:underline"
          >
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        ) : null}
      </div>
      <div
        className="flex snap-x gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="list"
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="w-[220px] shrink-0 snap-start sm:w-[240px]"
            role="listitem"
          >
            <ProductsCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProductRail;
