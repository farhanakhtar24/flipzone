import Wrapper from "@/components/Wrapper/Wrapper";
import React from "react";
import ProductPage from "./_components/ProductPage";
import { getProductById, getRelatedProducts } from "@/actions/product.action";
import { auth } from "@/auth";
import { notFound } from "next/navigation";
import ProductRail from "@/components/Product/ProductRail";
import RecentlyViewedRail from "@/components/Product/RecentlyViewedRail";
import RecordView from "./_components/RecordView";
import { PAGE_ROUTES } from "@/routes";

export const dynamic = "force-dynamic";

type Props = {
  params: {
    id: string;
  };
};

const page = async ({ params }: Props) => {
  const session = await auth();
  const { id } = params;

  if (!session?.user?.id) {
    notFound();
  }

  const { data: product } = await getProductById(id);

  if (!product) {
    notFound();
  }

  const { data: related } = await getRelatedProducts(id, 8);

  return (
    <Wrapper>
      <RecordView productId={id} />
      <div className="py-8">
        <ProductPage product={product} />

        <div className="mt-16 space-y-12">
          {related && related.length > 0 && (
            <ProductRail
              title="Related products"
              products={related}
              viewAllHref={PAGE_ROUTES.PRODUCTS}
            />
          )}
          <RecentlyViewedRail excludeId={id} />
        </div>
      </div>
    </Wrapper>
  );
};

export default page;
