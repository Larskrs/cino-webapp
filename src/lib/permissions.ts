export const userPermissions: Record<string, string[]> = {
  "cmfwq3xz90000w2ha6h9ibe7z": [
    "media.admin.read",
    "media.admin.write",
    "media.episode.publish",
  ],
  "cmfslo6e400004btwpuruwj93": [
    "media.admin.read",
    "media.admin.write",
    "media.episode.publish",
  ],
  "cmksiwa6s0000ty0k0p6pnmez": [
    "media.admin.read",
    "media.admin.write",
    "media.episode.publish",
  ],
  "cmk1vlgmx0005tym4uxpyz3f2": [
    "media.admin.read",
    "media.admin.write",
    "media.episode.publish",
  ],
}

export function hasPermission(userId: string, permission: string): boolean {
  const perms = userPermissions[userId]
  if (!perms) return false

  return perms.includes(permission)
}
