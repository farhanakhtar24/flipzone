import { getUserAddresses } from "@/actions/address.action";
import { getUserOrders } from "@/actions/order.action";
import { getWishlistByUserId } from "@/actions/wishlist.action";
import { getUserById } from "@/actions/user.action";
import { auth } from "@/auth";
import React from "react";
import ProfileSettings from "./_components/ProfileSettings";
import AddressBook from "./_components/AddressBook";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MapPin, Package, CalendarDays } from "lucide-react";
import { timeFormatter } from "@/util/helper";

export const dynamic = "force-dynamic";

const page = async () => {
  const session = await auth();

  if (!session?.user?.id) {
    return <div>User not found</div>;
  }

  const [user, addressesRes, ordersRes, wishlistRes] = await Promise.all([
    getUserById(session.user.id),
    getUserAddresses(),
    getUserOrders(),
    getWishlistByUserId(),
  ]);

  if (!user) {
    return <div>User not found</div>;
  }

  const addresses = addressesRes.data ?? [];
  const orders = ordersRes.data ?? [];
  const wishlistCount = wishlistRes.data?.items.length ?? 0;
  const initials = (user.name ?? user.email)
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const stats = [
    { icon: Package, label: "Orders", value: orders.length },
    { icon: Heart, label: "Wishlist", value: wishlistCount },
    { icon: MapPin, label: "Addresses", value: addresses.length },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Account header */}
      <div className="bg-card flex flex-wrap items-center gap-5 rounded-xl border p-6">
        <Avatar className="h-16 w-16">
          <AvatarImage src={user.image ?? undefined} />
          <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-bold tracking-tight">
            {user.name ?? "My account"}
          </h1>
          <p className="text-muted-foreground flex items-center gap-1.5 text-sm">
            <CalendarDays className="h-3.5 w-3.5" />
            Member since {timeFormatter(user.createdAt).split(" at ")[0]}
          </p>
        </div>
        <div className="flex gap-6">
          {stats.map(({ icon: Icon, label, value }) => (
            <div key={label} className="text-center">
              <div className="flex items-center justify-center gap-1.5">
                <Icon className="text-primary h-4 w-4" />
                <span className="text-2xl font-bold">{value}</span>
              </div>
              <p className="text-muted-foreground text-xs">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-xl border p-6">
        <h2 className="mb-6 text-lg font-semibold">Profile details</h2>
        <ProfileSettings user={user} />
      </div>

      <div className="bg-card rounded-xl border p-6">
        <AddressBook addresses={addresses} />
      </div>
    </div>
  );
};

export default page;
