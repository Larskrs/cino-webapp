"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

export type OklchColor = {
  background: string;
  primary: string;
  secondary: string;
  text: string;
};

interface OklchThemeEditorProps {
  value: OklchColor;
  onChange: (val: OklchColor) => void;
}

function fromOklch(color?: string | null): [number, number, number] {
  if (!color) return [0, 0, 0];

  const match = color.match(/oklch\(([^)]+)\)/);
  if (!match?.[1]) return [0, 0, 0];

  const parts = match[1]
    .trim()
    .split(/\s+/)
    .map(Number);

  if (parts.length !== 3 || parts.some(Number.isNaN)) {
    return [0, 0, 0];
  }

  return parts as [number, number, number];;
}


export function OklchThemeEditor({ value, onChange }: OklchThemeEditorProps) {
  const [lightness, setLightness] = useState(0.5);
  const [chroma, setChroma] = useState(0.2);
  const [hue, setHue] = useState(140);
  const [colors, setColors] = useState<OklchColor>(value);
  const [showRaw, setShowRaw] = useState(false);

useEffect(() => {
  const newColors = generateFromOklch(lightness, chroma, hue);
  if (!lightness && !chroma && !hue) { return }
  setColors(newColors);
  onChange(newColors); // <-- denne manglet
}, [lightness, chroma, hue]);

  const toOklch = (l: number, c: number, h: number) => `oklch(${l.toFixed(2)} ${c.toFixed(2)} ${h.toFixed(2)})`;

  const generateFromOklch = (l: number, c: number, h: number): OklchColor => {
    return {
      background: toOklch(l - 0.3, c * 0.5, h),
      secondary: toOklch(l - 0.35, c * 0.5, (h) % 360),
      primary: toOklch(l, c, h),
      text: toOklch(Math.min(1, l + 0.4), c * 0.25, (h) % 360),
    };
  };

  const updateColor = (key: keyof OklchColor, val: string) => {
    const updated = { ...colors, [key]: val };
    setColors(updated);
    onChange(updated);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label className="block mb-1">Lyshet ({(lightness * 100).toFixed(0)}%)</Label>
          <Slider min={0} max={1} step={0.01} value={[lightness]} onValueChange={([v]) => setLightness(v ?? 0)} />
        </div>
        <div>
          <Label className="block mb-1">Vibranse ({(chroma * 100).toFixed(0)}%)</Label>
          <Slider min={0} max={0.4} step={0.01} value={[chroma]} onValueChange={([v]) => setChroma(v ?? 0)} />
        </div>
        <div>
          <Label className="block mb-1">Farge ({hue}°)</Label>
          <Slider min={0} max={360} step={1} value={[hue]} onValueChange={([v]) => setHue(v ?? 0)} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(["background", "primary", "secondary", "text"] as const).map((key) => (
          <div className="" key={key}>
            <Label className="block mb-1 capitalize">{key}</Label>
            <div className="grid grid-cols-4 items-center gap-2">
              <div
                className={cn(showRaw ? "col-span-1" : "col-span-4" ,"h-8 rounded-md")}
                style={{ backgroundColor: colors[key] }}
              />
              {showRaw && (
                <Input
                  value={colors[key]}
                  className="col-span-3"
                  onChange={(e) => updateColor(key, e.target.value)}
                />
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-2">
        <Button className="bg-primary text-white hover:text-white hover:bg-primary/80" variant="ghost" size="sm" onClick={(e) => {e.preventDefault(); setShowRaw((v) => !v)}}>
          {showRaw ? "Skjul verdier" : "Vis oklch verdier"}
        </Button>
      </div>
    </div>
  );
}
