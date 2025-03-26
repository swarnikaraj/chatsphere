
'use client';

import { useState, useRef } from 'react';
import { Button } from '../ui/Button';
import { ChatMessage } from '@/types/websocket';
import { useSession } from 'next-auth/react';
import { useWebSocket } from '@/context/WebSocketContext';
import { toast } from 'react-toastify';

interface ChatInputProps {
    roomId: string;
    updateChatHistory: (message: ChatMessage) => void;
}


export function ChatInput({ roomId ,updateChatHistory}: ChatInputProps){
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { ws, isConnected } = useWebSocket();
  
   const { data: session } = useSession();
  

   

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
            if (!isConnected || !ws) {
    return 
  }
        if (!message.trim() || !session?.user) return;

        const newMessage: ChatMessage = {
            content: message,
            senderId: session.user.id,
            roomId,
            createdAt: new Date(),
            sender: {
                id: session.user.id,
                name: session.user.name || 'Unknown User'
            }
        };

        try {
            // Send to WebSocket
            console.log(roomId, newMessage,"to the socket")
            ws.sendMessage(roomId, newMessage);
           
            // Save to database
           const response= await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newMessage),
            });
           const { message: savedMessage } = await response.json();
            setMessage('');
            updateChatHistory(savedMessage);
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 48000,
          sampleSize: 16,
          
        }
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
        audioBitsPerSecond: 128000
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        setIsProcessing(true);
        const audioBlob = new Blob(chunksRef.current, { 
          type: 'audio/webm;codecs=opus' 
        });
        chunksRef.current = [];

        // Convert blob to base64
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result as string;
          const base64Data = base64Audio.split(',')[1]; // Remove data URL prefix

          try {
            const TRANSCRIPTION_URL = process.env.NEXT_PUBLIC_TRANSCRIPTION_URL!;
    
    if (!TRANSCRIPTION_URL) {
        toast.error('Transcription service URL is not defined in environment variables');
    }
            const url = new URL(TRANSCRIPTION_URL);
            const response = await fetch(url, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                audio_data: base64Data,
                content_type: 'audio/webm;codecs=opus',
                language_code: 'en-US',
                long_audio: false
              })
            });

            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setMessage(data.text);
          } catch (error) {
            console.error('Error sending audio:', error);
            alert('Error transcribing audio. Please try again.');
          } finally {
            setIsProcessing(false);
          }
        };
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Error accessing microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center space-x-2">
      <div className="flex-1 relative">
        <input
          type="text"
          className="w-full px-4 py-2 text-gray-800 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder={isProcessing ? "Processing audio..." : "Type a message..."}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={isProcessing}
        />
        <button
          title={isRecording ? 'Stop recording' : 'Start recording'}
          type="button"
          onClick={toggleRecording}
          disabled={isProcessing}
          className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
            isRecording ? 'text-red-500' : 
            isProcessing ? 'text-gray-300' : 
            'text-gray-400 hover:text-gray-600'
          }`}
        >
          {isProcessing ? (
            // Processing spinner
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
              />
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ) : (
            <svg 
              className="w-5 h-5" 
              fill={isRecording ? "currentColor" : "none"} 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              {isRecording ? (
                // Stop recording icon
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                // Start recording icon
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" 
                />
              )}
            </svg>
          )}
        </button>
      </div>
      <Button 
        type="submit" 
        variant="primary" 
        className="rounded-full px-4"
        disabled={isRecording || isProcessing}
      >
        Send
      </Button>
    </form>
  );
}