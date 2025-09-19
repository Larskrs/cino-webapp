import { z } from "zod";
import { octetInputParser } from '@trpc/server/http';

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

const attachmentSchema = z.object({
  url: z.string().url(),
  type: z.enum(["image", "video"]),
});

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
          .max(512, "Post content exceeds maximum length"),
        attachments: z
          .array(attachmentSchema).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const { body, attachments = [] } = input;

      // Extract URLs from text body (still works)
      const urls = extractUrls(body);
      const attachmentResults = await Promise.all(
        urls.map(async (u) => {
          const type = await detectAttachmentType(u);
          return type ? { url: u, type } : null;
        })
      );
      const linkAttachments = attachmentResults.filter(Boolean) as {
        url: string;
        type: "image" | "video";
      }[];

      const post = await ctx.db.post.create({
        data: {
          body: stripUrls(body),
          attachments: [...attachments, ...linkAttachments], // ✅ combine uploads + links
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

  list: publicProcedure.query(async ({ ctx }) => {
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
