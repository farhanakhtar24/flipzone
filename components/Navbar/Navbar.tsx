import { auth } from "@/auth";
import Link from "next/link";
import ProfileDropdown from "./ProfileDropdown";
import { Button } from "../ui/button";
import SearchBar from "./SearchBar";
import { PAGE_ROUTES } from "@/routes";
import CategoryDropdown from "./CategoryDropdown";
import { getUserById } from "@/actions/user.action";
import { getNavbarCounts } from "@/actions/navbar-status.action";
import ThemeToggle from "./ThemeToggle";
import NavbarActions from "./NavbarActions";

const Navbar = async () => {
  const session = await auth();
  const user = session?.user?.id ? await getUserById(session.user.id) : null;
  const counts = session?.user
    ? (await getNavbarCounts()).data
    : { cartCount: 0, wishlistCount: 0 };

  return (
    <nav className="bg-background/95 sticky top-0 z-50 w-full border-b backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 w-full max-w-screen-2xl items-center justify-between gap-4 px-4 md:px-8">
        <Link className="shrink-0 text-xl font-bold tracking-tight" href="/">
          Flip<span className="text-primary">zone</span>
        </Link>

        {session?.user && <SearchBar />}

        <div className="flex items-center gap-1.5 sm:gap-3">
          <Link
            href={PAGE_ROUTES.PRODUCTS}
            className="hidden text-sm font-semibold transition-colors hover:text-primary md:inline"
          >
            Shop
          </Link>
          <div className="hidden md:block">
            <CategoryDropdown />
          </div>
          <ThemeToggle />
          {session?.user && (
            <NavbarActions
              cartCount={counts?.cartCount ?? 0}
              wishlistCount={counts?.wishlistCount ?? 0}
            />
          )}
          {!session?.user ? (
            <Link href={PAGE_ROUTES.AUTH}>
              <Button>Login</Button>
            </Link>
          ) : (
            <ProfileDropdown
              name={user?.name}
              imgUrl={user?.image}
              isAdmin={session.user.role === "ADMIN"}
            />
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
