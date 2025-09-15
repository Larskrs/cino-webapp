"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { PlusSquare } from "lucide-react";
import { Label } from "@/components/ui/label";

export function CreatePostDialog({ className }: { className?: string }) {
  const utils = api.useUtils();
  const [body, setBody] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [open, setOpen] = useState(false);

  const createPost = api.post.create.useMutation({
    onSuccess: async () => {
      await utils.post.list.invalidate();
      setBody("");
      setErrorMsg("");
      setOpen(false); // close dialog on success
    },
    onError: (error) => {
      setErrorMsg(error.message || "Failed to create post");
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild className={cn("cursor-pointer", className)}>
        <Button>
          <PlusSquare />
          Write Post
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Post</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            createPost.mutate({ body });
          }}
          className="w-full max-w-md flex flex-col gap-3"
        >
          <Input
            type="text"
            placeholder="Post content..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
          />

          {errorMsg && (
            <Label className="text-red-500 text-sm">{errorMsg}</Label>
          )}

          <Button type="submit" disabled={createPost.isPending}>
            {createPost.isPending ? "Creating..." : "Create Post"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
