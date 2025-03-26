// types/message.ts
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

export interface FormattedMessage {
    id: string;
    content: string;
    senderId: string;
    senderName: string | null;
    createdAt: Date;
}