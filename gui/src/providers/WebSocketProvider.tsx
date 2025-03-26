// src/providers/WebSocketProvider.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { WebSocketContext } from '@/context/WebSocketContext';
import { WebSocketService } from '@/lib/socket';
import { useSession } from 'next-auth/react';

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ws, setWs] = useState<WebSocketService | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user?.id) {
      const wsService = new WebSocketService(session.user.id);
      
      wsService.onConnectionChange = (connected: boolean) => {
        setIsConnected(connected);
      };

      wsService.connect();
      setWs(wsService);

      return () => {
        wsService.disconnect();
      };
    }
  }, [session?.user?.id]);

  return (
    <WebSocketContext.Provider value={{ ws, isConnected }}>
      {children}
    </WebSocketContext.Provider>
  );
};