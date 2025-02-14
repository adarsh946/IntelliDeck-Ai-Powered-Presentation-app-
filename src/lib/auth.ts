import GoogleProvider from "next-auth/providers/google";
import CredentialProvider from "next-auth/providers/credentials";
import { NextAuthOptions } from "next-auth";
import { prisma } from "./db";
import bcrypt from "bcryptjs";

export const AuthOption: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.CLIENT_ID!,
      clientSecret: process.env.CLIENT_SECRET!,
    }),
    CredentialProvider({
      name: "Credentials",
      credentials: {
        email: { placeholder: "Email Address", type: "text", label: "Email" },
        password: {
          type: "text",
          label: "Password",
          placeholder: "Enter your Password",
        },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          throw new Error("credentials not found!");
        }

        try {
          const user = await prisma.user.findFirst({
            where: {
              email: credentials.email,
            },
          });

          if (!user) {
            throw new Error("User not found");
          }

          const isValid = bcrypt.compare(credentials.password, user.password);

          if (!isValid) {
            throw new Error("Invalid User");
          }

          return {
            id: user.id.toString(),
            email: user.email,
          };
        } catch (error) {
          console.error(error);
          throw new Error("Authentication failed!");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET!,
};
