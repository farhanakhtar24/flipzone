import React from "react";
import AuthTabs from "./_components/AuthTabs";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

const page = async () => {
  const sessoin = await auth();

  if (sessoin?.user) {
    redirect("/");
  }

  return (
    // <div className="flex h-full w-full items-center justify-center">
    <AuthTabs />
    // </div>
  );
};

export default page;
