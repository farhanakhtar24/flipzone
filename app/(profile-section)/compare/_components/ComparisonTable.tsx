"use client";

import {
  addProductToComparison,
  ProductWithCategories,
} from "@/actions/comparison.action";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { priceFormatter } from "@/util/helper";
import { Star, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

type Props = {
  products: ProductWithCategories[];
};

const ComparisonTable = ({ products }: Props) => {
  const { toast } = useToast();
  const [removingId, setRemovingId] = useState<string | null>(null);

  const handleRemove = async (productId: string) => {
    setRemovingId(productId);
    const { error, message } = await addProductToComparison({
      productId,
      isCompared: false,
    });
    setRemovingId(null);

    if (error) {
      toast({ title: message, description: error, variant: "destructive" });
    } else if (message) {
      toast({ title: message, variant: "success" });
    }
  };

  const rows: {
    label: string;
    render: (p: ProductWithCategories) => React.ReactNode;
  }[] = [
    {
      label: "Image",
      render: (p) => (
        <Link href={`/products/${p.id}`}>
          <Image
            src={p.thumbnail}
            alt={p.title}
            width={120}
            height={120}
            className="mx-auto rounded-md object-cover"
          />
        </Link>
      ),
    },
    {
      label: "Title",
      render: (p) => (
        <Link
          href={`/products/${p.id}`}
          className="font-medium text-primary hover:underline"
        >
          {p.title}
        </Link>
      ),
    },
    {
      label: "Price",
      render: (p) => (
        <span className="text-lg font-bold">{priceFormatter(p.price)}</span>
      ),
    },
    {
      label: "Discount",
      render: (p) =>
        p.discountPercentage ? (
          <span className="text-green-600">
            {Math.round(p.discountPercentage)}% off
          </span>
        ) : (
          "—"
        ),
    },
    {
      label: "Rating",
      render: (p) =>
        p.rating ? (
          <span className="inline-flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            {p.rating.toFixed(1)}
          </span>
        ) : (
          "—"
        ),
    },
    { label: "Brand", render: (p) => p.brand ?? "—" },
    {
      label: "Category",
      render: (p) =>
        p.categories.length > 0
          ? p.categories.map((c) => c.category.name).join(", ")
          : "—",
    },
    {
      label: "Stock",
      render: (p) =>
        p.stock > 0 ? (
          <span>{p.stock} in stock</span>
        ) : (
          <span className="text-destructive">Out of stock</span>
        ),
    },
    { label: "SKU", render: (p) => p.sku ?? "—" },
    {
      label: "Weight",
      render: (p) => (p.weight ? `${p.weight} kg` : "—"),
    },
    {
      label: "Warranty",
      render: (p) => p.warrantyInformation ?? "—",
    },
    {
      label: "Shipping",
      render: (p) => p.shippingInformation ?? "—",
    },
    {
      label: "Return Policy",
      render: (p) => p.returnPolicy ?? "—",
    },
  ];

  return (
    <>
      {/* Desktop table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="p-3 text-left text-sm font-medium text-muted-foreground">
                Feature
              </th>
              {products.map((p) => (
                <th key={p.id} className="min-w-[180px] p-3 text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    onClick={() => handleRemove(p.id)}
                    disabled={removingId === p.id}
                  >
                    <X className="mr-1 h-4 w-4" />
                    Remove
                  </Button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-b last:border-0">
                <td className="p-3 text-sm font-medium text-muted-foreground">
                  {row.label}
                </td>
                {products.map((p) => (
                  <td key={p.id} className="p-3 text-center text-sm">
                    {row.render(p)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-4 md:hidden">
        {products.map((p) => (
          <Card key={p.id}>
            <CardHeader className="flex flex-row items-start justify-between pb-2">
              <CardTitle className="text-base">{p.title}</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive"
                onClick={() => handleRemove(p.id)}
                disabled={removingId === p.id}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center gap-4">
                <Image
                  src={p.thumbnail}
                  alt={p.title}
                  width={80}
                  height={80}
                  className="rounded-md object-cover"
                />
                <div>
                  <p className="text-lg font-bold">{priceFormatter(p.price)}</p>
                  {p.rating && (
                    <p className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      {p.rating.toFixed(1)}
                    </p>
                  )}
                </div>
              </div>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-1">
                <dt className="text-muted-foreground">Brand</dt>
                <dd>{p.brand ?? "—"}</dd>
                <dt className="text-muted-foreground">Stock</dt>
                <dd>{p.stock > 0 ? `${p.stock}` : "Out of stock"}</dd>
                <dt className="text-muted-foreground">Discount</dt>
                <dd>
                  {p.discountPercentage
                    ? `${Math.round(p.discountPercentage)}%`
                    : "—"}
                </dd>
                <dt className="text-muted-foreground">Warranty</dt>
                <dd>{p.warrantyInformation ?? "—"}</dd>
              </dl>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
};

export default ComparisonTable;
