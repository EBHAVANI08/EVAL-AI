import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { getDb } from '@/lib/mongodb';

export const { handlers, signIn, signOut, auth } = NextAuth({
  pages: { signIn: '/login', error: '/login' },
  session: { strategy: 'jwt' },
  trustHost: true,

  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: 'credentials',
      credentials: {
        email:    { label: 'Email',    type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // Dummy logins for testing
        const dummyUsers = [
          { email: 'admin@grade.ai',        password: 'admin123',     name: 'Super Admin', role: 'admin' },
          { email: 'teacher@grade.ai',       password: 'teacher123',   name: 'Bhavani',     role: 'teacher' },
          { email: 'student@grade.ai',       password: 'student123',   name: 'Aman Deep',   role: 'student', rollNo: 'S101' },
          { email: 'admin@kamglobalit.com',   password: 'Welcome@2026', name: 'Admin',       role: 'admin' },
          { email: 'teacher@kamglobalit.com', password: 'Welcome@2026', name: 'Teacher',     role: 'teacher' },
          { email: 'student@kamglobalit.com', password: 'Welcome@2026', name: 'Student',     role: 'student', rollNo: 'STU001' },
        ];

        const dummyMatch = dummyUsers.find(u => u.email === credentials.email && u.password === credentials.password);
        if (dummyMatch) {
          return {
            id:     dummyMatch.email,
            name:   dummyMatch.name,
            email:  dummyMatch.email,
            role:   dummyMatch.role,
            rollNo: dummyMatch.rollNo ?? null,
          };
        }

        try {
          const db = await getDb();
          const user = await db.collection('users').findOne({
            email:    credentials.email,
            password: credentials.password,
          });
          if (!user) return null;
          return {
            id:     user._id.toString(),
            name:   user.name,
            email:  user.email,
            role:   user.role,
            rollNo: user.rollNo ?? null,
          };
        } catch (err) {
          console.error('Credentials authorize error:', err);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google' && user.email) {
        try {
          const db = await getDb();
          await db.collection('users').updateOne(
            { email: user.email },
            {
              $setOnInsert: {
                name:      user.name ?? 'Teacher',
                email:     user.email,
                role:      'teacher',
                provider:  'google',
                createdAt: new Date(),
              },
            },
            { upsert: true }
          );
        } catch (err) {
          console.error('Google signIn DB save error:', err);
        }
      }
      return true;
    },

    async jwt({ token, user, account }) {
      // Base: set role/rollNo from user on sign-in
      if (user) {
        token.role   = (user as any).role   ?? null;
        token.rollNo = (user as any).rollNo ?? null;
      }
      // Google: fetch stored role from MongoDB (may have been updated by admin)
      if (account?.provider === 'google' && token.email) {
        try {
          const db = await getDb();
          const dbUser = await db.collection('users').findOne({ email: token.email });
          if (dbUser) {
            token.role   = dbUser.role;
            token.rollNo = dbUser.rollNo ?? null;
          }
        } catch { /* non-fatal */ }
      }
      return token;
    },

    async session({ session, token }) {
      if (token.role)   (session.user as any).role   = token.role;
      if (token.rollNo) (session.user as any).rollNo = token.rollNo;
      return session;
    },
  },
});
