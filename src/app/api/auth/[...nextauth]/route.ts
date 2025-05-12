import NextAuth, { NextAuthOptions, User as NextAuthUser } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { JWT } from 'next-auth/jwt';
import bcrypt from 'bcrypt';
import User from '@/models/User';
// import { connectToDB } from '@/lib/mongodb';

// Define custom types to extend NextAuth types
interface CustomUser extends NextAuthUser {
  role?: string;
  name?: string;
}

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      email?: string;
      role?: string;
      name?: string;
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
  }
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        
        // Connect to database
        // await connectToDB();
        
        const user = await User.findOne({ email: credentials.email });
        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;

        return {
          id: user._id.toString(),
          email: user.email,
          role: user.role,
          name: user.name,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        console.log("🚀 ~ jwt ~ user:", user)
        token.role = (user as CustomUser).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      console.log("🚀 ~ session ~ session:", session)
      if (token) {
        console.log("🚀 ~ session ~ token:", token)
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
