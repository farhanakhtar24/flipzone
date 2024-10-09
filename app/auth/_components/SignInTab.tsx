"use client";
import React, { useState } from "react";
import GithubSignInBtn from "./GithubSignInBtn";
import { loginWithCreds } from "@/actions/auth.action";
import { TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { LoginSchema } from "@/schemas/auth";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import GoogleSignInBtn from "./GoogleSignInBtn";
import Spinner from "@/components/ui/spinner";
import FormError from "@/components/ui/form-error";

const SignInTab = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleSignIn = async (values: z.infer<typeof LoginSchema>) => {
    setLoading(true);
    const res = await loginWithCreds(values);

    if (res?.error) {
      setError(res.error);
    }

    setLoading(false);
  };

  return (
    <TabsContent value="sign-in">
      <Card>
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
          <CardDescription>
            Sign In to your account to continue browsing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSignIn)}
              className="space-y-6"
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="PedroDuarte@xyz.com"
                        type="email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="••••••" type="password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormError message={error} />
              <Button
                className="flex w-full gap-2 bg-blue-700 hover:bg-blue-600/85"
                disabled={loading || !form.formState.isValid}
                type="submit"
              >
                {loading ? (
                  <div className="h-5 w-5">
                    <Spinner />
                  </div>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col gap-6">
          <Separator />
          <div className="flex w-full items-center justify-between gap-3">
            <GoogleSignInBtn />
            <GithubSignInBtn />
          </div>
        </CardFooter>
      </Card>
    </TabsContent>
  );
};

export default SignInTab;
