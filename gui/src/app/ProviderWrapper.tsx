// app/ProviderWrapper.tsx
'use client';

import React from 'react';
import { SessionProvider } from "next-auth/react";
import { WebSocketProvider } from '@/providers/WebSocketProvider';

const ProviderWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <SessionProvider>
      <WebSocketProvider>
        {children}
      </WebSocketProvider>
    </SessionProvider>
  );
};

export default ProviderWrapper;