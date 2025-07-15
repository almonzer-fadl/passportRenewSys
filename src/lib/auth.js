import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { User, AuditLog } from '@/models';
import connectDB from '@/lib/mongodb';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { 
          label: 'Email', 
          type: 'email',
          placeholder: 'your.email@example.com'
        },
        password: { 
          label: 'Password', 
          type: 'password' 
        }
      },
      async authorize(credentials, req) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error('Email and password are required');
          }

          await connectDB();

          // Find user with password field included
          const user = await User.findOne({ 
            email: credentials.email.toLowerCase() 
          }).select('+password');

          if (!user) {
            // Log failed login attempt
            await AuditLog.logSecurityEvent(
              'user_login_failed',
              `Failed login attempt for non-existent email: ${credentials.email}`,
              {
                ipAddress: req?.headers?.['x-forwarded-for'] || req?.headers?.['x-real-ip'] || 'unknown',
                userAgent: req?.headers?.['user-agent'] || 'unknown'
              },
              'medium',
              60
            );
            throw new Error('Invalid email or password');
          }

          // Check if account is locked
          if (user.isLocked) {
            await AuditLog.logSecurityEvent(
              'user_login_failed',
              `Login attempt on locked account: ${user.email}`,
              {
                ipAddress: req?.headers?.['x-forwarded-for'] || req?.headers?.['x-real-ip'] || 'unknown',
                userAgent: req?.headers?.['user-agent'] || 'unknown'
              },
              'high',
              80
            );
            throw new Error('Account is temporarily locked. Please try again later.');
          }

          // Check if account is active
          if (user.status !== 'active') {
            await AuditLog.logSecurityEvent(
              'user_login_failed',
              `Login attempt on inactive account: ${user.email}`,
              {
                ipAddress: req?.headers?.['x-forwarded-for'] || req?.headers?.['x-real-ip'] || 'unknown',
                userAgent: req?.headers?.['user-agent'] || 'unknown'
              },
              'medium',
              70
            );
            throw new Error(`Account is ${user.status}. Please contact support.`);
          }

          // Verify password
          const isPasswordValid = await user.comparePassword(credentials.password);

          if (!isPasswordValid) {
            // Increment login attempts
            await user.incLoginAttempts();
            
            await AuditLog.logSecurityEvent(
              'user_login_failed',
              `Invalid password for user: ${user.email}`,
              {
                ipAddress: req?.headers?.['x-forwarded-for'] || req?.headers?.['x-real-ip'] || 'unknown',
                userAgent: req?.headers?.['user-agent'] || 'unknown'
              },
              'medium',
              65
            );
            throw new Error('Invalid email or password');
          }

          // Reset login attempts on successful login
          if (user.loginAttempts > 0) {
            await user.resetLoginAttempts();
          }

          // Update last login
          user.lastLogin = new Date();
          await user.save();

          // Log successful login
          await AuditLog.logUserAction(
            'user_login',
            user._id,
            `User logged in successfully: ${user.email}`,
            {
              resourceType: 'user',
              resourceId: user._id.toString(),
              resourceName: user.fullName
            },
            {
              ipAddress: req?.headers?.['x-forwarded-for'] || req?.headers?.['x-real-ip'] || 'unknown',
              userAgent: req?.headers?.['user-agent'] || 'unknown'
            }
          );

          // Return user object for session
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.fullName,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            status: user.status,
            nationalId: user.nationalId,
            phoneNumber: user.phoneNumber,
            emailVerified: user.emailVerified,
            phoneVerified: user.phoneVerified,
            profileImage: user.profileImage?.path,
            twoFactorEnabled: user.twoFactorEnabled
          };

        } catch (error) {
          console.error('Authentication error:', error);
          throw new Error(error.message || 'Authentication failed');
        }
      }
    })
  ],
  
  session: {
    strategy: 'jwt',
    maxAge: parseInt(process.env.SESSION_TIMEOUT) || 3600, // 1 hour default
  },
  
  jwt: {
    secret: process.env.JWT_SECRET,
    maxAge: parseInt(process.env.SESSION_TIMEOUT) || 3600,
  },
  
  pages: {
    signIn: '/auth/login',
    signUp: '/auth/register',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
    newUser: '/dashboard'
  },
  
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        token.id = user.id;
        token.role = user.role;
        token.status = user.status;
        token.nationalId = user.nationalId;
        token.phoneNumber = user.phoneNumber;
        token.emailVerified = user.emailVerified;
        token.phoneVerified = user.phoneVerified;
        token.profileImage = user.profileImage;
        token.twoFactorEnabled = user.twoFactorEnabled;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
      }
      
      return token;
    },
    
    async session({ session, token }) {
      // Send properties to the client
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.status = token.status;
        session.user.nationalId = token.nationalId;
        session.user.phoneNumber = token.phoneNumber;
        session.user.emailVerified = token.emailVerified;
        session.user.phoneVerified = token.phoneVerified;
        session.user.profileImage = token.profileImage;
        session.user.twoFactorEnabled = token.twoFactorEnabled;
        session.user.firstName = token.firstName;
        session.user.lastName = token.lastName;
      }
      
      return session;
    },
    
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    }
  },
  
  events: {
    async signOut({ token }) {
      if (token?.id) {
        try {
          await connectDB();
          await AuditLog.logUserAction(
            'user_logout',
            token.id,
            `User logged out: ${token.email}`,
            {
              resourceType: 'user',
              resourceId: token.id,
              resourceName: token.name
            }
          );
        } catch (error) {
          console.error('Error logging signOut event:', error);
        }
      }
    }
  },
  
  debug: process.env.NODE_ENV === 'development',
  
  secret: process.env.NEXTAUTH_SECRET,
}; 