import { getUserOrders } from "@/actions/order.action";
import { auth } from "@/auth";
import React from "react";
import OrderList from "./_components/OrderList";

export const dynamic = "force-dynamic";

const page = async () => {
  const session = await auth();

  if (!session?.user?.id) {
    return <div>User not found</div>;
  }

  const { data, error, message } = await getUserOrders(session.user.id);

  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        {message}
      </div>
    );
  }

  if (message) {
    console.log("message :", message);
  }

  console.log({ data });

  return (
    <div className="flex h-fit flex-col">
      <OrderList orders={data} />
    </div>
  );
};

export default page;
