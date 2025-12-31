export const userPermissions: Record<string, string[]> = {
  "cmfwq3xz90000w2ha6h9ibe7z": [
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
