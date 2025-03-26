// app/(main)/chat/[id]/page.tsx
'use client';

import { Sidebar } from '@/app/components/chat/Sidebar';
import { ChatList } from '@/app/components/chat/ChatList';
import ChatHeader from '@/app/components/chat/ChatHeader';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import MobileMenu from '@/app/components/chat/MobileSidebar';

export default function ChatPage() {
  const params = useParams();
  const chatId = params.id as string;
  const { status } = useSession();
  const router = useRouter();

  // Handle authentication in useEffect
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Show loading state
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Don't render anything if not authenticated
  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="hidden lg:block ">
          <Sidebar />
        </div>

     <MobileMenu />
      <div className="flex flex-col flex-1">
        <ChatHeader chatId={chatId} />
        <div className="flex-1 overflow-hidden">
          <ChatList />
        </div>
      </div>
      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
}