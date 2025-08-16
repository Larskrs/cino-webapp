"use client";
import { type LineTypeKey, LINE_TYPES } from "./types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function EditorToolbar({
  currentLineType,
  setCurrentLineType,
  onTypeChange
}: {
  currentLineType: LineTypeKey;
  setCurrentLineType: (type: LineTypeKey) => void;
  onTypeChange: (type: LineTypeKey) => void;
}) {
  const lineTypes: LineTypeKey[] = ["scene_header", "action", "character", "dialog"];

  return (
    <TooltipProvider>
      <div className="flex left-0 gap-2 mb-4 fixed top-16 z-10 w-screen  bg-gray-800 p-2 rounded">
        {lineTypes.map((type, i) => {
          const Icon = LINE_TYPES[type].icon;
          return (
            <Tooltip key={type}>
              <TooltipTrigger asChild>
                <button
                  className={cn(
                    "cursor-pointer px-3 py-1 rounded flex items-center justify-center text-gray-300",
                    currentLineType === type && "bg-blue-600 text-white"
                  )}
                  onClick={() => {
                    setCurrentLineType(type);
                    onTypeChange(type);
                  }}
                >
                  <Icon className="w-6 h-6" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{LINE_TYPES[type].displayName}</p>
                <p className="text-white/50">ALT/CTRL + {i + 1}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
