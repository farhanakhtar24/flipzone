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

const Sidebar = () => {
  const currentRoute = usePathname();

  return (
    <Card className="flex h-fit w-1/5 flex-col divide-y overflow-hidden">
      <Link href={PAGE_ROUTES.PROFILE}>
        <CardHeader
          className={cn(
            `flex w-full flex-col gap-2 transition-all hover:bg-gray-100`,
            currentRoute === PAGE_ROUTES.PROFILE && "bg-gray-200",
          )}
        >
          <div className="flex w-full items-center gap-2">
            <CgProfile className="h-5 w-5" />
            <div className="font-medium">Profile</div>
          </div>
        </CardHeader>
      </Link>
      <Link href={PAGE_ROUTES.WISHLIST}>
        <CardHeader
          className={cn(
            `flex w-full flex-col gap-2 transition-all hover:bg-gray-100`,
            currentRoute === PAGE_ROUTES.WISHLIST && "bg-gray-200",
          )}
        >
          <div className="flex w-full items-center gap-2">
            <FaRegHeart className="h-5 w-5" />
            <div className="font-medium">Wishlist</div>
          </div>
        </CardHeader>
      </Link>
      <Link href={PAGE_ROUTES.COMPARE}>
        <CardHeader
          className={cn(
            `flex w-full flex-col gap-2 transition-all hover:bg-gray-100`,
            currentRoute === PAGE_ROUTES.COMPARE && "bg-gray-200",
          )}
        >
          <div className="flex w-full items-center gap-2">
            <LuGitCompare className="h-5 w-5" />
            <div className="font-medium">Compare</div>
          </div>
        </CardHeader>
      </Link>
      <Link href={PAGE_ROUTES.ORDERS}>
        <CardHeader
          className={cn(
            `flex w-full flex-col gap-2 transition-all hover:bg-gray-100`,
            currentRoute === PAGE_ROUTES.ORDERS && "bg-gray-200",
          )}
        >
          <div className="flex w-full items-center gap-2">
            <LuPackage className="h-5 w-5" />
            <div className="font-medium">Orders</div>
          </div>
        </CardHeader>
      </Link>
    </Card>
  );
};

export default Sidebar;
