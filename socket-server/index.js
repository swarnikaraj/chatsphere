// websocket-server/server.js
require("dotenv").config();
const WebSocket = require("ws");
const http = require("http");
const Redis = require("ioredis");

const redis = new Redis(process.env.REDIS_URL, {
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

wss.on("connection", (ws) => {
  console.log("New client connected");

  ws.on("message", async (message) => {
    try {
      const data = JSON.parse(message);
      console.log("Received message:", data);

      switch (data.type) {
        case "identify": {
          clients.set(data.userId, ws);
          ws.userId = data.userId;

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
          ws.roomId = data.roomId;
          await safeRedisOperation(() =>
            redis.set(`user:${data.userId}`, data.roomId)
          );
          console.log(`Client joined room: ${data.roomId}`);
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
          console.log(`Broadcasting message to room: ${data.roomId}`);
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
      console.log(`Client disconnected: ${ws.userId}`);
    }
  });
});

function broadcastToRoom(roomId, message, excludeWs = null) {
  clients.forEach((clientWs) => {
    if (
      clientWs.roomId === roomId &&
      clientWs !== excludeWs &&
      clientWs.readyState === WebSocket.OPEN
    ) {
      clientWs.send(JSON.stringify(message));
    }
  });
}

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
