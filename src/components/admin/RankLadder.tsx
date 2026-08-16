"use client";

/**
 * Rank shown as the ladder it actually is.
 *
 * NOVICE -> LEGEND is an ordered progression, so a coloured word-pill throws
 * away the one thing that matters: how far along a student is. Drawing it as
 * filled segments means a whole column can be compared at a glance.
 */

export const RANK_ORDER = [
  "NOVICE",
  "APPRENTICE",
  "ADEPT",
  "EXPERT",
  "MASTER",
  "LEGEND",
] as const;

export const rankIndex = (rank: string | null | undefined) =>
  RANK_ORDER.indexOf((rank || "").toUpperCase() as (typeof RANK_ORDER)[number]);

const titleCase = (rank: string) =>
  rank.charAt(0).toUpperCase() + rank.slice(1).toLowerCase();

type RankLadderProps = {
  rank: string | null | undefined;
};

const RankLadder = ({ rank }: RankLadderProps) => {
  const index = rankIndex(rank);
  const filled = index + 1;
  const isLegend = filled === RANK_ORDER.length;
  const label = rank ? titleCase(rank) : "Unranked";

  return (
    <div className="flex items-center gap-2.5">
      <div
        className="ac-ladder"
        role="img"
        aria-label={
          index < 0
            ? "Unranked"
            : `${label}, rank ${filled} of ${RANK_ORDER.length}`
        }
        style={
          isLegend
            ? ({ "--ac-seg": "#d9a441" } as React.CSSProperties)
            : undefined
        }
      >
        {RANK_ORDER.map((_, i) => (
          <span
            key={i}
            className={`ac-ladder-seg${i < filled ? " is-filled" : ""}`}
          />
        ))}
      </div>
      <span
        className={`text-[13px] ${
          isLegend ? "text-[#a97917] font-medium" : "text-[#8c8578]"
        }`}
      >
        {label}
      </span>
    </div>
  );
};

export default RankLadder;
