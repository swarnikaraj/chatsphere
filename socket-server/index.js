// websocket-server/server.js
require("dotenv").config();
const WebSocket = require("ws");
const http = require("http");
const Redis = require("ioredis");

const REDIS_URL = process.env.REDIS_URL;

if (!REDIS_URL) {
  console.error("REDIS_URL environment variable is not set");
  process.exit(1);
}

console.log("Connecting to Redis...");

// Redis configuration
const redis = new Redis(REDIS_URL, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  reconnectOnError(err) {
    const targetError = "READONLY";
    if (err.message.includes(targetError)) {
      return true;
    }
    return false;
  },
  tls: {
    rejectUnauthorized: false, // May be needed for some Redis services
  },
});

// Handle Redis connection events
redis.on("connect", () => {
  console.log("Connected to Redis");
});

redis.on("error", (error) => {
  console.error("Redis connection error:", error);
});

redis.on("ready", () => {
  console.log("Redis is ready");
});

redis.on("close", () => {
  console.log("Redis connection closed");
});

// Rest of your code remains the same...

const server = http.createServer();
const wss = new WebSocket.Server({ server });

// Store clients in memory
const clients = new Map();

// Helper function to safely interact with Redis
async function safeRedisOperation(operation) {
  try {
    return await operation();
  } catch (error) {
    console.error("Redis operation failed:", error);
    return null;
  }
}

// websocket-server/server.js

// Add this function to get room participants
function getRoomParticipants(roomId) {
  const participants = [];
  clients.forEach((ws, userId) => {
    if (ws.roomId === roomId) {
      participants.push({
        userId,
        readyState: ws.readyState,
        roomId: ws.roomId,
      });
    }
  });
  return participants;
}

function broadcastToRoom(roomId, message, excludeWs = null) {
  console.log(`\n=== Broadcasting to room ${roomId} ===`);
  console.log("Message:", JSON.stringify(message, null, 2));

  // Log room participants
  const participants = getRoomParticipants(roomId);
  console.log("\nRoom participants:", JSON.stringify(participants, null, 2));

  clients.forEach((clientWs, userId) => {
    console.log(`\nChecking client ${userId}:`);
    console.log("- Client room:", clientWs.roomId);
    console.log("- Ready state:", clientWs.readyState);
    console.log(
      "- Should receive:",
      clientWs.roomId === roomId &&
        clientWs !== excludeWs &&
        clientWs.readyState === WebSocket.OPEN
    );

    if (
      clientWs.roomId === roomId &&
      clientWs !== excludeWs &&
      clientWs.readyState === WebSocket.OPEN
    ) {
      try {
        clientWs.send(JSON.stringify(message));
        console.log(`✓ Message sent to client ${userId}`);
      } catch (error) {
        console.error(`✗ Failed to send message to client ${userId}:`, error);
      }
    }
  });
}

// Modify the connection handler to log more details
wss.on("connection", (ws) => {
  console.log("\n=== New client connected ===");

  ws.on("message", async (message) => {
    try {
      const data = JSON.parse(message);
      console.log("\nReceived message:", JSON.stringify(data, null, 2));

      switch (data.type) {
        case "identify": {
          clients.set(data.userId, ws);
          ws.userId = data.userId;
          console.log(`Client identified: ${data.userId}`);
          console.log("Total clients:", clients.size);

          const persistedRoom = await safeRedisOperation(() =>
            redis.get(`user:${data.userId}`)
          );

          if (persistedRoom) {
            ws.roomId = persistedRoom;
            console.log(
              `User ${data.userId} rejoined persisted room ${persistedRoom}`
            );
          }
          break;
        }

        case "join-room": {
          console.log(`Client ${data.userId} is joining room: ${data.roomId}`);
          ws.roomId = data.roomId; // Assign the roomId to the WebSocket connection
          console.log(`Assigning roomId to WebSocket: ${ws.roomId}`);

          await safeRedisOperation(() =>
            redis.set(`user:${data.userId}`, data.roomId)
          );

          console.log(`Client ${ws.userId} joined room: ${data.roomId}`);
          console.log(
            "Room participants after join-room:",
            getRoomParticipants(data.roomId)
          );
          console.log("WebSocket roomId after join-room:", ws.roomId); // Add this log
          break;
        }

        case "chat-message": {
          const messageData = {
            type: "new-message",
            roomId: data.roomId,
            message: {
              ...data.message,
              id: Date.now().toString(),
              timestamp: new Date().toISOString(),
            },
          };
          broadcastToRoom(data.roomId, messageData);
          break;
        }

        default:
          console.warn("Unknown message type:", data.type);
      }
    } catch (error) {
      console.error("Error handling message:", error);
    }
  });

  ws.on("close", () => {
    if (ws.userId) {
      clients.delete(ws.userId);
      console.log(`\nClient disconnected: ${ws.userId}`);
      console.log("Remaining clients:", clients.size);
      console.log(
        "Remaining participants in room:",
        ws.roomId ? getRoomParticipants(ws.roomId) : "No room"
      );
    }
  });
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("Received SIGTERM. Cleaning up...");
  await redis.quit();
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

const PORT = process.env.WS_PORT || 8080;
server.listen(PORT, () => {
  console.log(`WebSocket server is running on port ${PORT}`);
});
