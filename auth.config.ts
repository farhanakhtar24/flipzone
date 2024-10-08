import Github from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getUserByEmail } from "@/actions/get/getUserByEmail.action";
import type { NextAuthConfig } from "next-auth";

export default {
  providers: [
    Github({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
        },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials || !credentials.email || !credentials.password) {
          return null;
        }

        const email = credentials.email as string;

        const user = await getUserByEmail(email);

        if (!user) {
          throw new Error("No user found.");
        }

        const isMatch = bcrypt.compareSync(
          credentials.password as string,
          user?.password as string,
        );

        if (!isMatch) {
          throw new Error("Incorrect password");
        }

        return user;
      },
    }),
  ],
} satisfies NextAuthConfig;
