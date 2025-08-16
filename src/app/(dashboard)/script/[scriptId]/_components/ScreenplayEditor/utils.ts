// utils.ts
import type { Line } from "./types";

/**
 * Calculate A4 paper dimensions in pixels based on current width
 * while keeping the correct aspect ratio (1:1.4142).
 */
export function getPageDimensions(
  containerWidth: number,
  maxPageWidth: number = 794 // ~A4 width at 96dpi
) {
  const width = Math.min(containerWidth, maxPageWidth);
  const height = width * 1.4142;
  return { width, height };
}

/**
 * Split lines into pages based on estimated line height.
 */
export function paginateLines(
  lines: Line[],
  pageHeight: number,
  lineHeight: number
) {
  const pages: Line[][] = [];
  let currentPage: Line[] = [];
  let currentHeight = 0;

  lines.forEach((line) => {
    currentHeight += lineHeight;
    if (currentHeight > pageHeight) {
      pages.push(currentPage);
      currentPage = [];
      currentHeight = lineHeight;
    }
    currentPage.push(line);
  });

  if (currentPage.length > 0) {
    pages.push(currentPage);
  }

  return pages;
}

/**
 * Extract all scene headers from the list of lines
 * for use in the Scene Sidebar.
 */
export function getScenesFromLines(lines: Line[]) {
  return lines
    .filter((l) => l.type === "scene_header")
    .map((l) => ({
      id: l.id,
      title: l.content.trim() || "Untitled Scene",
    }));
}

/**
 * Scroll smoothly to the element with the given ID.
 */
export function scrollToElement(id: string) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

/**
 * Handle special screenplay formatting rules.
 * Example: Force uppercase after a scene header (INT./EXT.)
 */
export function formatLineContent(type: string, content: string) {
  if (type === "scene_header") {
    return content.toUpperCase();
  }
  return content;
}

/**
 * Generate a random ID for new lines.
 */
export function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

export function placeCaretAtEnd(el: HTMLElement) {
  el.focus();
  const range = document.createRange();
  range.selectNodeContents(el);
  range.collapse(false);
  const sel = window.getSelection();
  sel?.removeAllRanges();
  sel?.addRange(range);
}