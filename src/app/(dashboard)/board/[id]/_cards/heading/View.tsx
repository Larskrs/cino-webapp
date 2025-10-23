"use client";

export default function TextCardView({ card }: { card: any }) {
  return (
    <p className="text-2xl whitespace-pre-wrap break-words p-4">
      {card.content || "Double-click to edit..."}
    </p>
  );
}
