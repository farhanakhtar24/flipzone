import { getUserAddresses } from "@/actions/address.action";
import { getUserById } from "@/actions/user.action";
import { auth } from "@/auth";
import React from "react";
import ProfileSettings from "./_components/ProfileSettings";
import AddressBook from "./_components/AddressBook";

export const dynamic = "force-dynamic";

const page = async () => {
  const session = await auth();

  if (!session?.user?.id) {
    return <div>User not found</div>;
  }

  const [user, { data: addresses }] = await Promise.all([
    getUserById(session.user.id),
    getUserAddresses(),
  ]);

  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <div className="flex h-fit flex-col gap-10 p-7">
      <ProfileSettings user={user} />
      <AddressBook addresses={addresses ?? []} />
    </div>
  );
};

export default page;
