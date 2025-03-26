// components/chat/Sidebar.tsx
'use client';

import Link from 'next/link';
import { Button } from '../ui/Button';
import { CreateGroupModal } from './CreateGroupModel';
import { useState, useEffect, useRef } from 'react';
import { UserAvatar } from './UserAvatar';
import { useSession } from 'next-auth/react';
import { Room, WebSocketMessage } from '@/types';
import { WebSocketService } from '@/lib/socket';

export function Sidebar() {
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session, status } = useSession();
  const wsRef = useRef<WebSocketService | null>(null);

  useEffect(() => {
    if (session?.user?.id) {
      if (!wsRef.current) {
        wsRef.current = new WebSocketService(session.user.id);
        wsRef.current.connect();

        wsRef.current.addEventListener('message', (data: WebSocketMessage) => {
          if (data.type === 'new-message' && data.message && data.roomId) {
            setRooms((prevRooms) => {
              return prevRooms.map((room) => {
                if (room.id === data.roomId) {
                  return {
                    ...room,
                    lastMessage: data.message,
                    unreadCount: (room.unreadCount || 0) + 1,
                  };
                }
                return room;
              });
            });
          }
        });
      }

      return () => {
        if (wsRef.current) {
          wsRef.current.disconnect();
          wsRef.current = null;
        }
      };
    }
  }, [session?.user?.id]);

  const fetchRooms = async () => {
    try {
      const response = await fetch('/api/auth/rooms');
      if (!response.ok) throw new Error('Failed to fetch rooms');
      const data: Room[] = await response.json();
      setRooms(data);
      
      if (wsRef.current) {
        data.forEach(room => {
          wsRef.current?.joinRoom(room.id);
        });
      }
    } catch (error) {
      console.log('Error fetching rooms:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchRooms();
    }
  }, [status]);

  const handleGroupCreated = async () => {
    await fetchRooms();
    setIsGroupModalOpen(false);
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="w-64 bg-white border-r border-gray-200 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <>
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col text-gray-700">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Chats</h2>
        </div>
        
        <div className="p-4">
          <Button 
            variant="primary" 
            className="w-full"
            onClick={() => setIsGroupModalOpen(true)}
          >
            Create Group
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <nav className="p-2 space-y-1">
            {rooms.map((room) => (
              <Link
                key={room.id}
                href={`/chat/${room.id}`}
                className="flex items-center p-2 rounded-lg hover:bg-gray-100 transition-colors group"
                onClick={() => {
                  wsRef.current?.send({
                    type: 'mark-read',
                    roomId: room.id
                  });
                }}
              >
                <div className="flex-shrink-0">
                  <UserAvatar name={room.name} />
                </div>
                <div className="ml-3 flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {room.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {room.lastMessage ? (
                      <>
                        <span className="font-medium">{room.lastMessage.sender.name}: </span>
                        {room.lastMessage.content}
                      </>
                    ) : (
                      'No messages yet'
                    )}
                  </p>
                </div>
                {room && room.unreadCount && room.unreadCount > 0 && (
                  <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-indigo-600 rounded-full">
                    {room.unreadCount}
                  </span>
                )}
              </Link>
            ))}
          </nav>
        </div>
        
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center">
            <UserAvatar name={session?.user?.name || 'User'} />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">
                {session?.user?.name}
              </p>
              <p className="text-xs text-gray-500">Online</p>
            </div>
          </div>
        </div>
      </div>
      
      <CreateGroupModal 
        isOpen={isGroupModalOpen} 
        onClose={() => setIsGroupModalOpen(false)}
        onGroupCreated={handleGroupCreated}
      />
    </>
  );
}