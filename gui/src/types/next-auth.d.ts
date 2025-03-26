// types/next-auth.d.ts
import 'next-auth';
import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
            email: string;
            name: string;
            faceId?: string;
        } & DefaultSession['user'];
    }

    interface User {
        id: string;
        email: string;
        name: string;
        faceId?: string;
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string;
        email: string;
        name: string;
        faceId?: string;
    }
}