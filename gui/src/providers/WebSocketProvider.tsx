// src/providers/WebSocketProvider.tsx
'use client';

import { ReactNode, useEffect, useState } from 'react';
import { WebSocketContext } from '@/context/WebSocketContext';
import { WebSocketService } from '@/lib/socket';
import { useSession } from 'next-auth/react';

interface WebSocketProviderProps {
  children: ReactNode;
}

export function WebSocketProvider({ children }: WebSocketProviderProps) {
  const { data: session, status } = useSession();
  const [wsState, setWsState] = useState<{
    ws: WebSocketService | null;
    isConnected: boolean;
  }>({
    ws: null,
    isConnected: false,
  });

  useEffect(() => {
    let wsService: WebSocketService | null = null;

    if (status === 'authenticated' && session?.user?.id) {
      wsService = new WebSocketService(session.user.id);
      wsService.connect();
      
      setWsState({
        ws: wsService,
        isConnected: true,
      });
    }

    return () => {
      if (wsService) {
        wsService.disconnect();
        setWsState({
          ws: null,
          isConnected: false,
        });
      }
    };
  }, [session?.user?.id, status]);

  return (
    <WebSocketContext.Provider value={wsState}>
      {children}
    </WebSocketContext.Provider>
  );
}