import { login } from "@/actions/auth.action";
import { Button } from "@/components/ui/button";
import Spinner from "@/components/ui/spinner";
import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc";

const GoogleSignInBtn = () => {
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setLoading(true);
    await login("google");
    setLoading(false);
  };

  return (
    <Button
      className="flex w-full items-center justify-center gap-2"
      onClick={handleSignIn}
      disabled={loading}
      variant="outline"
    >
      {loading ? (
        <div className="h-5 w-5">
          <Spinner className="text-slate-800" />
        </div>
      ) : (
        <FcGoogle className="text-lg" />
      )}
    </Button>
  );
};

export default GoogleSignInBtn;
