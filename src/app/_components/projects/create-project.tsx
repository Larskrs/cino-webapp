"use client";

import { useState, type ReactNode } from "react";
import { api } from "@/trpc/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { PlusSquare } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useTheme } from "@/hooks/use-theme";

export function CreateProjectDialog({ className, children }: { className?: string, children: ReactNode }) {
  const utils = api.useUtils();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [open, setOpen] = useState(false);

  const createProject = api.projects.create.useMutation({
    onSuccess: async () => {
      await utils.projects.list.invalidate();
      setName("");
      setDescription("");
      setErrorMsg("");
      setOpen(false); // close dialog on success
    },
    onError: (error) => {
      setErrorMsg(error.message || "Failed to create project");
    },
  });

  const { colors } = useTheme()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild className={cn("cursor-pointer", className)}>
        {children}
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Project</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            createProject.mutate({ name, description });
          }}
          className="w-full max-w-md flex flex-col gap-3"
        >
          <Label>Project Name</Label>
          <Input
            type="text"
            placeholder="My Awesome Project"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Label>Description</Label>
          <Input
            placeholder="Describe your project..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {errorMsg && (
            <Label className="text-red-500 text-sm">{errorMsg}</Label>
          )}

          <Button type="submit" disabled={createProject.isPending}>
            {createProject.isPending ? "Creating..." : "Create Project"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
