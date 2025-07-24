import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Demo authentication - in production, this would check against database
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Demo users for testing
        const demoUsers = [
          {
            id: '1',
            email: 'demo@passport.gov.sd',
            password: 'demo123',
            firstName: 'Demo',
            lastName: 'User',
            role: 'user'
          },
          {
            id: '2',
            email: 'admin@passport.gov.sd',
            password: 'admin123',
            firstName: 'Admin',
            lastName: 'User',
            role: 'admin'
          }
        ];

        const user = demoUsers.find(u => 
          u.email === credentials.email && u.password === credentials.password
        );

        if (user) {
          return {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role
          };
        }

        return null;
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
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.firstName = token.firstName;
        session.user.lastName = token.lastName;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/login',
    signUp: '/auth/register',
  },
  secret: process.env.NEXTAUTH_SECRET || 'demo-secret-key-for-development-only',
  debug: process.env.NODE_ENV === 'development',
}; 