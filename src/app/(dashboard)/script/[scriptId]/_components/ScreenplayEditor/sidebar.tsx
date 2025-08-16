"use client";
import { type Scene } from "./types";
import { cn } from "@/lib/utils";

export function SceneSidebar({
  scenes,
  activeSceneId,
  onSceneClick
}: {
  scenes: Scene[];
  activeSceneId: string | null;
  onSceneClick: (id: string) => void;
}) {
  return (
    <aside className="bg-gray-800 fixed left-0 top-24 p-4 flex flex-col gap-2 border-r border-gray-700 min-h-screen">
      <h2 className="text-xs uppercase text-gray-400 mb-2">Scenes</h2>
      {scenes.map(scene => (
        <button
          key={scene.id}
          onClick={() => onSceneClick(scene.id)}
          className={cn(
            "text-left px-2 py-1 rounded transition-colors truncate",
            activeSceneId === scene.id
              ? "bg-blue-600 text-white"
              : "hover:bg-gray-700 text-gray-300"
          )}
        >
          {scene.title || "Untitled Scene"}
        </button>
      ))}
    </aside>
  );
}
