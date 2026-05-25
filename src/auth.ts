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
          {
            email: 'admin@grade.ai', password: 'admin123',
            name: 'Super Admin', role: 'admin',
          },
          {
            email: 'teacher@grade.ai', password: 'teacher123',
            name: 'Bhavani', role: 'teacher',
            school: 'Grade AI School',
          },
          {
            email: 'student@grade.ai', password: 'student123',
            name: 'Aman Deep', role: 'student',
            rollNo: 'S101', studentClass: 'Class 10',
            school: 'Grade AI School',
          },
          {
            email: 'admin@kamglobalit.com', password: 'Welcome@2026',
            name: 'KAM Admin', role: 'admin',
            school: 'KAM Global IT',
          },
          {
            email: 'teacher@kamglobalit.com', password: 'Welcome@2026',
            name: 'KAM Teacher', role: 'teacher',
            school: 'KAM Global IT',
          },
          {
            email: 'student@kamglobalit.com', password: 'Welcome@2026',
            name: 'KAM Student', role: 'student',
            rollNo: 'KAM2026001', studentClass: 'Class 12',
            school: 'KAM Global IT',
          },
        ];

        const dummyMatch = dummyUsers.find(
          (u) => u.email === credentials.email && u.password === credentials.password,
        );
        if (dummyMatch) {
          return {
            id:           dummyMatch.email,
            name:         dummyMatch.name,
            email:        dummyMatch.email,
            role:         dummyMatch.role,
            rollNo:       (dummyMatch as any).rollNo       ?? null,
            studentClass: (dummyMatch as any).studentClass ?? null,
            school:       (dummyMatch as any).school       ?? null,
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
            id:           user._id.toString(),
            name:         user.name,
            email:        user.email,
            role:         user.role,
            rollNo:       user.rollNo       ?? null,
            studentClass: user.studentClass ?? null,
            school:       user.school       ?? null,
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
            { upsert: true },
          );
        } catch (err) {
          console.error('Google signIn DB save error:', err);
        }
      }
      return true;
    },

    async jwt({ token, user, account }) {
      if (user) {
        token.role         = (user as any).role         ?? null;
        token.rollNo       = (user as any).rollNo       ?? null;
        token.studentClass = (user as any).studentClass ?? null;
        token.school       = (user as any).school       ?? null;
      }
      // Google: fetch stored role from MongoDB
      if (account?.provider === 'google' && token.email) {
        try {
          const db = await getDb();
          const dbUser = await db.collection('users').findOne({ email: token.email });
          if (dbUser) {
            token.role         = dbUser.role;
            token.rollNo       = dbUser.rollNo       ?? null;
            token.studentClass = dbUser.studentClass ?? null;
            token.school       = dbUser.school       ?? null;
          }
        } catch { /* non-fatal */ }
      }
      return token;
    },

    async session({ session, token }) {
      const u = session.user as any;
      if (token.role)         u.role         = token.role;
      if (token.rollNo)       u.rollNo       = token.rollNo;
      if (token.studentClass) u.studentClass = token.studentClass;
      if (token.school)       u.school       = token.school;
      return session;
    },
  },
});
