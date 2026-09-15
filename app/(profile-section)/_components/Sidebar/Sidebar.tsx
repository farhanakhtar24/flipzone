"use client";
import { Card, CardHeader } from "@/components/ui/card";
import { PAGE_ROUTES } from "@/routes";
import Link from "next/link";
import React from "react";
import { CgProfile } from "react-icons/cg";
import { LuPackage } from "react-icons/lu";
import { FaRegHeart } from "react-icons/fa";
import { LuGitCompare } from "react-icons/lu";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: PAGE_ROUTES.PROFILE, label: "Profile", icon: CgProfile },
  { href: PAGE_ROUTES.WISHLIST, label: "Wishlist", icon: FaRegHeart },
  { href: PAGE_ROUTES.COMPARE, label: "Compare", icon: LuGitCompare },
  { href: PAGE_ROUTES.ORDERS, label: "Orders", icon: LuPackage },
];

const Sidebar = () => {
  const currentRoute = usePathname();

  return (
    <Card className="flex h-fit w-full flex-row overflow-x-auto divide-x overflow-hidden md:w-1/5 md:flex-col md:divide-x-0 md:divide-y">
      {links.map(({ href, label, icon: Icon }) => (
        <Link key={href} href={href} className="min-w-fit flex-1 md:flex-none">
          <CardHeader
            className={cn(
              "flex w-full flex-col gap-2 transition-all hover:bg-muted",
              currentRoute === href && "bg-muted",
            )}
          >
            <div className="flex w-full items-center gap-2">
              <Icon className="h-5 w-5" />
              <div className="font-medium">{label}</div>
            </div>
          </CardHeader>
        </Link>
      ))}
    </Card>
  );
};

export default Sidebar;
