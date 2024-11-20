import { getUserOrders } from "@/actions/order.action";
import { auth } from "@/auth";
import React from "react";

const page = async () => {
  const session = await auth();

  if (!session?.user?.id) {
    return <div>User not found</div>;
  }

  const { data, error, message } = await getUserOrders(session.user.id);

  if (error) {
    return <div>{error}</div>;
  }

  if (!data) {
    return <div>{message}</div>;
  }

  if (message) {
    console.log("message :", message);
  }

  console.log({ data });

  return (
    <div className="flex h-fit flex-col">
      {Array.from({ length: 100 }).map((_, index) => (
        <div key={index} className="flex w-full items-center justify-between">
          <div className="flex w-full items-center gap-2">
            <div className="h-5 w-5 rounded-full bg-blue-500"></div>
            <div className="font-medium">Order #{index}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default page;
