// components/chat/ChatHeader.tsx
'use client';

import { UserAvatar } from "./UserAvatar";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import {  useRouter } from "next/navigation";
import { toast } from "react-toastify";

interface ChatDetails {
    id: string;
    name: string;
    participants: {
        user: {
            id: string;
            name: string;
            email: string;
            image: string | null;
        };
    }[];
}

interface ChatHeaderProps {
    chatId?: string;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ chatId }) => {
  const { data: session } = useSession();
 
  
    const router = useRouter();
    const [chatDetails, setChatDetails] = useState<ChatDetails | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchChatDetails = async () => {
            if (!chatId) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const response = await fetch(`/api/chat?chatId=${chatId}`);
                
                if (!response.ok) {
                    const errorData = await response.json();
                    if (response.status === 404) {
                        toast.error("Chat room not found");
                        router.push('/chat');
                        return;
                    }
                    throw new Error(errorData.error || "Failed to fetch chat details");
                }

                const data = await response.json();
                setChatDetails(data);
            } catch (error) {
                console.log("Error fetching chat details:", error);
                toast.error(error instanceof Error ? error.message : "Failed to load chat details");
            } finally {
                setLoading(false);
            }
        };

        fetchChatDetails();
    }, [chatId, router]);

  const renderChatInfo = () => {
    if (loading) {
      return (
        <div className="animate-pulse">
          <div className="h-6 w-32 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 w-24 bg-gray-200 rounded"></div>
        </div>
      );
    }

    if (chatId && chatDetails) {
      return (
        <>
          <h3 className="text-lg font-medium">{chatDetails.name}</h3>
          <p className="text-sm text-gray-500">
            {chatDetails.participants.length} participants
          </p>
        </>
      );
    }

    return (
      <>
        <h3 className="text-lg font-medium">General Chat</h3>
        <p className="text-sm text-gray-500">Public Room</p>
      </>
    );
  };

  return (
    <div className="border-b border-gray-200 p-4 flex items-center justify-between text-gray-700">
      {/* Left side - Chat info */}
      <div className="flex items-center">
        <UserAvatar 
          name={chatDetails?.name || "General Chat"} 
        />
        <div className="ml-3">
          {renderChatInfo()}
        </div>
      </div>

      {/* Right side - User info and logout */}
      <div className="flex items-center space-x-4">
        {/* User info */}
        {session?.user && (
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm font-medium">{session.user.name}</p>
              <p className="text-xs text-gray-500">{session.user.email}</p>
            </div>
            {session.user.image ? (
              <Image
                src={session.user.image}
                alt={session.user.name || "User"}
                width={40}
                height={40}
                className="rounded-full"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-lg font-medium text-gray-600">
                  {session.user.name?.[0]?.toUpperCase() || "U"}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Logout button */}
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200 text-sm font-medium text-gray-700"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default ChatHeader;