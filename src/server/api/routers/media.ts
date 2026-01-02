import { z } from "zod"
import { createTRPCRouter, permittedProcedure, protectedProcedure, publicProcedure } from "@/server/api/trpc"
import { TRPCError } from "@trpc/server"
import { MediaType } from "@prisma/client"

/* ------------------------------- Zod схемas ------------------------------- */

const MediaTypeEnum = z.nativeEnum(MediaType)

const ContainerCreateInput = z.object({
  slug: z.string().min(2).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use kebab-case slug"),
  title: z.string().min(1),
  description: z.string().optional().nullable(),

  thumbnail: z.string().optional().nullable(),
  banner: z.string().optional().nullable(),
  poster: z.string().optional().nullable(),
  color: z.unknown().optional().nullable(), // Json

  type: MediaTypeEnum,
  genres: z.array(z.string()).default([]),

  isPublic: z.boolean().optional(),
  isLive: z.boolean().optional(),
})

const ContainerUpdateInput = z.object({
  id: z.string(),

  slug: z.string().min(2).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use kebab-case slug").optional(),
  title: z.string().min(1).optional(),
  description: z.string().optional().nullable(),

  thumbnail: z.string().optional().nullable(),
  logo: z.string().optional().nullable(),
  banner: z.string().optional().nullable(),
  poster: z.string().optional().nullable(),
  color: z.unknown().optional().nullable(),

  type: MediaTypeEnum.optional(),
  genres: z.array(z.string()).optional(),

  isPublic: z.boolean().optional(),
  isLive: z.boolean().optional(),
})

const SeasonCreateInput = z.object({
  containerId: z.string(),
  title: z.string().optional().nullable(),
  seasonNumber: z.number().int().positive().optional().nullable(),
  description: z.string().optional().nullable(),
  thumbnail: z.string().optional().nullable(),
})

const SeasonUpdateInput = z.object({
  id: z.string(),
  title: z.string().optional().nullable(),
  seasonNumber: z.number().int().positive().optional().nullable(),
  description: z.string().optional().nullable(),
  thumbnail: z.string().optional().nullable(),
})

const EpisodeCreateInput = z.object({
  seasonId: z.string(),

  title: z.string().min(1),
  description: z.string().optional().nullable(),
  thumbnail: z.string().optional().nullable(),

  episodeNumber: z.number().int().positive().optional().nullable(),
  airDate: z.coerce.date().optional().nullable(),

  durationSec: z.number().int().positive().optional().nullable(),
  videoSrc: z.string().optional(),
  isLive: z.boolean().optional(),
})

const EpisodeUpdateInput = z.object({
  id: z.string(),

  title: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  thumbnail: z.string().optional().nullable(),

  episodeNumber: z.number().int().positive().optional().nullable(),
  airDate: z.coerce.date().optional().nullable(),

  durationSec: z.number().int().positive().optional().nullable(),
  videoSrc: z.string().optional(),
  isLive: z.boolean().optional(),
})

const ListContainersInput = z.object({
  q: z.string().optional(),
  type: MediaTypeEnum.optional(),
  genre: z.string().optional(),
  isPublic: z.boolean().optional(),
  isLive: z.boolean().optional(),

  cursor: z.string().optional(), // id cursor
  limit: z.number().int().min(1).max(50).default(24),
})

/* ------------------------------ Auth helpers ------------------------------ */
/**
 * Swap this with your own permissions model:
 * - project membership
 * - roles
 * - admin flag
 * etc.
 */
async function requireAdmin(ctx: any) {
  // If you already have roles (admin/manager/...), hook it up here.
  // For now: require a session and an "isAdmin" flag if present, else deny.
  const user = ctx.session?.user
  if (!user) throw new TRPCError({ code: "UNAUTHORIZED" })

  // Common pattern: user.role === "admin"
  // If you don't have it, replace with project membership checks.
  if ((user as any).role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin only" })
  }
}

/* ------------------------------- Media router ------------------------------ */

