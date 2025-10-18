"use client";

export default function TextCardView({ card }: { card: any }) {
  return (
    <p className="text-lg whitespace-pre-wrap break-words p-4">
      {card.content || "Double-click to edit..."}
    </p>
  );
}
