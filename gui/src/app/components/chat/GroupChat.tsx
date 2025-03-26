// components/chat/GroupChat.tsx
'use client';

import { UserAvatar } from './UserAvatar';
import { Button } from '../ui/Button';

export function GroupChat() {
  // Fake group data
  const group = {
    name: 'Project Team',
    members: [
      { id: '1', name: 'Alice Johnson', role: 'Admin' },
      { id: '2', name: 'Bob Smith', role: 'Member' },
      { id: '3', name: 'Charlie Brown', role: 'Member' },
      { id: '4', name: 'Diana Prince', role: 'Member' },
    ],
  };

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-gray-200 p-4">
        <h2 className="text-xl font-semibold">{group.name}</h2>
        <p className="text-sm text-gray-500">{group.members.length} members</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Group Members</h3>
            <Button variant="outline" size="sm">
              Add Members
            </Button>
          </div>
          
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {group.members.map(member => (
                <li key={member.id} className="p-4 flex items-center">
                  <UserAvatar name={member.name} />
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900">{member.name}</p>
                    <p className="text-xs text-gray-500">{member.role}</p>
                  </div>
                  {member.role === 'Admin' && (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800">
                      Admin
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Group Settings</h3>
            <div className="bg-white rounded-lg shadow p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Notifications</p>
                  <p className="text-sm text-gray-500">Manage group notifications</p>
                </div>
                <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                  Change
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Media, files and links</p>
                  <p className="text-sm text-gray-500">View shared media in this group</p>
                </div>
                <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                  View
                </button>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <Button variant="outline" className="w-full" color="red">
                  Leave Group
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}