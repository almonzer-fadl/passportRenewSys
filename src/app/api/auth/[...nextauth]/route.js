import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import dbConnect from '@/lib/db';
import User from '@/models/user';
import bcrypt from 'bcryptjs';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text" },
        password: {  label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          await dbConnect();

          const user = await User.findOne({ email: credentials.email });
          if (!user) {
            throw new Error('No user found with this email');
          }

          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (!isValid) {
            throw new Error('Invalid password');
          }

          return {
            id: user._id.toString(),
            name: user.name, // This will use the virtual property
            email: user.email,
            role: user.role,
            firstName: user.profile.firstName,
            lastName: user.profile.lastName
          };
        } catch (error) {
          console.error('Auth error:', error);
          throw new Error(error.message || 'Authentication failed');
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.firstName = token.firstName;
      session.user.lastName = token.lastName;
      return session;
    },
  },
  pages: {
    signIn: '/auth/login',
    signUp: '/auth/register',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
