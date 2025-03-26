// app/api/auth/get-face-id/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        const user = await prisma.user.findUnique({
            where: { email },
            select: { faceId: true }
        });

        if (!user || !user.faceId) {
            return NextResponse.json(
                { error: 'User not found or face ID not available' },
                { status: 404 }
            );
        }

        return NextResponse.json({ faceId: user.faceId });
    } catch (error) {
        console.error('Error fetching face ID:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}