import { getOrderById } from "@/actions/order.action";
import Wrapper from "@/components/Wrapper/Wrapper";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { priceFormatter } from "@/util/helper";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: { orderId?: string };
};

const CheckoutSuccessPage = async ({ searchParams }: Props) => {
  const orderId = searchParams.orderId;

  if (!orderId) {
    return (
      <Wrapper>
        <Card className="mx-auto max-w-lg p-6 text-center">
          <p className="text-muted-foreground">Missing order reference.</p>
          <Button asChild className="mt-4">
            <Link href="/products">Continue shopping</Link>
          </Button>
        </Card>
      </Wrapper>
    );
  }

  const { data: order } = await getOrderById(orderId);

  return (
    <Wrapper>
      <Card className="mx-auto max-w-lg">
        <CardHeader className="items-center text-center">
          <CheckCircle2 className="h-12 w-12 text-green-600" />
          <CardTitle className="text-2xl">Payment successful</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {order ? (
            <>
              <p className="text-center text-muted-foreground">
                Order <span className="font-medium">#{order.orderId.slice(-8)}</span>{" "}
                is confirmed. A receipt was sent to your email.
              </p>
              <Separator />
              <div className="flex flex-col gap-2">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between text-sm"
                  >
                    <span className="line-clamp-1 pr-4">
                      {item.title} × {item.quantity}
                    </span>
                    <span className="shrink-0">
                      {priceFormatter(item.unitPrice * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total paid</span>
                <span>{priceFormatter(order.total)}</span>
              </div>
            </>
          ) : (
            <p className="text-center text-muted-foreground">
              Your payment is being processed. It may take a moment to appear in
              your order history.
            </p>
          )}
          <div className="mt-2 flex justify-center gap-3">
            <Button asChild variant="outline">
              <Link href="/orders">View orders</Link>
            </Button>
            <Button asChild>
              <Link href="/products">Continue shopping</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </Wrapper>
  );
};

export default CheckoutSuccessPage;
