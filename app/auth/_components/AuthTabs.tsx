import React from "react";
import SignInTab from "./SignInTab";
import { Tabs, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import SignUpTab from "./SignUpTab";

const AuthTabs = () => {
  return (
    <Tabs defaultValue="sign-in" className="w-[400px]">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="sign-in">Sign In</TabsTrigger>
        <TabsTrigger value="sign-up">Sign Up</TabsTrigger>
      </TabsList>
      <SignInTab />
      <SignUpTab />
    </Tabs>
  );
};

export default AuthTabs;
