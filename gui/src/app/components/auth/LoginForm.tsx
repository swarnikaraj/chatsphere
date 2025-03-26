// LoginForm.tsx
'use client';

import { useState } from 'react';
import { Button } from '../ui/Button';
import { FaceCapture } from './FaceCapture';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { toast } from 'react-toastify';


export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState<'credentials' | 'face'>('credentials');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  
  const handleFaceCapture = (image: string) => {
    handleFaceVerification(image);
  };

  const handleFaceVerification = async (capturedImage: string) => {
    setIsLoading(true);
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (!result?.ok) {
        toast.error(`Login failed: ${result?.error}`);
        setIsLoading(false);
        return;
      } 
      console.log(result,"result from login")


      const faceIdcallres = await fetch('/api/auth/get-face-id', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
     if(!faceIdcallres.ok){
      toast.error("Unauthenticated User")
      return

     }
      const faceRes = await faceIdcallres.json();

     
      // Verify face after successful credential check
      const response = await fetch('/api/auth/verify-face', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          faceImage: capturedImage,
          faceId: faceRes.faceId,
        }),
      });

      const data = await response.json();

      if (data.verified) {
        router.push('/chat');
        router.refresh(); 
      } else {
        toast.error('Face verification failed.');
      }
    } catch (error) {
      console.log('Face verification error:', error);
      toast.error('Face verification failed: Internal server error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.warning('Please fill in all fields');
      return;
    }
    setStep('face');
  
  };

  if (step === 'face') {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-center">Face Verification</h3>
        <p className="text-sm text-gray-600 text-center">
          Please look at your camera to verify your identity
        </p>
        <FaceCapture email={email} onCapture={handleFaceCapture} mode="login"/>
        {isLoading && (
          <p className="text-center text-sm text-gray-500">Verifying...</p>
        )}
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={() => setStep('credentials')}
          disabled={isLoading}
        >
          Back
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleCredentialsSubmit} className="space-y-4 text-gray-700">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
        />
      </div>
      <Button
        type="submit"
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? 'Loading...' : 'Continue'}
      </Button>
    </form>
  );
}