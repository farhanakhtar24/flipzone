"use client";
import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { logout } from "@/actions/auth.action";
import { NavLinks } from "@/constant/NavLinks";

type Props = {
  name: string | null | undefined;
  imgUrl: string | null | undefined;
};

const ProfileDropdown = ({ name, imgUrl }: Props) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <div className="flex items-center gap-x-2 text-sm">
          <Avatar className="border border-slate-700">
            <AvatarImage src={imgUrl ?? ""} />
            <AvatarFallback>
              {name
                ?.split(" ")
                .map((name) => name[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="space-y-1">
        <DropdownMenuLabel>{name}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <Link href={NavLinks.cart}>
          <DropdownMenuItem className="cursor-pointer">Cart</DropdownMenuItem>
        </Link>
        <Link href={NavLinks.orders}>
          <DropdownMenuItem className="cursor-pointer">Orders</DropdownMenuItem>
        </Link>
        <DropdownMenuItem
          onClick={() => logout()}
          className="cursor-pointer text-red-600"
        >
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileDropdown;
