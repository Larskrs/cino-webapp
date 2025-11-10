import { postRouter } from "@/server/api/routers/post";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { projectRouter } from "./routers/projects";
import { scriptRouter } from "./routers/scripts";
import { userRouter } from "./routers/user";
import { hashtagRouter } from "./routers/hashtag";
import { fileRouter } from "./routers/files";
import { boardRouter } from "./routers/board";
import { pollRouter } from "./routers/poll";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post:     postRouter,
  projects: projectRouter,
  scripts:  scriptRouter,
  users:    userRouter,
  files:    fileRouter,
  hashtags: hashtagRouter,
  board: boardRouter,
  poll: pollRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
