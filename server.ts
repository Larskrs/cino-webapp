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
  let docName: string | null = null;

  ws.on("message", async (message: Buffer) => {
    // Expect message to be JSON: { type: "sync", doc: "room1", update: base64 }
    const data = JSON.parse(message.toString());

    if (!data.doc) return;

    docName = data.doc;
    if (!docs.has(docName)) {
      docs.set(docName, new Y.Doc());
    }

    const doc = docs.get(docName)!;

    if (data.type === "sync" && data.update) {
      const update = Buffer.from(data.update, "base64");
      Y.applyUpdate(doc, update);

      // Publish to other servers / subscribers
      await redisPub.publish(docName, data.update);
    }
  });

  // Subscribe to KeyDB channel for this document
  const subHandler = (channel: string, message: string) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({ type: "sync", doc: channel, update: message })
      );
    }
  };

  if (docName) {
    redisSub.subscribe(docName);
    redisSub.on("message", subHandler);
  }

  ws.on("close", () => {
    if (docName) {
      redisSub.unsubscribe(docName);
      redisSub.off("message", subHandler);
    }
  });
});

console.log(`Yjs KeyDB WS server running on ws://localhost:${PORT}`);
