
// types/websocket.ts
export type WebSocketMessageType =
    | 'error'
    | 'message'
    | 'auth'
    | 'typing'
    | 'mark-read'
    | 'new-message'
    | 'chat-message'
    | 'join-room'
    | 'identify';




export interface ChatMessage {
    id?: string;
    content: string;
    senderId: string;
    sender: {
        id: string;
        name: string;
    };
    roomId: string;
    createdAt: Date;
}

// types/websocket.ts

export interface WebSocketMessage {
    type: WebSocketMessageType;
    roomId?: string;
    userId?: string;
    message?: ChatMessage;
    error?: string;
    isTyping?: boolean;
}

export type WebSocketEventCallback = (data: WebSocketMessage) => void;
export type MessageHandler = (data: WebSocketMessage) => void;


