'use client';

import { useState } from 'react';
import { Button } from '../ui/Button';
import { FaceCapture } from './FaceCapture';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

export function RegisterForm() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState<'credentials' | 'face'>('credentials');
  const [isLoading, setIsLoading] = useState(false);
  const [faceImage, setFaceImage] = useState<string | null>(null);
  const router = useRouter();
 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step === 'credentials') {
      if (password !== confirmPassword) {
        alert("Passwords don't match!");
        return;
      }
      
      setStep('face');
    }
  };

  const handleFaceCaptured = (image: string) => {
    setFaceImage(image);
    console.log('Face image captured:', image.substring(0, 50) + '...'); // Log first 50 chars of image data
  };

  const handleRegister = async () => {
    if (!faceImage) {
      toast.error('Please capture your face image first');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
          faceImage,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Registration successful!');
        router.push('/login');
      } else {
        toast.error(`Registration failed: ${data.error}`);
      }
    } catch (error) {
      console.log('Registration error:', error);
      toast.error('Registration failed: Internal server error');
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'face') {
    return (
      <div className="space-y-6 text-gray-800">
        <h3 className="text-lg font-medium text-center">Face Registration</h3>
        <p className="text-sm text-gray-600 text-center">
          Please look at your camera to register your facial data
        </p>
        <FaceCapture 
          mode="register" 
          onCapture={handleFaceCaptured}
        />
        <div className="space-y-4">
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => setStep('credentials')}
          >
            Back
          </Button>
          {faceImage && (
            <Button 
              variant="primary" 
              className="w-full" 
              onClick={handleRegister}
              isLoading={isLoading}
            >
              Complete Registration
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <form className="space-y-6 text-gray-700" onSubmit={handleSubmit}>
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Full Name
        </label>
        <div className="mt-1">
          <input
            id="name"
            name="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email address
        </label>
        <div className="mt-1">
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <div className="mt-1">
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      <div>
        <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
          Confirm Password
        </label>
        <div className="mt-1">
          <input
            id="confirm-password"
            name="confirm-password"
            type="password"
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      <div>
        <Button
          type="submit"
          variant="primary"
          className="w-full"
          isLoading={isLoading}
        >
          Continue
        </Button>
      </div>
    </form>
  );
}