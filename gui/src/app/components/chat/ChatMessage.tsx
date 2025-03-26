// components/chat/ChatMessage.tsx
'use client';

import { UserAvatar } from "./UserAvatar";

interface ChatMessageProps {
  sender: string;
  content: string;
  timestamp: string;
  isCurrentUser: boolean;
  avatar?: string;
}

export function ChatMessage({ sender, content, timestamp, isCurrentUser, avatar }: ChatMessageProps) {
  return (
    <div className={`flex text-gray-800 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${isCurrentUser ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200'}`}>
        {!isCurrentUser && (
          <div className="flex items-center mb-1">
            <UserAvatar name={sender} initials={avatar} />
            <span className="ml-2 font-medium text-sm">{sender}</span>
          </div>
        )}
        <p className={isCurrentUser ? 'text-white' : 'text-gray-800'}>{content}</p>
        <p className={`text-xs mt-1 ${isCurrentUser ? 'text-indigo-100' : 'text-gray-500'}`}>
          {timestamp}
        </p>
      </div>
    </div>
  );
}

