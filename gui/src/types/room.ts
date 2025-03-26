// types/room.ts
export interface Room {
    id: string;
    name: string;
    userRooms: UserRoom[];
    messages: Message[];
    createdAt: Date;
    updatedAt: Date;
}

export interface UserRoom {
    id: string;
    userId: string;
    roomId: string;
    role: 'admin' | 'user';
    user: User;
}

export interface User {
    id: string;
    name: string | null;
    email: string | null;
}

export interface Message {
    id: string;
    content: string;
    senderId: string;
    roomId: string;
    createdAt: Date;
    sender: {
        id: string;
        name: string | null;
    };
}

export interface RoomWithUnread extends Room {
    unreadCount: number;
    lastMessage: Message | null;
}