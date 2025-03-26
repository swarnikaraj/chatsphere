// app/invitation/page.tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

 function InvitationClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const roomId = searchParams.get('roomId');
  const invitationId = searchParams.get('invitationId');
  const [status, setStatus] = useState<'pending' | 'accepted' | 'rejected'>('pending');
if (!invitationId) {
    return <div>Invalid invitation link.</div>;
  }
  const handleResponse = async (response: 'accepted' | 'rejected') => {
    try {
      const res = await fetch(`/api/invitations?invitationId=${invitationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: response }),
      });

      if (!res.ok) {
        throw new Error('Failed to update invitation');
      }

      setStatus(response);
      if (response === 'accepted') {
        router.push(`/chat/${roomId}`);
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (status === 'accepted') {
    return <p>You have successfully joined the room!</p>;
  }

  if (status === 'rejected') {
    return <p>You have rejected the invitation.</p>;
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">You have been invited to join a room</h1>
      <p>Would you like to accept or reject the invitation?</p>
      <div className="mt-4 flex space-x-4">
        <button
          onClick={() => handleResponse('accepted')}
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          Accept
        </button>
        <button
          onClick={() => handleResponse('rejected')}
          className="px-4 py-2 bg-red-500 text-white rounded"
        >
          Reject
        </button>
      </div>
    </div>
  );
}

export default function InvitationPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <InvitationClient />
    </Suspense>
  );
}