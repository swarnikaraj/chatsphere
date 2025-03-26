// src/lib/socket.ts
import { WebSocketMessage, ChatMessage, MessageHandler } from '@/types/websocket';
import { WebSocketMessageType } from '@/types/websocket';
export class WebSocketService {
    private ws: WebSocket | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectTimeout: NodeJS.Timeout | null = null;
    private messageHandlers: Map<string, Set<MessageHandler>> = new Map();

    constructor(private userId: string) { }

    connect(): void {
        if (this.ws?.readyState === WebSocket.OPEN) return;

        const wsUrl = process.env.NEXT_PUBLIC_WS_URL ||
            `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.hostname}:8080`;

        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
            console.log('Connected to WebSocket');
            this.reconnectAttempts = 0;
            this.identify();
        };

        this.ws.onmessage = (event: MessageEvent) => {
            try {
                const data = JSON.parse(event.data) as WebSocketMessage;
                this.handleMessage(data);
            } catch (error) {
                console.error('Error parsing message:', error);
            }
        };

        this.ws.onclose = () => {
            console.log('WebSocket connection closed');
            this.handleReconnect();
        };

        this.ws.onerror = (error: Event) => {
            console.error('WebSocket error:', error);
        };
    }

    private handleReconnect(): void {
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
        }

        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            this.reconnectTimeout = setTimeout(() => {
                console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
                this.connect();
            }, 1000 * Math.pow(2, this.reconnectAttempts));
        }
    }

    identify(): void {
        this.send({
            type: 'identify',
            userId: this.userId
        });
    }

    joinRoom(roomId: string): void {
        this.send({
            type: 'join-room',
            roomId
        });
    }

    sendMessage(roomId: string, message: ChatMessage): void {
        this.send({
            type: 'chat-message',
            roomId,
            message
        });
    }

    send(data: WebSocketMessage): void {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data));
        } else {
            console.warn('WebSocket is not connected. Message not sent:', data);
        }
    }

    addEventListener(type: WebSocketMessageType, handler: MessageHandler): void {
        if (!this.messageHandlers.has(type)) {
            this.messageHandlers.set(type, new Set());
        }
        this.messageHandlers.get(type)?.add(handler);
    }

    removeEventListener(type: WebSocketMessageType, handler: MessageHandler): void {
        this.messageHandlers.get(type)?.delete(handler);
    }

    private handleMessage(data: WebSocketMessage): void {
        const handlers = this.messageHandlers.get(data.type);
        if (handlers) {
            handlers.forEach(handler => handler(data));
        }
    }

    disconnect(): void {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
        }
        this.messageHandlers.clear();
    }

    isConnected(): boolean {
        return this.ws?.readyState === WebSocket.OPEN;
    }
}