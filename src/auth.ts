import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';

const mockCredentials = [
  { email: 'priya.rajan@delhipublicschool.edu.in', password: 'Teacher@2026', name: 'Priya Rajan', role: 'teacher' },
  { email: 'arjun.sharma@delhipublicschool.edu.in', password: 'Student@2026', name: 'Arjun Sharma', role: 'student' },
  { email: 'admin@aiexaminerpro.in', password: 'Admin@2026', name: 'Admin', role: 'admin' },
];

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const user = mockCredentials.find(
          (c) => c.email === credentials?.email && c.password === credentials?.password
        );
        if (!user) return null;
        return { id: user.email, name: user.name, email: user.email, role: user.role };
      },
    }),
  ],
  pages: {
    signIn: '/',
    error: '/',
  },
  callbacks: {
    async session({ session, token }) {
      if (token?.role) (session.user as any).role = token.role;
      return session;
    },
    async jwt({ token, user }) {
      if (user) token.role = (user as any).role;
      return token;
    },
  },
  session: { strategy: 'jwt' },
});
