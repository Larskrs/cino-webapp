import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";

async function detectAttachmentType(url: string): Promise<"image" | "video" | null> {
  try {
    const res = await fetch(url, { method: "HEAD" });

    const contentType = res.headers.get("content-type") || "";

    if (contentType.startsWith("image/")) {
      return "image";
    }

    if (contentType.startsWith("video/")) {
      return "video";
    }

    return null;
  } catch (err) {
    console.error("HEAD request failed for", url, err);
    return null;
  }
}

function extractUrls(text: string): string[] {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.match(urlRegex) || [];
}
function stripUrls(text: string): string {
  return text.replace(/https?:\/\/[^\s]+/g, "").trim();
}

export const postRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

    create: protectedProcedure
    .input(
      z.object({
        body: z
          .string()
          .min(1, "Post content is required")
          .max(125, "Post content exceeds maximum length"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const { body } = input;

      // Extract URLs from body
      const urls = extractUrls(body);

      // HEAD request each to check media type
      const attachmentResults = await Promise.all(
        urls.map(async (u) => {
          const type = await detectAttachmentType(u);
          if (type) {
            return { url: u, type };
          }
          return null;
        })
      );

      const attachments = attachmentResults.filter(Boolean) as { url: string; type: string }[];

      const post = await ctx.db.post.create({
        data: {
          body: stripUrls(body),
          // store as JSON (needs Prisma update)
          attachments,
          createdBy: { connect: { id: userId } },
        },
      });

      return post;
    }),

  getLatest: protectedProcedure.query(async ({ ctx }) => {
    const post = await ctx.db.post.findFirst({
      orderBy: { createdAt: "desc" },
      where: { createdBy: { id: ctx.session.user.id } },
    });

    return post ?? null;
  }),

  list: protectedProcedure.query(async ({ ctx }) => {
    // const userId = ctx.session.user.id;

    const posts = await ctx.db.post.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        createdBy: true,
      }
    });

    return posts;
  }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
});
