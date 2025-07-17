import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { User } from '../models/User.js';
import { createAuditLog } from './auditLog.js';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials, req) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null;
          }

          // Find user by email
          const user = User.findByEmail(credentials.email);
          
          if (!user) {
            console.log('User not found:', credentials.email);
            return null;
          }

          // Verify password
          const isValidPassword = await User.verifyPassword(user, credentials.password);
          
          if (!isValidPassword) {
            console.log('Invalid password for user:', credentials.email);
            
            // Log failed login attempt
            await createAuditLog({
              userId: user.id,
              action: 'LOGIN_FAILED',
              resourceType: 'authentication',
              ipAddress: req.headers['x-forwarded-for'] || req.connection?.remoteAddress,
              userAgent: req.headers['user-agent'],
              details: { email: credentials.email, reason: 'invalid_password' }
            });
            
            return null;
          }

          // Log successful login
          await createAuditLog({
            userId: user.id,
            action: 'LOGIN_SUCCESS',
            resourceType: 'authentication',
            ipAddress: req.headers['x-forwarded-for'] || req.connection?.remoteAddress,
            userAgent: req.headers['user-agent'],
            details: { email: credentials.email }
          });

          // Return user object (without password)
          const { password, ...userWithoutPassword } = user;
          return {
            id: user.id,
            email: user.email,
            name: `${user.firstName} ${user.lastName}`,
            firstName: user.firstName,
            lastName: user.lastName,
            nationalId: user.nationalId
          };

        } catch (error) {
          console.error('Authentication error:', error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  jwt: {
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.nationalId = user.nationalId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.firstName = token.firstName;
        session.user.lastName = token.lastName;
        session.user.nationalId = token.nationalId;
      }
      return session;
    },
    async signIn({ user, account, profile, email, credentials }) {
      // Allow sign in
      return true;
    },
    async redirect({ url, baseUrl }) {
      // If the url is just the base URL, redirect to dashboard
      if (url === baseUrl) {
        return `${baseUrl}/dashboard`;
      }
      
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return `${baseUrl}/dashboard`;
    }
  },
  pages: {
    signIn: '/auth/login',
    signUp: '/auth/register',
    error: '/auth/error',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};

// Helper function to get current user from session
export async function getCurrentUser(req) {
  try {
    const session = await getServerSession(req, authOptions);
    return session?.user || null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

// Helper function to protect API routes
export function withAuth(handler) {
  return async (req, res) => {
    try {
      const user = await getCurrentUser(req);
      
      if (!user) {
        return res.status(401).json({ 
          error: 'Authentication required',
          code: 'UNAUTHORIZED' 
        });
      }

      // Add user to request object
      req.user = user;
      
      return handler(req, res);
    } catch (error) {
      console.error('Auth middleware error:', error);
      return res.status(500).json({ 
        error: 'Authentication error',
        code: 'AUTH_ERROR' 
      });
    }
  };
}

// Helper function to protect admin routes
export function withAdminAuth(handler) {
  return async (req, res) => {
    try {
      const user = await getCurrentUser(req);
      
      if (!user) {
        return res.status(401).json({ 
          error: 'Authentication required',
          code: 'UNAUTHORIZED' 
        });
      }

      // Check if user is admin (you can implement admin role logic here)
      // For now, we'll use a simple email check or add admin field to user model
      const fullUser = User.findById(user.id);
      if (!fullUser || !isAdminUser(fullUser)) {
        return res.status(403).json({ 
          error: 'Admin access required',
          code: 'FORBIDDEN' 
        });
      }

      // Add user to request object
      req.user = user;
      
      return handler(req, res);
    } catch (error) {
      console.error('Admin auth middleware error:', error);
      return res.status(500).json({ 
        error: 'Authentication error',
        code: 'AUTH_ERROR' 
      });
    }
  };
}

// Helper function to check if user is admin
function isAdminUser(user) {
  // You can implement your admin logic here
  // For example, check if email ends with @passport.gov.sd
  return user.email.endsWith('@passport.gov.sd');
}

export default NextAuth(authOptions); 