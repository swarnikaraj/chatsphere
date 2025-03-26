// types/index.ts
export interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
}



export interface Conversation {
    id: string;
    name: string;
    lastMessage: string;
    unread: number;
    participants: User[];
}




export interface Message {
    id: string;
    content: string;
    senderId: string;
    roomId: string;
    createdAt: Date;
    sender: {
        id: string;
        name: string;
    };
}

// types/index.ts
export interface User {
    id: string;
    name: string;
    email: string;
}

export interface ChatMessage {
    id?: string;
    content: string;
    senderId: string;
    roomId: string;
    createdAt: Date;
    sender: {
        id: string;
        name: string;
    };
}

export interface Room {
    id: string;
    name: string;
    lastMessage?: ChatMessage;
    unreadCount?: number;
    userRooms: {
        user: User;
        role: string;
    }[];
}

export interface WebSocketMessage {
    type: string;
    message?: ChatMessage;
    roomId?: string;
}