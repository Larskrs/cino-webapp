"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ProjectRole } from "@prisma/client";
import { User } from "lucide-react";

interface AddMemberDialogProps {
  projectId: string;
}

export default function AddMemberDialog({ projectId }: AddMemberDialogProps) {
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState<ProjectRole>("member");

  const utils = api.useUtils();
  const addMember = api.projects.add_member.useMutation({
    onSuccess: () => {
      utils.projects.get.invalidate({ projectId }); // Refresh project data
      setUserId("");
      setRole("member");
    },
  });

  return (
    <Dialog>
      <DialogTrigger className="cursor-pointer" asChild>
        <Button>
            <User />
            Invite
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite user</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            addMember.mutate({ projectId, userId, role });
          }}
          className="space-y-4"
        >
          <Input
            placeholder="Bruker-ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            required
          />

          <Select value={role} onValueChange={(v: ProjectRole) => setRole(v as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Velg rolle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="member">Member</SelectItem>
              <SelectItem value="guest">Guest</SelectItem>
            </SelectContent>
          </Select>

          {addMember.error?.message && (
            <p className="text-sm text-red-600">{addMember.error.message}</p>
          )}

          <Button type="submit" disabled={addMember.isPending}>
            {addMember.isPending ? "Legger til..." : "Legg til medlem"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
