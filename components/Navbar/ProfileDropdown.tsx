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
import { MdOutlineShoppingCart } from "react-icons/md";
import { LuPackage } from "react-icons/lu";
import { FaRegHeart } from "react-icons/fa";

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
        <Link href={NavLinks.profile}>
          <DropdownMenuLabel className="flex cursor-pointer items-center gap-2">
            {name}
          </DropdownMenuLabel>
        </Link>
        <DropdownMenuSeparator />
        <Link href={NavLinks.cart}>
          <DropdownMenuItem className="flex cursor-pointer items-center gap-2">
            <MdOutlineShoppingCart />
            Cart
          </DropdownMenuItem>
        </Link>
        <Link href={NavLinks.wishlist}>
          <DropdownMenuItem className="flex cursor-pointer items-center gap-2">
            <FaRegHeart />
            Wishlist
          </DropdownMenuItem>
        </Link>
        <Link href={NavLinks.orders}>
          <DropdownMenuItem className="flex cursor-pointer items-center gap-2">
            <LuPackage />
            Orders
          </DropdownMenuItem>
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
