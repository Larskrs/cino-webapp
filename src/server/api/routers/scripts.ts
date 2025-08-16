import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";

// ------------------ SCRIPT ROUTER ------------------

export const scriptRouter = createTRPCRouter({

  // List all scripts in a project
  list: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      const scripts = await ctx.db.script.findMany({
        where: { projectId: input.projectId },
        include: { versions: true, _count: {
          select: {
            labels: true,
            versions: true
          }
        } },
      });
      return scripts;
    }),

  // Get full script with versions, scenes, and lines
  get: protectedProcedure
    .input(z.object({ scriptId: z.string() }))
    .query(async ({ ctx, input }) => {
      const script = await ctx.db.script.findUnique({
        where: { id: input.scriptId },
        include: {
          versions: {
            orderBy: { version: "desc" },
            include: {
              scenes: {
                orderBy: { orderIndex: "asc" },
                include: {
                  lines: { orderBy: { orderIndex: "asc" } },
                },
              },
            },
          },
        },
      });
      if (!script) throw new TRPCError({ code: "NOT_FOUND", message: "Script not found" });
      return script;
    }),

  // Create a new script
  create: protectedProcedure
    .input(z.object({ projectId: z.string(), title: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.script.create({
        data: { projectId: input.projectId, title: input.title, archived: false },
      });
    }),

  // Add a scene to a version
  add_scene: protectedProcedure
    .input(z.object({
      versionId: z.string(),
      title: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const sceneCount = await ctx.db.scene.count({ where: { versionId: input.versionId } });
      const scene = await ctx.db.scene.create({
        data: {
          versionId: input.versionId,
          title: input.title,
          sceneNumber: sceneCount + 1,
          orderIndex: sceneCount + 1,
        },
      });
      return scene;
    }),

  // Add a line to a scene
  add_line: protectedProcedure
    .input(z.object({
      sceneId: z.string(),
      type: z.string(),
      content: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const lineCount = await ctx.db.line.count({ where: { sceneId: input.sceneId } });
      return await ctx.db.line.create({
        data: {
          sceneId: input.sceneId,
          type: input.type,
          content: input.content ?? "",
          orderIndex: lineCount + 1,
        },
      });
    }),

  // Update a line
  update_line: protectedProcedure
    .input(z.object({
      lineId: z.string(),
      content: z.string(),
      type: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.line.update({
        where: { id: input.lineId },
        data: {
          content: input.content,
          type: input.type,
        },
      });
    }),

  // Delete a line
  delete_line: protectedProcedure
    .input(z.object({ lineId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.line.delete({ where: { id: input.lineId } });
      return { success: true };
    }),

  // Delete a scene (cascades lines)
  delete_scene: protectedProcedure
    .input(z.object({ sceneId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.scene.delete({ where: { id: input.sceneId } });
      return { success: true };
    }),

  // Create a new script version
  create_version: protectedProcedure
    .input(z.object({
      scriptId: z.string(),
      content: z.string(),
      version: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.scriptVersion.create({
        data: {
          scriptId: input.scriptId,
          content: input.content,
          version: input.version,
        },
      });
    }),

});