import React from "react";
import SignInTab from "./SignInTab";
import SignUpTab from "./SignUpTab";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BadgePercent,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from "lucide-react";

const PERKS = [
  { icon: Truck, label: "Free shipping over $50" },
  { icon: RotateCcw, label: "30-day easy returns" },
  { icon: ShieldCheck, label: "Secure Stripe checkout" },
  { icon: BadgePercent, label: "New deals every week" },
];

const AuthTabs = () => {
  return (
    <div className="grid min-h-[calc(100vh-4rem-1px)] w-full grid-cols-1 lg:grid-cols-2">
      {/* Brand panel */}
      <div className="from-indigo-600 via-indigo-500 to-violet-600 relative hidden flex-col justify-between bg-gradient-to-br p-12 text-white lg:flex">
        <p className="text-2xl font-bold tracking-tight">
          Flip<span className="text-white/70">zone</span>
        </p>
        <div>
          <h1 className="text-4xl font-bold leading-tight tracking-tight">
            Everything you love,
            <br />
            one marketplace.
          </h1>
          <p className="mt-4 max-w-md text-white/85">
            Shop 500+ products across electronics, fashion, home and more —
            with honest prices and reviews you can trust.
          </p>
          <ul className="mt-10 space-y-4">
            {PERKS.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-3 text-sm">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15">
                  <Icon className="h-4 w-4" />
                </span>
                {label}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-sm text-white/60">
          Demo storefront — no real orders are fulfilled.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <p className="text-2xl font-bold tracking-tight">
              Flip<span className="text-primary">zone</span>
            </p>
          </div>

          <Tabs defaultValue="sign-in" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="sign-in">Sign In</TabsTrigger>
              <TabsTrigger value="sign-up">Sign Up</TabsTrigger>
            </TabsList>

            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="text-primary h-5 w-5" />
                  Welcome
                </CardTitle>
                <CardDescription>
                  Sign in to your account or create a new one.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SignInTab />
                <SignUpTab />
              </CardContent>
            </Card>
          </Tabs>

          {/* Demo credentials for portfolio visitors */}
          <div className="bg-accent text-accent-foreground mt-6 rounded-xl border p-4 text-sm">
            <p className="font-semibold">Try the demo account</p>
            <p className="mt-1">
              <code className="bg-background rounded px-1.5 py-0.5">
                demo@flipzone.dev
              </code>{" "}
              /{" "}
              <code className="bg-background rounded px-1.5 py-0.5">
                DemoPass123
              </code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthTabs;
