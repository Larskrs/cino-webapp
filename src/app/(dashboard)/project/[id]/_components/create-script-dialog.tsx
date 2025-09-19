"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { PlusSquare } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useTheme } from "@/hooks/use-theme";

export function CreateScriptDialog({
  projectId,
  className,
}: {
  projectId: string;
  className?: string;
}) {
  const utils = api.useUtils();
  const [title, setTitle] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [open, setOpen] = useState(false);

  const createScript = api.scripts.create.useMutation({
    onSuccess: async () => {
      await utils.scripts.list.invalidate();
      setTitle("");
      setErrorMsg("");
      setOpen(false); // close dialog on success
    },
    onError: (error) => {
      setErrorMsg(error.message || "Failed to create script");
    },
  });

  const { colors } = useTheme()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild className={cn("cursor-pointer", className)}>
        <Button className={colors.components.dialog.button}>
          <PlusSquare />
          New Script
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Script</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            createScript.mutate({ title, projectId });
          }}
          className="w-full max-w-md flex flex-col gap-2"
        >
          <Label>Name</Label>
          <Input
            type="text"
            placeholder="Draft 1..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          {errorMsg && (
            <Label className="text-red-500 text-sm">{errorMsg}</Label>
          )}

          <Button
            type="submit"
            disabled={createScript.isPending}
          >
            {createScript.isPending ? "Creating..." : "Create Script"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
