// app/api/auth/messages/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ChatMessage } from '@/types/websocket';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
    try {
        // Extract the roomId from the query parameters
        const { searchParams } = new URL(request.url);
        const roomId = searchParams.get('roomId');

        if (!roomId) {
            return NextResponse.json({ error: 'roomId is required' }, { status: 400 });
        }

        // Fetch all messages for the given roomId
        const messages = await prisma.message.findMany({
            where: {
                roomId,
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'asc',
            },
        });

        // Format the messages to match the ChatMessage type
        const formattedMessages: ChatMessage[] = messages.map((message: ChatMessage) => ({
            id: message.id,
            content: message.content,
            senderId: message.senderId,
            sender: {
                id: message.sender.id,
                name: message.sender.name || 'Unknown',
            },
            roomId: message.roomId,
            createdAt: message.createdAt,
        }));

        return NextResponse.json({ messages: formattedMessages });
    } catch (error) {
        console.error('Failed to fetch messages:', error);
        return NextResponse.json(
            { error: 'Failed to fetch messages' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { content, roomId } = await request.json();

        if (!content || !roomId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const message = await prisma.message.create({
            data: {
                content,
                senderId: session.user.id,
                roomId,
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        return NextResponse.json({ message });
    } catch (error) {
        console.error('Failed to create message:', error);
        return NextResponse.json({ error: 'Failed to create message' }, { status: 500 });
    }
}