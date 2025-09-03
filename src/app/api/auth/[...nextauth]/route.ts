import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/db";
import User from "@/lib/models/User";

interface UserData {
  id: string;
  email: string;
  name: string;
  subscription: {
    plan: "free" | "singles" | "couples" | "premium";
    status: "active" | "inactive" | "cancelled";
    startDate: Date;
    endDate: Date;
  };
  type?: "single" | "couple";
  attempts?: number;
  validity?: Date;
}

const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<UserData | null> {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          await connectToDatabase();
          const user = await User.findOne({ email: credentials.email }).exec();

          if (!user || !user.password) {
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            return null;
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            subscription: {
              plan: user.subscription.plan,
              status: user.subscription.status,
              startDate: user.subscription.startDate,
              endDate: user.subscription.endDate,
            },
            type: user.type || undefined,
            attempts: user.attempts || undefined,
            validity: user.validity || undefined,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt" as const,
  },
  callbacks: {
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.subscription = user.subscription;
        token.type = user.type;
        token.attempts = user.attempts;
        token.validity = user.validity;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (token && token.sub) {
        session.user.id = token.sub;
        if (token.subscription) {
          session.user.subscription = {
            plan: token.subscription.plan,
            status: token.subscription.status,
            startDate: new Date(token.subscription.startDate),
            endDate: new Date(token.subscription.endDate),
          };
        }
        if (token.type) session.user.type = token.type;
        if (token.attempts) session.user.attempts = token.attempts;
        if (token.validity) session.user.validity = new Date(token.validity);
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
