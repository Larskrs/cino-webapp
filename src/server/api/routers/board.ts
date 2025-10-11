import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";

// --- Schemas ---

const boardInput = z.object({
  name: z.string().min(1),
  color: z.string().optional(),
  projectId: z.string(),
  parentId: z.string().nullable().optional(), // for sub-boards
});

const cardInput = z.object({
  boardId: z.string(),
  title: z.string().min(1),
  content: z.string().optional(),
  type: z.string().optional(), // e.g. text, image, link
  color: z.string().optional(),
  x: z.number().nullable().optional(),
  y: z.number().nullable().optional(),
  width: z.number().nullable().optional(),
  height: z.number().nullable().optional(),
});

export const boardRouter = createTRPCRouter({
  // -------------------
  // BOARD ROUTES
  // -------------------

  // List all boards for a project or under a specific board
  list: protectedProcedure
    .input(
      z.object({
        projectId: z.string().optional(),
        parentId: z.string().nullable().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Ensure user is part of the project if projectId provided
      if (input.projectId) {
        const isMember = await ctx.db.projectMember.findUnique({
          where: {
            userId_projectId: {
              userId,
              projectId: input.projectId,
            },
          },
        });

        if (!isMember) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You are not a member of this project",
          });
        }
      }

      const boards = await ctx.db.board.findMany({
        where: {
          projectId: input.projectId ?? undefined,
          parentId: input.parentId ?? null,
        },
        include: {
          cards: true,
          children: true,
        },
        orderBy: { createdAt: "desc" },
      });

      return boards;
    }),

  get: protectedProcedure
    .input(z.object({ id: z.string()}))
    .query(async ({ ctx, input }) => {
      return await ctx.db.board.findUnique({
        where: {
          id: input.id
        },
      });
    }),

  // Create a new board
  create: protectedProcedure.input(boardInput).mutation(async ({ ctx, input }) => {
    const userId = ctx.session.user.id;

    // Ensure user is member of project
    const member = await ctx.db.projectMember.findUnique({
      where: { userId_projectId: { userId, projectId: input.projectId } },
    });
    if (!member) throw new TRPCError({ code: "FORBIDDEN", message: "Not a member of this project" });

    const board = await ctx.db.board.create({
      data: {
        name: input.name,
        color: input.color,
        projectId: input.projectId,
        parentId: input.parentId ?? null,
      },
    });

    return board;
  }),

  // Update board (name, color)
  update: protectedProcedure
    .input(
      z.object({
        boardId: z.string(),
        name: z.string().optional(),
        color: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const board = await ctx.db.board.update({
        where: { id: input.boardId },
        data: {
          name: input.name,
          color: input.color,
        },
      });

      return board;
    }),

  // -------------------
  // CARD ROUTES
  // -------------------

  // Create a new card
  create_card: protectedProcedure.input(cardInput).mutation(async ({ ctx, input }) => {
    const userId = ctx.session.user.id;

    // Ensure user can access the board's project
    const board = await ctx.db.board.findUnique({
      where: { id: input.boardId },
      include: { project: true },
    });
    if (!board) throw new TRPCError({ code: "NOT_FOUND", message: "Board not found" });

    const member = await ctx.db.projectMember.findUnique({
      where: { userId_projectId: { userId, projectId: board.projectId } },
    });
    if (!member) throw new TRPCError({ code: "FORBIDDEN", message: "Not a member of this project" });

    const card = await ctx.db.boardCard.create({
      data: {
        title: input.title,
        content: input.content,
        type: input.type,
        color: input.color,
        x: input.x,
        y: input.y,
        width: input.width,
        height: input.height,
        boardId: input.boardId,
      },
    });

    return card;
  }),

  // Update card content or position
  update_card: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().optional(),
        content: z.string().optional(),
        color: z.string().optional(),
        x: z.number().nullable().optional(),
        y: z.number().nullable().optional(),
        width: z.number().nullable().optional(),
        height: z.number().nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const card = await ctx.db.boardCard.update({
        where: { id: input.id },
        data: {
          title: input.title,
          content: input.content,
          color: input.color,
          x: input.x,
          y: input.y,
          width: input.width,
          height: input.height,
        },
      });

      return card;
    }),

  // Move card to another board
  move_card: protectedProcedure
    .input(
      z.object({
        cardId: z.string(),
        targetBoardId: z.string(),
        x: z.number().nullable().optional(),
        y: z.number().nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const card = await ctx.db.boardCard.update({
        where: { id: input.cardId },
        data: {
          boardId: input.targetBoardId,
          x: input.x ?? null,
          y: input.y ?? null,
        },
      });

      return card;
    }),

  // List all cards in a board
  list_cards: protectedProcedure
    .input(z.object({ boardId: z.string() }))
    .query(async ({ ctx, input }) => {
      const cards = await ctx.db.boardCard.findMany({
        where: { boardId: input.boardId },
        orderBy: { createdAt: "asc" },
      });

      return cards;
    }),
});
