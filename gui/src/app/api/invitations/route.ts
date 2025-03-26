
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const invitationId = searchParams.get('invitationId');

        if (!invitationId) {
            return NextResponse.json({ error: 'Invitation ID is required' }, { status: 400 });
        }

        const { status } = await request.json(); // "accepted" or "rejected"

        if (!['accepted', 'rejected'].includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        const invitation = await prisma.invitation.findFirst({
            where: {
                userId: invitationId,
                status: 'pending'
            },
        });

        if (!invitation) {
            return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
        }

        if (status === 'accepted') {
            // Check if user is already in the room
            const existingUserRoom = await prisma.userRoom.findFirst({
                where: {
                    userId: invitationId,
                    roomId: invitation.roomId,
                },
            });

            if (!existingUserRoom) {
                // Add the user to the room only if they're not already in it
                await prisma.userRoom.create({
                    data: {
                        userId: invitationId,
                        roomId: invitation.roomId,
                        role: 'user',
                    },
                });
            }
        }

        // Update the invitation status
        await prisma.invitation.update({
            where: { id: invitation.id },
            data: { status },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error updating invitation:', error.message);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        console.error('Unknown error:', error);
        return NextResponse.json({ error: 'Failed to update invitation' }, { status: 500 });
    }
}