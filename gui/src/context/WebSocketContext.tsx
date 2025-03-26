// src/context/WebSocketContext.tsx
'use client';

import { createContext, useContext } from 'react';
import { WebSocketService } from '@/lib/socket';

interface WebSocketContextType {
  ws: WebSocketService | null;
  isConnected: boolean;
}

export const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};