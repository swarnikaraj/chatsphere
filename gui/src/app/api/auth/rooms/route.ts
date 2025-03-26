// app/api/rooms/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import nodemailer from 'nodemailer';
import { Room, RoomWithUnread } from '@/types/room';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { name, userIds } = await req.json();

        // Create the room and add the creator as an admin
        const room = await prisma.room.create({
            data: {
                name,
                userRooms: {
                    create: {
                        userId: session.user.id,
                        role: 'admin',
                    },
                },
            },
        });

        // Create invitations for other users
        const invitations = await prisma.invitation.createMany({
            data: userIds.map((userId: string) => ({
                roomId: room.id,
                userId,
            })),
        });

        // Send email invitations
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        for (const userId of userIds) {
            const user = await prisma.user.findUnique({ where: { id: userId } });
            if (user?.email) {
                const invitationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invitation?roomId=${room.id}&invitationId=${userId}`;
                await transporter.sendMail({
                    from: process.env.EMAIL_USER,
                    to: user.email,
                    subject: 'You have been invited to join a chat room',
                    html: `
                        <p>You have been invited to join the chat room: <strong>${name}</strong>.</p>
                        <p>Click <a href="${invitationUrl}">here</a> to accept or reject the invitation.</p>
                    `,
                });
            }
        }

        return NextResponse.json({ room, invitations });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to create room' }, { status: 500 });
    }
}

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const rooms = await prisma.room.findMany({
            where: {
                userRooms: {
                    some: {
                        userId: session.user.id,
                    },
                },
            },
            include: {
                userRooms: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
                messages: {
                    take: 1,
                    orderBy: {
                        createdAt: 'desc',
                    },
                    include: {
                        sender: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
            },
        }) as Room[];

        const roomsWithUnread: RoomWithUnread[] = rooms.map(room => ({
            ...room,
            unreadCount: 0, // Implement later
            lastMessage: room.messages[0] || null,
        }));

        return NextResponse.json(roomsWithUnread);
    } catch (error) {
        console.error('Error fetching rooms:', error);
        return NextResponse.json({ error: 'Failed to fetch rooms' }, { status: 500 });
    }
}