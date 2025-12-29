export type PosterFormats = {
  poster?: string
  banner?: string
  video?: string
}

export function getPoster(
  posters: PosterFormats,
  priority: Array<keyof PosterFormats>
): string {
  for (const key of priority) {
    if (posters?.[key]) return posters[key]
  }
  return ""
}
