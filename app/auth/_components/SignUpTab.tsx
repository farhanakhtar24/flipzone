"use client";
import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { signUp } from "@/actions/auth/signUp.action";
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
import { TabsContent } from "@/components/ui/tabs";
import { ToastAction } from "@/components/ui/toast";
import { useForm } from "react-hook-form";
import { SignUpSchema } from "@/schemas/auth";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Spinner from "@/components/ui/spinner";
import FormError from "@/components/ui/form-error";

// type Props = {};

const SignUpTab = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const { toast } = useToast();

  const form = useForm<z.infer<typeof SignUpSchema>>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const handleSignUp = async (values: z.infer<typeof SignUpSchema>) => {
    setLoading(true);

    const res = await signUp(values);

    if (res?.error) {
      setError(res.error);
    } else {
      toast({
        title: "Registration successful.",
        description: "You have been successfully registered.",
        variant: "default",
        action: <ToastAction altText="Close">Close</ToastAction>,
      });
    }

    setLoading(false);
  };

  return (
    <TabsContent value="sign-up">
      <Card>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSignUp)}>
            <CardHeader>
              <CardTitle>Sign Up</CardTitle>
              <CardDescription>
                Sign up with your account details.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="PedroDuarte" type="text" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
            </CardContent>
            <CardFooter className="flex flex-col gap-6">
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
                  "Sign Up"
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </TabsContent>
  );
};

export default SignUpTab;
