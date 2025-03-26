// app/api/chats/[chatId]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";





export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const chatId = url.searchParams.get("chatId");

        if (!chatId) {
            return NextResponse.json(
                { error: "Chat ID is required" },
                { status: 400 }
            );
        }

        const room = await prisma.room.findUnique({
            where: { id: chatId },
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
            },
        });

        if (!room) {
            return NextResponse.json(
                { error: "Chat room not found" },
                { status: 404 }
            );
        }

        // Transform the data to match the ChatDetails interface
        const chatDetails = {
            id: room.id,
            name: room.name,
            participants: room.userRooms.map((ur: { user: { id: string; name: string; email: string; }; }) => ({
                user: {
                    id: ur.user.id,
                    name: ur.user.name,
                    email: ur.user.email,
                    image: null // Add this if you add image field to User model
                }
            }))
        };

        return NextResponse.json(chatDetails);
    } catch (error) {
        console.log("Error fetching chat:", error);
        return NextResponse.json(
            { error: "Failed to fetch chat details" },
            { status: 500 }
        );
    }
}