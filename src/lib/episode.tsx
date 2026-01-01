export function formatEpisodeRef(
  seasonNumber?: number | null,
  episodeNumber?: number | null,
) {
  if (seasonNumber == null && episodeNumber == null) return null

  if (seasonNumber != null && episodeNumber != null) {
    return `s${seasonNumber}.e${episodeNumber}`
  }

  if (seasonNumber != null) return `s${seasonNumber}`
  if (episodeNumber != null) return `e${episodeNumber}`

  return null
}