import React from "react";
import AuthTabs from "./_components/AuthTabs";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

const page = async () => {
  const session = await auth();

  if (session?.user) {
    redirect("/");
  }

  return <AuthTabs />;
};

export default page;
