"use client";

import { useState, type ReactNode } from "react";
import { api } from "@/trpc/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/use-theme";
import { Palette } from "lucide-react";

const COLORS = [
  "#3B82F6", // blue
  "#6366F1", // indigo
  "#8B5CF6", // purple
  "#EC4899", // pink
  "#EF4444", // red
  "#F97316", // orange
  "#F59E0B", // amber
  "#84CC16", // lime
  "#10B981", // emerald
  "#14B8A6", // teal
  "#06B6D4", // cyan
  "#475569", // slate
];

interface CreateBoardDialogProps {
  children?: ReactNode;
  projectId: string;
  parentId?: string | null;
}

export default function CreateBoardDialog({ children, projectId, parentId = null }: CreateBoardDialogProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [open, setOpen] = useState(false);

  const utils = api.useUtils();
  const createBoard = api.board.create.useMutation({
    onSuccess: () => {
      utils.board.list.invalidate({ projectId, parentId });
      setName("");
      setColor(COLORS[0]);
      setOpen(false);
    },
  });

  const { colors } = useTheme();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children ?? (
          <Button
            className={cn(
              colors.components.dialog.button,
              "cursor-pointer rounded-xl h-full w-auto aspect-square"
            )}
          >
            New Board
          </Button>
        )}
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Board</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            createBoard.mutate({ name, color, projectId, parentId });
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium mb-1">Board name</label>
            <Input
              placeholder="Enter board name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Color</label>
            <div className="grid grid-cols-6 gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  style={{ backgroundColor: c }}
                  className={cn(
                    "h-8 cursor-pointer rounded-lg border-2 transition-all",
                    color === c
                      ? "border-white scale-110 shadow-md"
                      : "border-transparent opacity-80 hover:opacity-100"
                  )}
                  aria-label={`Select color ${c}`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2 mt-2 text-sm text-neutral-400">
              <Palette size={14} />
              <span>{color}</span>
            </div>
          </div>

          {createBoard.error?.message && (
            <p className="text-sm text-red-600">{createBoard.error.message}</p>
          )}

          <Button
            type="submit"
            disabled={createBoard.isPending}
            className="w-full mt-2"
            style={{ backgroundColor: color, color: "white" }}
          >
            {createBoard.isPending ? "Creating..." : "Create Board"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
