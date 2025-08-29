// server.mjs (ESM style)
import { createServer } from "http";
import next from "next";
import { WebSocketServer } from "ws";
import { setupWSConnection } from "y-websocket"; // ✅ import from root

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const port = 3000;

app.prepare().then(() => {
  const server = createServer((req, res) => {
    handle(req, res);
  });

  // ✅ Yjs WebSocket server
  const wss = new WebSocketServer({ server });
  wss.on("connection", (ws, req) => {
    setupWSConnection(ws, req);
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});
