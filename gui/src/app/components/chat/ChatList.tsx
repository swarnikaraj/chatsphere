// src/components/chat/ChatList.tsx
'use client';

import { useEffect, useState } from 'react';
import { ChatMessage as ChatMessageComponent } from "./ChatMessage";
import { ChatMessage as ChatMessageType, WebSocketMessage } from '@/types/websocket';
import { useWebSocket } from '@/context/WebSocketContext';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import { ChatInput } from './ChatInput';
import { toast } from 'react-toastify';

export function ChatList() {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [loading, setLoading] = useState(true);
  const { ws } = useWebSocket();
  const { data: session } = useSession();
  const params = useParams();
  const roomId = params.id as string;

  const updateChatHistory = (newMessage: ChatMessageType) => {
    setMessages(prev => [...prev, newMessage]);
  };

  // src/components/chat/ChatList.tsx
useEffect(() => {
    async function fetchMessages() {
      try {
        const response = await fetch(`/api/messages?roomId=${roomId}`);
        if (!response.ok) throw new Error('Failed to fetch messages');
        const data = await response.json();
        setMessages(data.messages);
      } catch (error) {
        console.error('Failed to fetch messages:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchMessages();

    if (ws && session?.user?.id) {
      console.log('Setting up WebSocket for room:', roomId);
      
      // First identify the user
      ws.identify(session.user.id);
      
      // Then join the room
      if (!roomId) {
        toast.error("room Id not found")
        
      }
  console.log(roomId,"roomId")
      ws.joinRoom(roomId);
      
      const handleNewMessage = (data: WebSocketMessage) => {
        console.log('Received new message in ChatList:', data);
        if (data.type === 'new-message' && data.roomId === roomId && data.message) {
          console.log('Adding message to chat:', data.message);
          const newMessage: ChatMessageType = {
            id: data.message.id || Date.now().toString(),
            content: data.message.content,
            senderId: data.message.senderId,
            sender: data.message.sender,
            roomId: data.message.roomId,
            createdAt: new Date(data.message.createdAt)
          };
          
          setMessages(prev => {
            console.log('Previous messages:', prev);
            const updated = [...prev, newMessage];
            console.log('Updated messages:', updated);
            return updated;
          });
        }
      };

      console.log('Adding message handler for room:', roomId);
      ws.addEventListener('new-message', handleNewMessage);

      return () => {
        console.log('Removing message handler for room:', roomId);
        ws.removeEventListener('new-message', handleNewMessage);
      };
    }
  }, [roomId, ws, session]);

  if (loading) {
    return <ChatSkeleton />;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <ChatSkeleton />
        ) : (
          <div className="space-y-4">
            {messages.map(message => (
              <ChatMessageComponent
                key={message.id}
                sender={message.sender.name}
                content={message.content}
                timestamp={new Date(message.createdAt).toLocaleTimeString()}
                isCurrentUser={message.senderId === session?.user?.id}
                avatar={message.sender.name.split(' ').map(n => n[0]).join('')}
              />
            ))}
          </div>
        )}
      </div>
      <div className="border-t border-gray-200 p-4 bg-white">
        <ChatInput roomId={roomId} updateChatHistory={updateChatHistory} />
      </div>
    </div>
  );
}

function ChatSkeleton() {
  return (
    <div className="space-y-4 p-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
          <div className="flex items-start space-x-2">
            {i % 2 === 0 && (
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
            )}
            <div className="space-y-2">
              {i % 2 === 0 && (
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
              )}
              <div className="h-10 w-48 bg-gray-200 rounded-lg animate-pulse" />
              <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}