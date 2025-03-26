


import { NextAuthOptions, Session, DefaultSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import prisma from '@/lib/prisma';



// Extend the built-in session type
interface CustomSession extends Session {
    user: {
        id: string;
        email: string;
        name: string;
        faceId?: string;
        image?: string | null;
    } & DefaultSession['user'];
}

// Define custom user type
interface CustomUser {
    id: string;
    email: string;
    name: string;
    faceId?: string;
    image?: string | null;
}

// Extend JWT type
// interface CustomJWT extends JWT {
//     id?: string;
//     email?: string;
//     name?: string;
//     faceId?: string;
//     image?: string | null;
// }

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'text' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials): Promise<CustomUser | null> {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Email and password required');
                }

                const user = await prisma.user.findUnique({
                    where: {
                        email: credentials.email,
                    },
                });

                if (!user) {
                    throw new Error('Email not found');
                }

                const isPasswordValid = await compare(credentials.password, user.password);

                if (!isPasswordValid) {
                    throw new Error('Invalid password');
                }
                const cleanS3Key = user.s3Key?.startsWith('faces/')
                    ? user.s3Key
                    : user.s3Key
                        ? `faces/${user.s3Key}`
                        : null;
                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    faceId: user.faceId || undefined,
                    image: cleanS3Key
                        ? `https://chatsphere-face-recognition.s3.us-east-1.amazonaws.com/${cleanS3Key}`
                        : null,


                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.email = user.email;
                token.name = user.name;
                token.faceId = (user as CustomUser).faceId;
                token.image = user.image;
            }
            return token;
        },
        async session({ session, token }): Promise<CustomSession> {
            return {
                ...session,
                user: {
                    ...session.user,
                    id: token.id as string,
                    email: token.email as string,
                    name: token.name as string,
                    faceId: token.faceId,
                    image: token.image as string | null,
                },
            };
        },
    },
    pages: {
        signIn: '/login',
    },
    session: {
        strategy: 'jwt',
    },
    secret: process.env.NEXTAUTH_SECRET,
};



