import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { roles } from "@/lib/roles";
import type { ProjectRole } from "@prisma/client";

const RoleEnum = z.enum(roles);
type Role = z.infer<typeof RoleEnum>; // "admin" | "manager" | "member" | "guest"

function canAssignRole(assignerRole: Role, targetRole: Role) {
  return roles.indexOf(targetRole) > roles.indexOf(assignerRole);
}

export const projectRouter = createTRPCRouter({
  // List all projects the current user is a member of
  list: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const projects = await ctx.db.project.findMany({
      where: {
        members: { some: { userId } },
      },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, image: true } },
          },
        },
        _count: { select: { files: true, scripts: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return projects;
  }),

  listAll: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const projects = await ctx.db.project.findMany({
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, image: true } },
          },
        },
        _count: { select: { files: true, scripts: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return projects;
  }),

  get: protectedProcedure.input(
      z.object({
        projectId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
        const userId = ctx.session.user.id;
        
        const projects = await ctx.db.project.findUnique({
          where: {
            members: { some: { userId } },
            id: input.projectId
          },
          include: {
            members: {
              include: {
                user: { select: { id: true, name: true, email: true, image: true } },
              },
            },
            _count: { select: { files: true, scripts: true } },
          },
        });
    
        return projects;
    }
  ),

  // Create a new project and add current user as an admin
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Project name is required"),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const project = await ctx.db.project.create({
        data: {
          name: input.name,
          description: input.description ?? "",
          members: { create: { userId, role: "admin" } },
        },
      });

      return project;
    }),

  // Add a new member
  add_member: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        userId: z.string(),
        role: RoleEnum,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const currentUserId = ctx.session.user.id;

      const currentMember = await ctx.db.projectMember.findUnique({
        where: { userId_projectId: { userId: currentUserId, projectId: input.projectId } },
      });

      if (!currentMember) throw new TRPCError({ code: "FORBIDDEN", message: "Not a member of this project" });

      // Can't assign role equal or higher than self
      if (!canAssignRole(currentMember.role, input.role)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Cannot assign a role equal or higher than your own" });
      }

      // Ensure the user being added isn't already a member
      const existingMember = await ctx.db.projectMember.findUnique({
        where: { userId_projectId: { userId: input.userId, projectId: input.projectId } },
      });
      if (existingMember) {
        throw new TRPCError({ code: "CONFLICT", message: "User is already a member" });
      }

      const member = await ctx.db.projectMember.create({
        data: { userId: input.userId, projectId: input.projectId, role: input.role },
      });

      return member;
    }),

  // Update a member's role
  update_member_role: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        userId: z.string(),
        role: RoleEnum,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const currentUserId = ctx.session.user.id;

      // Cannot update your own role
      if (currentUserId === input.userId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Cannot update your own role" });
      }

      const currentMember = await ctx.db.projectMember.findUnique({
        where: { userId_projectId: { userId: currentUserId, projectId: input.projectId } },
      });
      if (!currentMember) throw new TRPCError({ code: "FORBIDDEN", message: "Not a member of this project" });

      // Only assign roles lower than your own
      if (!canAssignRole(currentMember.role, input.role)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Cannot assign a role equal or higher than your own" });
      }

      const member = await ctx.db.projectMember.update({
        where: { userId_projectId: { userId: input.userId, projectId: input.projectId } },
        data: { role: input.role },
      });

      return member;
    }),
});
