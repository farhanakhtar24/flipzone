"use client";
import { login } from "@/actions/auth/auth.action";
import { Button } from "@/components/ui/button";
import Spinner from "@/components/ui/spinner";
import React, { useState } from "react";
import { FaGithub } from "react-icons/fa";

const GithubSignInBtn = () => {
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setLoading(true);
    await login("github");
    setLoading(false);
  };

  return (
    <Button
      className="flex w-full items-center justify-center gap-2 text-slate-800"
      onClick={handleSignIn}
      disabled={loading}
      variant="outline"
    >
      {loading ? (
        <div className="h-5 w-5">
          <Spinner />
        </div>
      ) : (
        <FaGithub className="text-lg" />
      )}
    </Button>
  );
};

export default GithubSignInBtn;
