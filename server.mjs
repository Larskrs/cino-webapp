// server.mjs
import dotenv from "dotenv";
dotenv.config();

import { createServer } from "http";
import { parse } from "url";
import next from "next";
import logger from "./logger.mjs";

const port = parseInt(process.env.PORT ?? "3000", 10);
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev, turbo: dev });
const handle = app.getRequestHandler();

logger.info(`Starting up Next.js server at port: ${port}...`);

app
  .prepare()
  .then(() => {
    const server = createServer(async (req, res) => {
      try {
        const parsedUrl = parse(req?.url || "no-url", true);

        // Log all requests
        logger.info(`Incoming request: ${req.method} ${req.url}`);

        await handle(req, res, parsedUrl);
      } catch (err) {
        logger.error("Error while handling request", { err });
        res.statusCode = 500;
        res.end("Internal Server Error");
      }
    });

    server.listen(port, () => {
      logger.info(
        `> Server listening at http://localhost:${port} as ${
          dev ? "development" : process.env.NODE_ENV
        }`
      );
      logger.info("Server started");
      logger.info("Using Database:", { url: process.env.DATABASE_URL });
    });

    // Catch server-level errors
    server.on("error", (err) => {
      logger.error("Server error", { error: err.stack });
    });
  })
  .catch((err) => {
    logger.error("Failed to prepare Next.js app", { error: err.stack });
    process.exit(1);
  });

// Catch unhandled promise rejections
process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled Rejection", { reason });
});

// Catch uncaught exceptions
process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception", { error: err.stack });
  process.exit(1); // optional, depending if you want to crash
});
