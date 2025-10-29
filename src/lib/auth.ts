import { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import prisma from '../../prisma/index';

// Extend the built-in session types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      fullName?: string | null;
      email?: string | null;
      role: string;
    };
  }

  interface User {
    id: string;
    fullName?: string | null;
    email?: string | null;
    role: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string;
    fullName?: string | null;
    email?: string | null;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user) {
          return null;
        }

        // Check if user has a password (for email/password users)
        if (!user.password) {
          return null;
        }

        const isPasswordValid = await compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          // Provide NextAuth's conventional name field for broader compatibility
          name: user.fullName ?? undefined,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        // Persist additional fields into the JWT so they are available in the session callback
        if ('fullName' in user) {
          token.fullName =
            (user as { fullName?: string | null }).fullName ??
            token.fullName ??
            null;
        }
        if ('email' in user) {
          token.email =
            (user as { email?: string | null }).email ?? token.email ?? null;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
        // Map custom fields from token back into the session
        session.user.fullName = token.fullName ?? null;
        session.user.email = token.email ?? session.user.email ?? null;
      }

      return session;
    },
  },
  pages: {
    signIn: '/signin',
  },
};
