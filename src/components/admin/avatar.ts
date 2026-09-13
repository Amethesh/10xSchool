/** Shared avatar helpers for the admin surface. */

const AVATAR_TINTS = ["#f0df6e", "#cfe0b4", "#b4c48d", "#a6bedb", "#e8d0b8"];

/** Stable colour per person, so the same student looks the same everywhere. */
export const avatarTint = (seed: string) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + hash * 31;
  return AVATAR_TINTS[Math.abs(hash) % AVATAR_TINTS.length];
};

export const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
