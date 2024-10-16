import { auth } from "@/auth";
import Link from "next/link";
import logo from "@/public/assets/logo_light.png";
import Image from "next/image";
import ProfileDropdown from "./ProfileDropdown";
import { Button } from "../ui/button";
import SearchBar from "./SearchBar";
import { PAGE_ROUTES } from "@/routes";
import { NavLinks } from "@/constant/NavLinks";

const Navbar = async () => {
  const session = await auth();

  return (
    <nav className="sticky top-0 z-50 flex w-full items-center border-b bg-background px-5 xl:px-0">
      <div className="mx-auto my-2 flex w-full max-w-screen-xl items-center justify-between">
        <Link className="font-bold" href="/">
          <Image
            src={logo.src}
            alt="logo"
            width={999}
            height={999}
            className="h-auto w-52"
          />
        </Link>

        <div className="flex w-full items-center justify-end gap-5">
          {!session?.user ? (
            <Link href={PAGE_ROUTES.AUTH}>
              <Button className="bg-blue-600 text-white hover:bg-blue-500">
                Login
              </Button>
            </Link>
          ) : (
            <>
              <SearchBar />
              <Link href={NavLinks.products} className="font-semibold">
                All Products
              </Link>
              <Link href={NavLinks.categories} className="font-semibold">
                Categories
              </Link>
              <ProfileDropdown
                name={session?.user?.name}
                imgUrl={session?.user?.image}
              />
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
