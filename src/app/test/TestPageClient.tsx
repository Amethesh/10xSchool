"use client";

import { useEffect, useState } from "react";

interface Profile {
  id: string;
  full_name: string | null;
  total_score: number | null;
  email: string | null;
  student_id: string | null;
}

interface TestPageClientProps {
  profile: Profile;
}

const GAMES = [
  {
    id: "balloon-math",
    name: "Balloon Math",
    emoji: "🎈",
    description: "Pop balloons with the correct answer before they float away!",
    glowColor: "rgba(0,229,255,0.4)",
    borderColor: "rgba(0,229,255,0.3)",
    accentFrom: "#00e5ff",
    accentTo: "#0077ff",
    available: true,
    tag: "Play Now",
    badge: "🔥 Popular",
    src: "/games/balloon-math.html",
    age: "5–10",
    subject: "Math",
    scoreKey: "BALLOON_MATH_SCORE",
  },
  {
    id: "word-scramble",
    name: "Word Scramble",
    emoji: "🔤",
    description: "Unscramble science, math & geography vocabulary words!",
    glowColor: "rgba(191,95,255,0.4)",
    borderColor: "rgba(191,95,255,0.3)",
    accentFrom: "#bf5fff",
    accentTo: "#ff2d78",
    available: true,
    tag: "Play Now",
    badge: "🆕 New",
    src: "/games/word-scramble.html",
    age: "10–14",
    subject: "Vocabulary",
    scoreKey: "WORD_SCRAMBLE_SCORE",
  },
  {
    id: "speed-math",
    name: "Speed Math",
    emoji: "⚡",
    description: "Type answers to math questions before the timer runs out!",
    glowColor: "rgba(255,230,0,0.4)",
    borderColor: "rgba(255,230,0,0.3)",
    accentFrom: "#ffe600",
    accentTo: "#ff6b35",
    available: true,
    tag: "Play Now",
    badge: "🆕 New",
    src: "/games/speed-math.html",
    age: "10–14",
    subject: "Math",
    scoreKey: "SPEED_MATH_SCORE",
  },
  {
    id: "number-ninja",
    name: "Number Ninja",
    emoji: "🥷",
    description: "Judge equations as TRUE or FALSE — use keyboard or buttons!",
    glowColor: "rgba(255,45,120,0.4)",
    borderColor: "rgba(255,45,120,0.3)",
    accentFrom: "#ff2d78",
    accentTo: "#bf5fff",
    available: true,
    tag: "Play Now",
    badge: "🆕 New",
    src: "/games/number-ninja.html",
    age: "10–14",
    subject: "Logic",
    scoreKey: "NUMBER_NINJA_SCORE",
  },
];

