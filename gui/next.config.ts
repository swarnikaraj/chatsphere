// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "chatsphere-face-recognition.s3.us-east-1.amazonaws.com",

      },
    ],
  },
  env: {
    NEXT_PUBLIC_TRANSCRIPTION_URL: 'https://asia-south1-tubegenius-442411.cloudfunctions.net/upload_and_transcribe_audio',
  },
};

export default nextConfig;