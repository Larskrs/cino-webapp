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
function getPostHashtagsFromBody(body: string): string[] {
  const hashtagRegex = /#(\w+)/g; // matches #tag (letters, numbers, underscore)
  const matches = body.match(hashtagRegex) || [];
  return matches.map((tag) => tag.slice(1).toLowerCase()); // remove "#" + normalize lowercase
}
const attachmentSchema = z.object({
  url: z.string().max(64),
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
        parentId: z.number().optional()
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

      const tags = getPostHashtagsFromBody(input.body)

      const post = await ctx.db.post.create({
        data: {
          body: stripUrls(body),
          attachments: [...attachments, ...linkAttachments],
          createdBy: { connect: { id: userId } },
          ...(input.parentId !== undefined && {
            parent: { connect: { id: input.parentId } },
          }),
          hashtags: {
            create: tags.map((t) => ({
              hashtag: {
                connectOrCreate: {
                  where: { tag: t },
                  create: { tag: t },
                },
              },
            })),
          },
        },
        include: {
          hashtags: { include: { hashtag: true } }, // return tags too
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

  list: publicProcedure
    .input(
      z.object({
        userId: z.string().optional(),
        hashtags: z.array(z.string()).optional()
      })
    )
    .query(async ({ ctx, input }) => {
      const posts = await ctx.db.post.findMany({
        where: {
          
          ...(input.userId ? { createdById: input.userId } : {}),
          ...(input.hashtags ? { hashtags: {
            some: {
              hashtag: {
                tag: { in: input.hashtags.map((t) => t.toLowerCase()) }
              }
            }
          }
          }: {}),
          parentId: null, // only top-level posts
        },
        orderBy: { createdAt: "desc" },
        include: {
          createdBy: true,
          _count: {
            select: {
              replies: true
            }
          },
          hashtags: {
            include: {
              hashtag: true
            }
          }
        },
      });

      return posts;
    }),
  byId: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.post.findUnique({
        where: { id: input.id },
        include: {
          createdBy: true,
          _count: {
            select: {
              replies: true
            }
          }
        },
      });
    }),

  replies: publicProcedure
    .input(z.object({ postId: z.number() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.post.findMany({
        where: { parentId: input.postId },
        orderBy: { createdAt: "desc" },
        include: {
          createdBy: true,
        },
      });
    }),
});
