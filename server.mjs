// server.js
import WebSocket, { WebSocketServer } from "ws";
import * as Y from "yjs";
import IORedis from "ioredis";

const PORT = 1234;

// KeyDB connection
const redisPub = new IORedis({
  host: "localhost",
  port: 6379,
  password: "mysecurepass",
});
const redisSub = new IORedis({
  host: "localhost",
  port: 6379,
  password: "mysecurepass",
});

const docs = new Map(); // In-memory Yjs docs
const wss = new WebSocketServer({ port: PORT });

wss.on("connection", (ws) => {
  console.log("[WS] Client connected");
  const subscribedDocs = new Set();

  const subHandler = (channel, message) => {
    if (ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(JSON.stringify({ type: "sync", doc: channel, update: message }));
        console.log(`[WS] Sent update to client for doc ${channel}`);
      } catch (err) {
        console.error("[WS] Failed to send update", err);
      }
    }
  };

  ws.on("message", async (message) => {
    console.log("[WS] Received message:", message.toString());
    try {
      const data = JSON.parse(message.toString());
      const docName = data.doc || data.room; // fallback
      if (!docName) {
        console.warn("[WS] No doc specified in message");
        return;
      }

      if (!docs.has(docName)) {
        docs.set(docName, new Y.Doc());
        console.log(`[Yjs] Created new doc: ${docName}`);
      }

      const doc = docs.get(docName);

      // Subscribe to Redis channel if not already
      if (!subscribedDocs.has(docName)) {
        await redisSub.subscribe(docName);
        subscribedDocs.add(docName);
        console.log(`[Redis] Subscribed to channel: ${docName}`);
      }

      if (data.type === "sync" && data.update) {
        const update = Buffer.from(data.update, "base64");
        Y.applyUpdate(doc, update);
        console.log(`[Yjs] Applied update to doc: ${docName}`);

        // Publish to other subscribers
        await redisPub.publish(docName, data.update);
        console.log(`[Redis] Published update to channel: ${docName}`);
      }
    } catch (err) {
      console.error("[WS] Failed to process message", err);
    }
  });

  redisSub.on("message", subHandler);

  ws.on("close", () => {
    console.log("[WS] Client disconnected");
    // Unsubscribe from all docs
    subscribedDocs.forEach((docName) => {
      redisSub.unsubscribe(docName);
      console.log(`[Redis] Unsubscribed from channel: ${docName}`);
    });
  });

  ws.on("error", (err) => {
    console.error("[WS] Connection error:", err);
  });
});

wss.on("listening", () => {
  console.log(`[WS] Yjs KeyDB WS server running on ws://localhost:${PORT}`);
});

wss.on("error", (err) => {
  console.error("[WS] Server error:", err);
});
