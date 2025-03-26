import { GroupChat } from "@/app/components/chat/GroupChat";

export default function GroupPage() {
  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex-1 flex flex-col overflow-hidden">
        <GroupChat />
      </div>
    </div>
  );
}

