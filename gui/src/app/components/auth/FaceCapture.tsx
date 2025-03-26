// FaceCapture.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/Button';
import Image from 'next/image';
import { toast } from 'react-toastify';

interface FaceCaptureProps {
  onVerified?: (success: boolean) => void;
  onCapture: (image: string) => void;
  mode?: 'login' | 'register';
  email?: string;
}

export function FaceCapture({ onVerified, onCapture, mode , email}: FaceCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);
 
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false,
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      
      setStream(mediaStream);
    } catch (err) {
      console.error('Error accessing camera:', err);
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context?.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const imageDataUrl = canvas.toDataURL('image/jpeg');
      setCapturedImage(imageDataUrl);
      onCapture(imageDataUrl); // Pass the captured image back to the parent component
      setIsCapturing(false);
    }
  };

  const verifyFace = async () => {
    if (!capturedImage) return;
    
    setVerificationStatus('processing');
    
    if (mode === 'register') {
      // For registration, just set success status
      setVerificationStatus('success');
      if (onVerified) {
        onVerified(true);
      }
    } else {
      // For login, perform verification

       try {
      const response = await fetch('/api/auth/get-face-id', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      console.log(response,"sndsdfsmdms from get face id")
      if (response.ok && data.faceId) {
        try {
        const response = await fetch('/api/auth/verify-face', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ faceImage: capturedImage ,faceId: data.faceId}),
        });

        const res = await response.json();
        
        setVerificationStatus(res.verified ? 'success' : 'error');
        if (onVerified) {
          onVerified(res.verified);
        }
      } catch (error) {
        console.error('Face verification error:', error);
        setVerificationStatus('error');
        if (onVerified) {
          onVerified(false);
        }
      }
    }
        
      else {
        toast.error('User not found or face ID not available');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to fetch user data');
    } finally {
      // setIsLoading(false);
    }
      
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-square flex items-center justify-center">
        {!isCapturing && !capturedImage ? (
          <div className="text-center p-4">
            <p className="text-gray-500">Camera is off</p>
            <Button 
              variant="primary" 
              className="mt-4"
              onClick={() => {
                setIsCapturing(true);
                startCamera();
              }}
            >
              Start Camera
            </Button>
          </div>
        ) : isCapturing ? (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover"
          />
        ) : (
          capturedImage && (
            <Image
              width={300}
              height={300}
              src={capturedImage} 
              alt="Captured face" 
              className="w-full h-full object-cover"
            />
          )
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {isCapturing && (
        <div className="flex justify-center">
          <Button 
            variant="primary"
            onClick={captureImage}
          >
            Capture Image
          </Button>
        </div>
      )}

      {capturedImage && (
        <div className="space-y-2">
          <div className="flex space-x-2">
            <Button 
              variant="outline"
              className="flex-1"
              onClick={() => {
                setCapturedImage(null);
                startCamera();
                setIsCapturing(true);
                setVerificationStatus('idle');
              }}
            >
              Retake
            </Button>
            {mode === 'login' && (
              <Button 
                variant="primary"
                className="flex-1"
                onClick={verifyFace}
                isLoading={verificationStatus === 'processing'}
              >
                Verify
              </Button>
            )}
          </div>

          {verificationStatus === 'success' && (
            <div className="p-2 bg-green-100 text-green-800 rounded text-center text-sm">
              {mode === 'login' ? 'Verification successful!' : 'Image captured successfully!'}
            </div>
          )}

          {verificationStatus === 'error' && (
            <div className="p-2 bg-red-100 text-red-800 rounded text-center text-sm">
              {mode === 'login' ? 'Verification failed. Please try again.' : 'Please try again.'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}