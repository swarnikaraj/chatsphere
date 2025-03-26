'use client';

import { useEffect, useState } from 'react';
import { Button } from '../ui/Button';
import { UserAvatar } from './UserAvatar';
import { toast } from 'react-toastify';


interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGroupCreated: () => void;
}

interface User {
  id: string;
  name: string;
  email: string;
}

export function CreateGroupModal({ isOpen, onClose ,onGroupCreated}: CreateGroupModalProps) {
  const [groupName, setGroupName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingUsers, setIsFetchingUsers] = useState(false);
  
  useEffect(() => {
    const fetchUsers = async () => {
      setIsFetchingUsers(true);
      try {
        const response = await fetch('/api/auth/users', { method: "POST" });
        const data = await response.json();
        if (response.ok) {
          setUsers(data);
        } else {
          toast.error("Something went wrong");
        }
      } catch (error) {
        console.error('Failed to fetch users:', error);
        toast.error("Failed to fetch users");
      } finally {
        setIsFetchingUsers(false);
      }
    };

    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUsers.length === 0) {
      toast.error("Please select at least one user");
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: groupName,
          userIds: selectedUsers,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create group');
      }
      onGroupCreated();
    setGroupName('');
    setSelectedUsers([]);

      toast.success("Group created successfully");
      onClose();
    } catch (error) {
      console.error('Error creating group:', error);
      toast.error("Failed to create group");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
            Create New Group
          </h3>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="group-name" className="block text-sm font-medium text-gray-700 mb-1">
                Group Name
              </label>
              <input
                type="text"
                id="group-name"
                className="w-full text-gray-800 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add Members
              </label>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {isFetchingUsers ? (
                  <UserListSkeleton />
                ) : (
                  users.map(user => (
                    <div 
                      key={user.id}
                      className={`flex items-center p-2 rounded-md cursor-pointer ${
                        selectedUsers.includes(user.id) ? 'bg-indigo-50' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => toggleUserSelection(user.id)}
                    >
                      <UserAvatar name={user.name} />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                      {selectedUsers.includes(user.id) && (
                        <div className="ml-auto w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isLoading}
              >
                {isLoading ? 'Creating...' : 'Create Group'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

const UserListSkeleton = () => {
  return (
    <>
      {[...Array(5)].map((_, index) => (
        <div 
          key={index}
          className="flex items-center p-2 rounded-md animate-pulse"
        >
          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
          <div className="ml-3 flex-1">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </>
  );
};