export const mediaRouter = createTRPCRouter({
  /* ------------------------------ Containers ------------------------------ */

  list_containers: publicProcedure
    .input(ListContainersInput)
    .query(async ({ ctx, input }) => {
      const where: any = {}

      if (input.q) {
        where.OR = [
          { title: { contains: input.q, mode: "insensitive" } },
          { description: { contains: input.q, mode: "insensitive" } },
          { slug: { contains: input.q, mode: "insensitive" } },
        ]
      }
      if (input.type) where.type = input.type
      if (typeof input.isPublic === "boolean") where.isPublic = input.isPublic
      if (typeof input.isLive === "boolean") where.isLive = input.isLive
      if (input.genre) where.genres = { has: input.genre }

      const limit = input.limit ?? 24
      const items = await ctx.db.mediaContainer.findMany({
        where,
        take: limit + 1,
        ...(input.cursor
          ? {
              skip: 1,
              cursor: { id: input.cursor },
            }
          : {}),
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        include: {
          _count: { select: { seasons: true } },
          seasons: {
            take: 1,
            orderBy: [{ createdAt: "desc" }],
            include: {
                episodes: {
                    take: 1,
                    orderBy: [{ episodeNumber: "asc" }, { createdAt: "desc" }]
                }
            }
          }
        },
      })

      let nextCursor: string | undefined = undefined
      if (items.length > limit) {
        const next = items.pop()!
        nextCursor = next.id
      }

      return { items, nextCursor }
    }),

  get_container: protectedProcedure
    .input(z.object({ id: z.string().optional(), slug: z.string().optional() }).refine((v) => v.id || v.slug, "Provide id or slug"))
    .query(async ({ ctx, input }) => {
      const container = await ctx.db.mediaContainer.findUnique({
        where: input.id ? { id: input.id } : { slug: input.slug! },
        include: {
          seasons: {
            orderBy: [{ seasonNumber: "desc" }, { createdAt: "desc" }],
            include: {
              _count: { select: { episodes: true } },
              episodes: {
                take: 1
              }
            },
          },
        },
      })

      if (!container) throw new TRPCError({ code: "NOT_FOUND", message: "Container not found" })

      // If private, only admin (or your own ACL) should see
      if (!container.isPublic) {
        await requireAdmin(ctx)
      }

      return container
    }),

  create_container: permittedProcedure("media.admin.write")
    .input(ContainerCreateInput)
    .mutation(async ({ ctx, input }) => {

      try {
        const created = await ctx.db.mediaContainer.create({
          data: {
            slug: input.slug,
            title: input.title,
            description: input.description ?? null,
            thumbnail: input.thumbnail ?? null,
            banner: input.banner ?? null,
            poster: input.poster ?? null,
            color: (input.color ?? null) as any,
            type: input.type,
            genres: input.genres ?? [],
            isPublic: input.isPublic ?? true,
            isLive: input.isLive ?? false,
          },
        })
        return created
      } catch (e: any) {
        // Unique constraint (slug)
        if (e?.code === "P2002") {
          throw new TRPCError({ code: "CONFLICT", message: "Slug already exists" })
        }
        throw e
      }
    }),

  update_container: permittedProcedure("media.admin.write")
    .input(ContainerUpdateInput)
    .mutation(async ({ ctx, input }) => {

      // Ensure exists (and gives nicer errors than raw prisma)
      const existing = await ctx.db.mediaContainer.findUnique({ where: { id: input.id } })
      if (!existing) throw new TRPCError({ code: "NOT_FOUND", message: "Container not found" })

      try {
        return await ctx.db.mediaContainer.update({
          where: { id: input.id },
          data: {
            slug: input.slug,
            title: input.title,
            description: input.description,
            thumbnail: input.thumbnail,
            logo: input.logo,
            banner: input.banner,
            poster: input.poster,
            color: input.color as any,
            type: input.type,
            genres: input.genres,
            isPublic: input.isPublic,
            isLive: input.isLive,
          },
        })
      } catch (e: any) {
        if (e?.code === "P2002") {
          throw new TRPCError({ code: "CONFLICT", message: "Slug already exists" })
        }
        throw e
      }
    }),

  delete_container: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await requireAdmin(ctx)

      const existing = await ctx.db.mediaContainer.findUnique({ where: { id: input.id } })
      if (!existing) throw new TRPCError({ code: "NOT_FOUND", message: "Container not found" })

      // Cascades seasons/episodes via schema (onDelete: Cascade)
      await ctx.db.mediaContainer.delete({ where: { id: input.id } })
      return { ok: true }
    }),

  /* -------------------------------- Seasons ------------------------------- */

  list_seasons: protectedProcedure
    .input(z.object({ containerId: z.string() }))
    .query(async ({ ctx, input }) => {
      const container = await ctx.db.mediaContainer.findUnique({
        where: { id: input.containerId },
        select: { id: true, isPublic: true },
      })
      if (!container) throw new TRPCError({ code: "NOT_FOUND", message: "Container not found" })
      if (!container.isPublic) await requireAdmin(ctx)

      return ctx.db.mediaSeason.findMany({
        where: { containerId: input.containerId },
        orderBy: [{ seasonNumber: "desc" }, { createdAt: "desc" }],
        include: { _count: { select: { episodes: true } } },
      })
    }),

  get_season: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const season = await ctx.db.mediaSeason.findUnique({
        where: { id: input.id },
        include: {
          container: { select: { id: true, isPublic: true } },
          episodes: { orderBy: [{ episodeNumber: "desc" }, { createdAt: "desc" }] },
        },
      })
      if (!season) throw new TRPCError({ code: "NOT_FOUND", message: "Season not found" })
      if (!season.container.isPublic) await requireAdmin(ctx)
      return season
    }),

  create_season: permittedProcedure("media.admin.write")
    .input(SeasonCreateInput)
    .mutation(async ({ ctx, input }) => {
      const container = await ctx.db.mediaContainer.findUnique({ where: { id: input.containerId } })
      if (!container) throw new TRPCError({ code: "NOT_FOUND", message: "Container not found" })

      try {
        return await ctx.db.mediaSeason.create({
          data: {
            containerId: input.containerId,
            title: input.title ?? null,
            seasonNumber: input.seasonNumber ?? null,
            description: input.description ?? null,
            thumbnail: input.thumbnail ?? null,
          },
        })
      } catch (e: any) {
        // @@unique([containerId, seasonNumber])
        if (e?.code === "P2002") {
          throw new TRPCError({ code: "CONFLICT", message: "Season number already exists for this container" })
        }
        throw e
      }
    }),

  update_season: permittedProcedure("media.admin.write")
    .input(SeasonUpdateInput)
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.mediaSeason.findUnique({ where: { id: input.id } })
      if (!existing) throw new TRPCError({ code: "NOT_FOUND", message: "Season not found" })

      try {
        return await ctx.db.mediaSeason.update({
          where: { id: input.id },
          data: {
            title: input.title,
            seasonNumber: input.seasonNumber,
            description: input.description,
            thumbnail: input.thumbnail,
          },
        })
      } catch (e: any) {
        if (e?.code === "P2002") {
          throw new TRPCError({ code: "CONFLICT", message: "Season number already exists for this container" })
        }
        throw e
      }
    }),

  delete_season: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await requireAdmin(ctx)

      const existing = await ctx.db.mediaSeason.findUnique({ where: { id: input.id } })
      if (!existing) throw new TRPCError({ code: "NOT_FOUND", message: "Season not found" })

      await ctx.db.mediaSeason.delete({ where: { id: input.id } })
      return { ok: true }
    }),

  /* ------------------------------- Episodes ------------------------------- */

  list_episodes: publicProcedure
    .input(z.object({ seasonId: z.string() }))
    .query(async ({ ctx, input }) => {
      const season = await ctx.db.mediaSeason.findUnique({
        where: { id: input.seasonId },
        include: { container: { select: { isPublic: true } } },
      })
      if (!season) throw new TRPCError({ code: "NOT_FOUND", message: "Season not found" })
      if (!season.container.isPublic) await requireAdmin(ctx)

      return ctx.db.mediaEpisode.findMany({
        where: { seasonId: input.seasonId },
        orderBy: [{ episodeNumber: "desc" }, { createdAt: "desc" }],
      })
    }),

  get_episode: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const ep = await ctx.db.mediaEpisode.findUnique({
        where: { id: input.id },
        include: {
          season: { include: { container: { select: { isPublic: true } } } },
        },
      })
      if (!ep) throw new TRPCError({ code: "NOT_FOUND", message: "Episode not found" })
      if (!ep.season.container.isPublic) await requireAdmin(ctx)
      return ep
    }),

  create_episode: permittedProcedure("media.admin.write")
    .input(EpisodeCreateInput)
    .mutation(async ({ ctx, input }) => {

      const season = await ctx.db.mediaSeason.findUnique({ where: { id: input.seasonId }, include: { _count: { select: { episodes: true }}} })
      if (!season) throw new TRPCError({ code: "NOT_FOUND", message: "Season not found" })

      const episodeCount = season._count.episodes

      try {
        return await ctx.db.mediaEpisode.create({
          data: {
            seasonId: input.seasonId,
            title: input.title,
            description: input.description ?? null,
            thumbnail: input.thumbnail ?? null,
            episodeNumber: input.episodeNumber ?? episodeCount + 1,
            airDate: input.airDate ?? null,
            durationSec: input.durationSec ?? null,
            videoSrc: input.videoSrc ?? "",
            isLive: input.isLive ?? false,
          },
        })
      } catch (e: any) {
        // @@unique([seasonId, episodeNumber])
        if (e?.code === "P2002") {
          throw new TRPCError({ code: "CONFLICT", message: "Episode number already exists for this season" })
        }
        throw e
      }
    }),

  update_episode: permittedProcedure("media.admin.write")
    .input(EpisodeUpdateInput)
    .mutation(async ({ ctx, input }) => {

      const existing = await ctx.db.mediaEpisode.findUnique({ where: { id: input.id } })
      if (!existing) throw new TRPCError({ code: "NOT_FOUND", message: "Episode not found" })

      try {
        return await ctx.db.mediaEpisode.update({
          where: { id: input.id },
          data: {
            title: input.title,
            description: input.description,
            thumbnail: input.thumbnail,
            episodeNumber: input.episodeNumber,
            airDate: input.airDate,
            durationSec: input.durationSec,
            videoSrc: input.videoSrc,
            isLive: input.isLive,
          },
        })
      } catch (e: any) {
        if (e?.code === "P2002") {
          throw new TRPCError({ code: "CONFLICT", message: "Episode number already exists for this season" })
        }
        throw e
      }
    }),

  delete_episode: permittedProcedure("media.admin.write")
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.mediaEpisode.findUnique({ where: { id: input.id } })
      if (!existing) throw new TRPCError({ code: "NOT_FOUND", message: "Episode not found" })

      await ctx.db.mediaEpisode.delete({ where: { id: input.id } })
      return { ok: true }
    }),

  /* ----------------------------- Convenience ------------------------------ */

  /**
   * For a “Netflix-like” homepage:
   * - latest containers
   * - trending/live containers
   * - recently added episodes
   */
  home: protectedProcedure
    .input(
      z.object({
        limitContainers: z.number().int().min(1).max(50).default(12),
        limitEpisodes: z.number().int().min(1).max(50).default(12),
      })
    )
    .query(async ({ ctx, input }) => {
      const containers = await ctx.db.mediaContainer.findMany({
        where: { isPublic: true },
        take: input.limitContainers,
        orderBy: [{ createdAt: "desc" }],
        include: { _count: { select: { seasons: true } } },
      })

      const live = await ctx.db.mediaContainer.findMany({
        where: { isPublic: true, isLive: true },
        take: Math.min(8, input.limitContainers),
        orderBy: [{ updatedAt: "desc" }],
      })

      const latestEpisodes = await ctx.db.mediaEpisode.findMany({
        take: input.limitEpisodes,
        orderBy: [{ createdAt: "desc" }],
        include: {
          season: {
            include: {
              container: { select: { id: true, slug: true, title: true, poster: true, thumbnail: true, isPublic: true } },
            },
          },
        },
      })

      // Filter out episodes whose containers are not public
      const latestPublicEpisodes = latestEpisodes.filter((e) => e.season.container.isPublic)

      return { containers, live, latestEpisodes: latestPublicEpisodes }
    }),

  // Admin – list recent episodes (no filtering)
admin_list_recent_episodes: permittedProcedure("media.admin.read")
  .query(async ({ ctx }) => {
    return ctx.db.mediaEpisode.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        season: {
          include: {
            container: {
              select: { id: true, title: true },
            },
          },
        },
      },
    })
  }),
})
