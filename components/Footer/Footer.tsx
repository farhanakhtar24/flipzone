import Link from "next/link";
import { PAGE_ROUTES } from "@/routes";
import { CATEGORY_GROUPS } from "@/constant/CategoryGroups";
import { CreditCard, RotateCcw, ShieldCheck, Truck } from "lucide-react";

const accountLinks = [
  { label: "Profile", href: PAGE_ROUTES.PROFILE },
  { label: "Orders", href: PAGE_ROUTES.ORDERS },
  { label: "Wishlist", href: PAGE_ROUTES.WISHLIST },
  { label: "Compare", href: PAGE_ROUTES.COMPARE },
  { label: "Cart", href: PAGE_ROUTES.CART },
];

const valueProps = [
  { icon: Truck, label: "Free shipping over $50" },
  { icon: RotateCcw, label: "30-day returns" },
  { icon: ShieldCheck, label: "Secure checkout" },
  { icon: CreditCard, label: "All major cards accepted" },
];

const Footer = () => {
  return (
    <footer className="border-t bg-card">
      <div className="mx-auto w-full max-w-screen-2xl px-4 py-8 md:px-8">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {valueProps.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-3 text-sm text-muted-foreground"
            >
              <Icon className="h-5 w-5 shrink-0 text-primary" />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t">
        <div className="mx-auto grid w-full max-w-screen-2xl grid-cols-2 gap-10 px-4 py-12 md:grid-cols-4 md:px-8">
          <div className="col-span-2 md:col-span-1">
            <p className="text-lg font-bold tracking-tight">
              Flip<span className="text-primary">zone</span>
            </p>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              A demo e-commerce marketplace. Great products, honest prices, and
              a storefront built with Next.js.
            </p>
          </div>
          {CATEGORY_GROUPS.map((group) => (
            <div key={group.slug} className="min-w-0">
              <p className="text-sm font-semibold">{group.label}</p>
              <ul className="mt-3 space-y-2">
                {group.leaves.slice(0, 5).map((leaf) => (
                  <li key={leaf.slug}>
                    <Link
                      href={`${PAGE_ROUTES.PRODUCTS}?category=${encodeURIComponent(
                        leaf.slug,
                      )}`}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {leaf.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mx-auto grid w-full max-w-screen-2xl grid-cols-2 gap-10 px-4 pb-12 md:px-8">
          <div>
            <p className="text-sm font-semibold">Your account</p>
            <ul className="mt-3 space-y-2">
              {accountLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold">Explore</p>
            <ul className="mt-3 space-y-2">
              <li>
                <Link
                  href={PAGE_ROUTES.PRODUCTS}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  All products
                </Link>
              </li>
              <li>
                <Link
                  href="/categories"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Categories
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t py-5 text-center text-xs text-muted-foreground">
        Built with Next.js, Prisma &amp; Stripe. Demo storefront — no real
        orders are fulfilled.
      </div>
    </footer>
  );
};

export default Footer;
