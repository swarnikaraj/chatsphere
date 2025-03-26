// types/chat.ts
export interface Message {
    id: string;
    content: string;
    senderId: string;
    sender: {
        id: string;
        name: string;
    };
    roomId: string;
    createdAt: Date;
}

export interface Room {
    id: string;
    name: string;
    lastMessage?: string;
    updatedAt: Date;
}// types/chat.ts
export interface ChatDetails {
    id: string;
    name: string;
    participants: {
        user: {
            id: string;
            name: string;
            email: string;
            image: string | null;
        };
    }[];
}