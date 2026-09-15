import { auth } from "@/auth";
import Link from "next/link";
import logo from "../../public/assets/logo_light.png";
import Image from "next/image";
import ProfileDropdown from "./ProfileDropdown";
import { Button } from "../ui/button";
import SearchBar from "./SearchBar";
import { PAGE_ROUTES } from "@/routes";
import { NavLinks } from "@/constant/NavLinks";
import CategoryDropdown from "./CategoryDropdown";
import { getUserById } from "@/actions/user.action";
import ThemeToggle from "./ThemeToggle";

const Navbar = async () => {
  const session = await auth();
  const user = session?.user?.id ? await getUserById(session.user.id) : null;

  return (
    <nav className="sticky top-0 z-50 flex w-full items-center border-b bg-background px-5 xl:px-0">
      <div className="mx-auto my-2 flex w-full max-w-screen-xl items-center justify-between gap-3">
        <Link className="shrink-0 font-bold" href="/">
          <Image
            src={logo.src}
            alt="Flipzone"
            width={208}
            height={48}
            className="h-auto w-32 sm:w-52"
            priority
          />
        </Link>

        <div className="flex w-full items-center justify-end gap-2 sm:gap-5">
          {session?.user && <SearchBar />}
          <ThemeToggle />
          {!session?.user ? (
            <Link href={PAGE_ROUTES.AUTH}>
              <Button>Login</Button>
            </Link>
          ) : (
            <>
              <Link
                href={NavLinks.products}
                className="hidden font-semibold md:inline"
              >
                All Products
              </Link>
              <div className="hidden md:block">
                <CategoryDropdown />
              </div>
              <ProfileDropdown name={user?.name} imgUrl={user?.image} />
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