function getInitials(name: string | null) {
  if (!name) return "S";
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

function getRank(score: number) {
  if (score >= 5000) return { label: "Math Legend",   emoji: "👑", color: "#ffe600" };
  if (score >= 2000) return { label: "Math Master",   emoji: "🏆", color: "#bf5fff" };
  if (score >= 1000) return { label: "Math Pro",      emoji: "⭐", color: "#00e5ff" };
  if (score >= 500)  return { label: "Math Wizard",   emoji: "🧙", color: "#39ff14" };
  if (score >= 100)  return { label: "Math Explorer", emoji: "🔭", color: "#ff6b35" };
  return                    { label: "Math Rookie",   emoji: "🌱", color: "#aaaaaa" };
}

interface LBEntry { name: string; score: number; level?: number; date: string; }

export default function TestPageClient({ profile }: TestPageClientProps) {
  const [gameScore, setGameScore]     = useState(0);
  const [gameLevel, setGameLevel]     = useState(1);
  const [gameBest,  setGameBest]      = useState(0);
  const [scoreAnim, setScoreAnim]     = useState(false);
  const [activeGame, setActiveGame]   = useState<string | null>(null);
  const [hoveredGame, setHoveredGame] = useState<string | null>(null);
  const [showLB, setShowLB]           = useState(false);
  const [lbData, setLbData]           = useState<{game: string; entries: LBEntry[]}[]>([]);

  const totalPoints = profile.total_score ?? 0;
  const rank = getRank(totalPoints);

  // Receive score updates from embedded game iframe
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      const types = GAMES.map(g => g.scoreKey);
      if (types.includes(e.data?.type)) {
        setGameScore(e.data.score ?? 0);
        setGameLevel(e.data.level ?? 1);
        setGameBest(e.data.best ?? 0);
        setScoreAnim(true);
        setTimeout(() => setScoreAnim(false), 700);
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  // Read best scores from localStorage
  useEffect(() => {
    const keys = ["balloonMathBest","wordScrambleBest","speedMathBest","numberNinjaBest"];
    const best = Math.max(...keys.map(k => parseInt(localStorage.getItem(k) || "0")));
    if (best > 0) setGameBest(best);
  }, []);

  const handlePlay = (gameId: string) => {
    setActiveGame(gameId);
    setGameScore(0);
    setGameLevel(1);
    setTimeout(() => {
      document.getElementById("game-section")?.scrollIntoView({ behavior: "smooth" });
    }, 80);
  };

  const openLeaderboard = () => {
    const lbKeys: Record<string,string> = {
      "balloon-math": "balloonMathLB",
      "word-scramble": "wordScrambleLB",
      "speed-math": "speedMathLB",
      "number-ninja": "numberNinjaLB",
    };
    const data = GAMES.filter(g => g.available).map(g => ({
      game: g.name + " " + g.emoji,
      entries: JSON.parse(localStorage.getItem(lbKeys[g.id]) || "[]") as LBEntry[],
    }));
    setLbData(data);
    setShowLB(true);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg,#07071a 0%,#0d1b2a 50%,#07071a 100%)",
      fontFamily: "'Fredoka','Nunito',sans-serif",
      position: "relative",
      overflowX: "hidden",
    }}>
      {/* Ambient glows */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        background: `
          radial-gradient(ellipse 70% 50% at 10% 90%,rgba(0,229,255,.07) 0%,transparent 55%),
          radial-gradient(ellipse 60% 40% at 90% 10%,rgba(255,45,120,.07) 0%,transparent 55%),
          radial-gradient(ellipse 50% 60% at 50% 50%,rgba(191,95,255,.04) 0%,transparent 65%)
        `,
      }}/>

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto", padding: "24px 16px 80px" }}>

        {/* ── Top Nav ── */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 36, flexWrap: "wrap", gap: 16,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 34 }}>🎮</span>
            <span style={{
              fontSize: 26, fontWeight: 800,
              background: "linear-gradient(135deg,#00e5ff,#bf5fff)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>10X Games</span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {["Dashboard", "Games"].map((item) => (
              <div key={item} style={{
                padding: "8px 18px", borderRadius: 50,
                background: item === "Games" ? "rgba(0,229,255,.15)" : "rgba(255,255,255,.05)",
                border: `1px solid ${item === "Games" ? "rgba(0,229,255,.4)" : "rgba(255,255,255,.1)"}`,
                color: item === "Games" ? "#00e5ff" : "rgba(255,255,255,.6)",
                fontSize: 14, fontWeight: 600, cursor: "pointer",
              }}>{item}</div>
            ))}
            <button
              onClick={openLeaderboard}
              style={{
                padding: "8px 18px", borderRadius: 50,
                background: "rgba(255,230,0,.1)", border: "1px solid rgba(255,230,0,.35)",
                color: "#ffe600", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
              }}
            >🏆 Leaderboard</button>
          </div>
        </div>

        {/* ── Player Card ── */}
        <div style={{
          background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.1)",
          borderRadius: 24, padding: "28px 32px", marginBottom: 32,
          backdropFilter: "blur(20px)", boxShadow: "0 0 60px rgba(0,229,255,.05)",
          display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 24,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{
              width: 76, height: 76, borderRadius: "50%",
              background: "linear-gradient(135deg,#00e5ff,#bf5fff)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 28, fontWeight: 900, color: "#000",
              boxShadow: "0 0 32px rgba(0,229,255,.45)", flexShrink: 0,
            }}>{getInitials(profile.full_name)}</div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#fff", lineHeight: 1.2 }}>
                {profile.full_name ?? "Student"}
              </div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,.4)", marginTop: 3 }}>{profile.email}</div>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 6, marginTop: 8,
                padding: "4px 14px", background: "rgba(255,255,255,.06)",
                border: `1px solid ${rank.color}44`, borderRadius: 50,
              }}>
                <span>{rank.emoji}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: rank.color }}>{rank.label}</span>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            {[
              { label: "Total Points", value: totalPoints.toLocaleString(), color: "#00e5ff", bg: "rgba(0,229,255,.08)", border: "rgba(0,229,255,.2)", glow: false },
              { label: "Game Score",   value: gameScore.toLocaleString(),   color: "#39ff14", bg: scoreAnim ? "rgba(57,255,20,.14)" : "rgba(57,255,20,.06)", border: scoreAnim ? "rgba(57,255,20,.55)" : "rgba(57,255,20,.2)", glow: scoreAnim },
              { label: "Best Score",   value: gameBest.toLocaleString(),    color: "#ffe600", bg: "rgba(255,230,0,.08)", border: "rgba(255,230,0,.2)", glow: false },
              { label: "Level",        value: String(gameLevel),            color: "#bf5fff", bg: "rgba(191,95,255,.08)", border: "rgba(191,95,255,.2)", glow: false },
            ].map(({ label, value, color, bg, border, glow }) => (
              <div key={label} style={{
                background: bg, border: `1px solid ${border}`,
                borderRadius: 16, padding: "14px 22px", textAlign: "center", minWidth: 110,
                transition: "all .3s", boxShadow: glow ? `0 0 28px ${color}55` : "none",
              }}>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,.4)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 30, fontWeight: 900, color, textShadow: `0 0 18px ${color}` }}>{value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Games Grid ── */}
        <div style={{ marginBottom: activeGame ? 32 : 48 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#fff" }}>🕹️ Games</div>
            <div style={{
              padding: "3px 12px", borderRadius: 50,
              background: "rgba(0,229,255,.1)", border: "1px solid rgba(0,229,255,.25)",
              fontSize: 12, color: "#00e5ff", fontWeight: 700,
            }}>{GAMES.filter(g => g.available).length} Available</div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 18 }}>
            {GAMES.map((game) => {
              const isHovered = hoveredGame === game.id;
              const isActive  = activeGame === game.id;
              return (
                <div
                  key={game.id}
                  onMouseEnter={() => setHoveredGame(game.id)}
                  onMouseLeave={() => setHoveredGame(null)}
                  style={{
                    background: "rgba(255,255,255,.04)",
                    border: `1px solid ${isActive ? game.glowColor : isHovered ? game.glowColor : game.borderColor}`,
                    borderRadius: 22, padding: "26px 22px",
                    position: "relative", overflow: "hidden",
                    transition: "all .25s ease",
                    transform: isHovered || isActive ? "translateY(-4px) scale(1.02)" : "scale(1)",
                    boxShadow: isActive ? `0 0 48px ${game.glowColor}` : isHovered ? `0 14px 40px ${game.glowColor}` : "none",
                  }}
                >
                  {/* Top accent bar */}
                  <div style={{
                    position: "absolute", top: 0, left: 0, right: 0, height: 3,
                    background: `linear-gradient(90deg,${game.accentFrom},${game.accentTo})`,
                    borderRadius: "22px 22px 0 0",
                  }}/>

                  {/* Active dot */}
                  {isActive && (
                    <div style={{
                      position: "absolute", top: 14, right: 14,
                      width: 10, height: 10, borderRadius: "50%",
                      background: "#39ff14", boxShadow: "0 0 10px #39ff14",
                    }}/>
                  )}

                  {/* Badge */}
                  {game.badge && !isActive && (
                    <div style={{
                      position: "absolute", top: 14, right: 14,
                      padding: "3px 10px", borderRadius: 50,
                      background: "rgba(255,45,120,.15)", border: "1px solid rgba(255,45,120,.35)",
                      fontSize: 11, color: "#ff2d78", fontWeight: 700,
                    }}>{game.badge}</div>
                  )}

                  <div style={{ fontSize: 44, marginBottom: 10 }}>{game.emoji}</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", marginBottom: 4 }}>{game.name}</div>
                  <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                    <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 50, background: "rgba(255,255,255,.07)", color: "rgba(255,255,255,.5)", fontWeight: 700 }}>
                      📚 {game.subject}
                    </span>
                    <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 50, background: "rgba(255,255,255,.07)", color: "rgba(255,255,255,.5)", fontWeight: 700 }}>
                      👦 Age {game.age}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,.48)", marginBottom: 18, lineHeight: 1.5 }}>
                    {game.description}
                  </div>

                  <button
                    onClick={() => isActive ? setActiveGame(null) : handlePlay(game.id)}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 7,
                      padding: "10px 22px", borderRadius: 50, border: "none",
                      background: isActive
                        ? "rgba(255,45,120,.15)"
                        : `linear-gradient(135deg,${game.accentFrom},${game.accentTo})`,
                      color: isActive ? "#ff2d78" : "#000",
                      fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "inherit",
                      boxShadow: isActive ? "none" : `0 6px 24px ${game.glowColor}`,
                      transition: "all .2s",
                    }}
                  >
                    {isActive ? "✕ Close" : `▶ ${game.tag}`}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Embedded Game ── */}
        {activeGame && (
          <div id="game-section">
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              marginBottom: 14, flexWrap: "wrap", gap: 12,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>
                  {GAMES.find(g => g.id === activeGame)?.emoji}{" "}
                  {GAMES.find(g => g.id === activeGame)?.name}
                </span>
                <div style={{
                  display: "flex", alignItems: "center", gap: 5,
                  padding: "4px 12px", borderRadius: 50,
                  background: "rgba(57,255,20,.1)", border: "1px solid rgba(57,255,20,.3)",
                  fontSize: 12, color: "#39ff14", fontWeight: 700,
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#39ff14", display: "inline-block" }}/>
                  Live
                </div>
              </div>
              <button
                onClick={() => setActiveGame(null)}
                style={{
                  padding: "8px 20px", borderRadius: 50, border: "1px solid rgba(255,45,120,.35)",
                  background: "rgba(255,45,120,.1)", color: "#ff2d78",
                  fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                }}
              >✕ Close Game</button>
            </div>

            <div style={{
              borderRadius: 24, overflow: "hidden",
              border: `1px solid ${GAMES.find(g => g.id === activeGame)?.borderColor || "rgba(255,255,255,.1)"}`,
              boxShadow: `0 0 80px ${GAMES.find(g => g.id === activeGame)?.glowColor || "rgba(0,229,255,.1)"}`,
            }}>
              <iframe
                key={activeGame}
                src={GAMES.find(g => g.id === activeGame)?.src}
                style={{ width: "100%", height: "640px", border: "none", display: "block", background: "#07071a" }}
                title={GAMES.find(g => g.id === activeGame)?.name}
                allow="autoplay"
              />
            </div>
            <div style={{ marginTop: 10, textAlign: "center", fontSize: 13, color: "rgba(255,255,255,.3)" }}>
              🎯 Score updates live in your stats above as you play!
            </div>
          </div>
        )}

        {/* ── Empty state ── */}
        {!activeGame && (
          <div style={{
            textAlign: "center", padding: "48px 24px",
            background: "rgba(255,255,255,.02)", border: "1px dashed rgba(255,255,255,.1)", borderRadius: 24,
          }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎮</div>
            <div style={{ fontSize: 20, fontWeight: 600, color: "rgba(255,255,255,.45)" }}>
              Click <strong style={{ color: "#00e5ff" }}>Play Now</strong> on a game above to start!
            </div>
          </div>
        )}
      </div>

      {/* ── Leaderboard Modal ── */}
      {showLB && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 1000,
          background: "rgba(7,7,26,.95)", backdropFilter: "blur(24px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
        }} onClick={() => setShowLB(false)}>
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.1)",
              borderRadius: 28, padding: "36px 40px", maxWidth: 680, width: "100%",
              maxHeight: "85vh", overflowY: "auto",
              boxShadow: "0 0 80px rgba(255,230,0,.1)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <div style={{ fontSize: 26, fontWeight: 900, color: "#fff" }}>🏆 Leaderboard</div>
              <button
                onClick={() => setShowLB(false)}
                style={{ padding: "6px 16px", borderRadius: 50, border: "1px solid rgba(255,255,255,.15)", background: "rgba(255,255,255,.06)", color: "rgba(255,255,255,.6)", cursor: "pointer", fontFamily: "inherit", fontSize: 13 }}
              >✕ Close</button>
            </div>

            {lbData.map(({ game, entries }) => (
              <div key={game} style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#fff", marginBottom: 10 }}>{game}</div>
                {entries.length === 0 ? (
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,.3)", padding: "10px 0" }}>No scores yet — be the first!</div>
                ) : (
                  entries.map((e, i) => {
                    const medals = ["🥇","🥈","🥉"];
                    return (
                      <div key={i} style={{
                        display: "flex", alignItems: "center", gap: 12,
                        padding: "10px 16px", borderRadius: 12,
                        background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)",
                        marginBottom: 6,
                      }}>
                        <div style={{ fontSize: 18, width: 28 }}>{medals[i] || `#${i+1}`}</div>
                        <div style={{ flex: 1, fontSize: 14, color: "#fff", fontWeight: 700 }}>
                          {e.name}
                          <span style={{ fontSize: 11, color: "rgba(255,255,255,.35)", marginLeft: 8 }}>
                            {e.level ? `Lv.${e.level} · ` : ""}{e.date}
                          </span>
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 900, color: "#ffe600" }}>{e.score}</div>
                      </div>
                    );
                  })
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;700&family=Nunito:wght@700;800;900&display=swap');
      `}</style>
    </div>
  );
}
