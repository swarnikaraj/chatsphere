

import ChatHeader from '@/app/components/chat/ChatHeader';
import { Sidebar } from '@/app/components/chat/Sidebar';

import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import MobileMenu from '@/app/components/chat/MobileSidebar';
export default function ChatPage() {
   
 

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="hidden lg:block ">
          <Sidebar />
        </div>
      <MobileMenu />
      <div className="flex flex-col flex-1 overflow-hidden">
        <ChatHeader />
        
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">
              Welcome to Chat
            </h2>
            <p className="text-gray-500">
              Select a chat from the sidebar to start messaging
            </p>
            <div className="mt-8">
              <div className="animate-bounce">
                <svg
                  className="w-8 h-8 text-gray-400 mx-auto"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M7 11l5-5m0 0l5 5m-5-5v12"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
}