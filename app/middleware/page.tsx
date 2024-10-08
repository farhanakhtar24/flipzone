import { auth } from "@/auth";
import React from "react";

const Middleware = async () => {
  const session = await auth();

  return (
    <main className="flex h-full flex-col items-center justify-center gap-2">
      <h1 className="text-3xl">Middleware page</h1>
      <p className="text-lg">{session?.user?.email}</p>
      <p className="text-lg">{session?.user?.id}</p>
      <p className="text-lg">{session?.user?.role}</p>
    </main>
  );
};

export default Middleware;
