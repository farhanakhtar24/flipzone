import { getUserById } from "@/actions/user.action";
import { auth } from "@/auth";
import React from "react";
import ProfileSettings from "./_components/ProfileSettings";

const page = async () => {
  const session = await auth();

  if (!session?.user?.id) {
    return <div>User not found</div>;
  }

  const user = await getUserById(session.user.id);

  if (!user) {
    return <div>User not found</div>;
  }

  console.log({ user });

  return (
    <div className="flex h-fit flex-col p-7">
      <ProfileSettings user={user} />
    </div>
  );
};

export default page;
