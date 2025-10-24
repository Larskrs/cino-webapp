"use client";

import { useState, useEffect } from "react";
import { api } from "@/trpc/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ProjectRole } from "@prisma/client";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/use-theme";
import { User } from "lucide-react";

interface AddMemberDialogProps {
  projectId: string;
}

export default function AddMemberDialog({ projectId }: AddMemberDialogProps) {
  const [query, setQuery] = useState("");
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState<ProjectRole>("member");

  const utils = api.useUtils();
  const addMember = api.projects.add_member.useMutation({
    onSuccess: () => {
      utils.projects.get.invalidate({ projectId });
      setQuery("");
      setUserId("");
      setRole("member");
    },
  });

  // --- Search users
  const { data: users, isFetching } = api.users.search.useQuery(
    { query },
    { enabled: query.length > 1 }
  );

  const { colors } = useTheme();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className={colors.components.dialog.button}>Add member</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite user</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!userId) return;
            addMember.mutate({ projectId, userId, role });
          }}
          className="space-y-4"
        >
          {/* 🔍 Search for user */}
          <div className="space-y-1">
            <Input
              placeholder="Søk etter brukernavn eller e-post"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query.length > 1 && (
              <div className="border rounded-md max-h-40 overflow-y-auto bg-popover">
                {isFetching && (
                  <p className="p-2 text-sm text-muted-foreground">Søker...</p>
                )}
                {!isFetching && users?.length === 0 && (
                  <p className="p-2 text-sm text-muted-foreground">Ingen brukere funnet</p>
                )}
                {users?.map((u) => (
                  <button
                    type="button"
                    key={u.id}
                    onClick={() => {
                      setUserId(u.id);
                      setQuery(u.name ?? u.email ?? "");
                    }}
                    className={cn(
                      "flex items-center gap-2 w-full text-left px-2 py-1.5 hover:bg-accent hover:text-accent-foreground",
                      userId === u.id && "bg-accent"
                    )}
                  >
                    {u.image ? (
                      <img
                        src={u.image}
                        alt={u.name ?? ""}
                        className="w-5 h-5 rounded-full"
                      />
                    ) : (
                      <User className="w-4 h-4 opacity-70" />
                    )}
                    <span className="truncate">{u.name || u.email}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 🎭 Select role */}
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

          <Button type="submit" disabled={addMember.isPending || !userId}>
            {addMember.isPending ? "Legger til..." : "Legg til medlem"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
