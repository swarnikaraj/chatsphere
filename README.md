# Real-Time Chat Application with Speech-to-Text and Face Matching

A full-stack real-time chat application that provides secure authentication using face recognition, real-time messaging with WebSockets, group chat management, and integrated speech-to-text functionality. This application leverages AWS Rekognition for face matching and Google Speech-to-Text API for audio transcription.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture & Tech Stack](#architecture--tech-stack)
- [Installation & Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [Usage](#usage)
- [WebSocket Server Details](#websocket-server-details)
- [API Endpoints & Routes](#api-endpoints--routes)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)



## Overview

This application is designed to provide a secure and interactive chatting experience. Users register by creating an account (name, email, and password) and are prompted to capture a selfie using their webcam. This image is processed with AWS Rekognition and securely stored as part of the user's profile. During subsequent logins, users must verify their identity with a live selfie. Once authenticated, users can create or join chat groups, invite others via email, and communicate using both text and voice (with real-time speech-to-text conversion using the Google Speech-to-Text API).

## Features

- **User Authentication with Face Matching:**
  - Sign-up with name, email, password, and selfie registration
  - Login requires both traditional credentials and a real-time facial verification
  - Integration with AWS Rekognition for secure face matching

- **Chat Rooms & Messaging:**
  - Create chat rooms and invite members
  - Real-time messaging using WebSockets (ws)
  - Persistent message storage using Redis to maintain conversation history

- **Speech-to-Text Integration:**
  - Record audio messages that are transcribed to text using the Google Speech-to-Text API
  - Option to review and edit transcriptions before sending

- **Real-Time Communication:**
  - WebSocket server handles three main events: user identification, room joining, and chat messaging
  - Instant broadcasting of messages to all room participants

## Architecture & Tech Stack

- **Frontend:**
  - Next.js for UI rendering and API routes
  - Webcam integration for capturing selfies during sign-up and login
  - Chat UI with text and speech-to-text capabilities

- **Backend:**
  - Next.js API routes for handling authentication, face matching, chat room management, and message storage
  - Node.js server for real-time communication using WebSockets
  - Redis for persistent session and message storage

  - **Speech to text Service:**
  - GCP CLOUD RUN function a separate micro service handling from speech to text
  - GCP BUCKET for audio file storage
 
 - **Websocket Server:**
  - Containerized and deployed as separate microservice on cloud railway
 

- **Third-Party Integrations:**
  - **AWS Rekognition:** Face recognition and matching
  - **Google Speech-to-Text API:** Converting recorded audio into text

- **Deployment:**
  - Vercel for front-end deployment
  - Environment variables securely managed through platform-specific settings
  - gcp cloud function for speech to text service deployment
  - Containerized Websocker server on railway


##You can refer to detail documentation for setup at https://chatsphere-mzgl.vercel.app/docs

----------OR---------------

## Installation & Setup

### Prerequisites

- Node.js (v14+)
- npm or yarn
- Redis instance (local or hosted)
- AWS account with Rekognition permissions
- Google Cloud account with Speech-to-Text API enabled

### Steps

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/swarnikaraj/chatsphere.git
   cd chatsphere
   ```

2. **Install Dependencies:**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure Environment Variables:**

   Create a `.env` file in the root directory and add:

   ```env
   # Redis configuration
   REDIS_URL=your_redis_connection_url

   # WebSocket Server Port
   WS_PORT=8080

   # AWS Credentials
   AWS_ACCESS_KEY_ID=your_aws_access_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret_key
   AWS_REGION=your_aws_region

   # Google Speech-to-Text API Key
   GOOGLE_SPEECH_API_KEY=your_google_api_key

   # Additional configurations as needed...
   ```

4. **Start the socket server Application:**
   
     ```bash
     cd socket-server
    docker-compose up -d
    docker-compose logs -f
    
    to stop
    docker-compose down
    
    
    --------or----------
    docker build -t websocket-server .
    docker run -d \
      --name websocket-server \
      -p 8080:8080 \
      -e REDIS_URL="rediss://default:your_password@your-redis-host:6379" \
      -e WS_PORT=8080 \
      -e NODE_ENV=production \
      --cpus=0.5 \
      --memory=512m \
      websocket-server
     ```
5. **Start the speech to text service :**
     
     ```bash
     cd speechToTech-service
     virtul env set up for python based on OS type
     pip install requirements.txt
     python run main.py
    
     ```
6. **Start the gui Application:**
     
     
   - **For Development:**
     ```bash
     cd gui
     npm run dev
     # or
     yarn dev
     ```

   - **For Production Build:**
     ```bash
     cd gui
     npm run build
     npm start
     # or equivalent yarn commands
     ```     

## Environment Variables
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
S3_BUCKET=
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
DATABASE_URL=
EMAIL_USER=
EMAIL_PASS=
NEXT_PUBLIC_SOCKET_URL=''
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=ws://localhost:8080
NEXT_PUBLIC_TRANSCRIPTION_SERVICE_URL=

## Usage

1. **User Registration:**
   - Sign up with your name, email, and password
   - Grant camera access to capture a selfie
   - The captured image is processed via AWS Rekognition for future verification

2. **User Login:**
   - Enter your username and password
   - A new real-time selfie is captured and matched against the stored image
   - On successful verification, you are directed to the main dashboard

3. **Chat Rooms & Messaging:**
   - Create a new chat room and invite members via email
   - Upon invitation acceptance, join the chat room
   - Send messages as text or record audio that is transcribed into text

4. **Real-Time Updates:**
   - WebSocket events manage user identification, joining rooms, and live message broadcasting
   - Redis ensures message persistency and quick access to recent chat history

## WebSocket Server Details

The WebSocket server (located in `websocket-server/server.js`) handles the following:

- **User Identification:**
  On connection, the client sends an "identify" event which maps the user ID to the active WebSocket connection.

- **Room Joining:**
  The "join-room" event assigns the user to a chat room. The server stores this information in Redis for persistence and logs room participation.

- **Chat Messaging:**
  The "chat-message" event broadcasts messages to all participants in the room. Each message is stamped with a unique ID and a timestamp before broadcasting.

The server also includes robust logging and error handling to monitor client connections, message flows, and Redis operations.

## API Endpoints & Routes

- **User Authentication:**
  - `POST /api/registry` – Handles user registration, including face capture and storage
  - `POST /api/login` – Handles login by verifying credentials and live face capture

- **Chat Room Management:**
  - `POST /api/chat/` – Creates a new chat room
  - `POST /api/invitations` – Sends an invitation email to join a chat room while creating group or room
  - `GET /api/messages` – Retrieves past chat messages from the database (Redis)

- **Speech-to-Text:**
  - `POST  gcp_cloud_function_url` – Converts recorded audio to text using the Google Speech-to-Text API and its a separate service


- **Websocket server:**
  - NEXT_PUBLIC_WS_URL=wss://socketserver PORT 8080

## Deployment

- **Frontend:**
  Deployed on Vercel, leveraging Next.js for seamless SSR and API routes

- **Backend WebSocket Server:**
  Can be deployed on a Node.js hosting service or alongside the frontend if architecture permits. Ensure the WS_PORT and other environment variables are correctly set


For any questions or feedback, please reach out at [swarnikarajsingh@gmail.com](mailto:swarnikarajsingh@gmail.com).
