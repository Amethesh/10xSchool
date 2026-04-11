'use client';

import React, { useState, useMemo, useCallback, useEffect, CSSProperties } from 'react';
import Link from 'next/link';

/* ─────────────────────────────────────────────────────────────────────────
   CONFIG
───────────────────────────────────────────────────────────────────────── */
const NUM_COLS = 15;

interface Cfg {
  beadD: number; beadStep: number;
  colW: number;  colGap: number; rodW: number;
  heavenPad: number; heavenH: number;
  dividerH: number;
  earthPad: number;  earthH: number;
  fPadX: number;     fPadY: number;
}

/* landscape mobile – optimised for ~390 px tall phones (iPhone 13/14 class) */
const LANDSCAPE: Cfg = {
  beadD: 26, beadStep: 32, colW: 48, colGap: 5, rodW: 6,
  heavenPad: 8, heavenH: 60, dividerH: 8, earthPad: 8, earthH: 150,
  fPadX: 12, fPadY: 7,
};

/* tiny – very short landscape screens (< 360 px tall, e.g. iPhone SE) */
const TINY: Cfg = {
  beadD: 20, beadStep: 25, colW: 38, colGap: 4, rodW: 5,
  heavenPad: 6, heavenH: 46, dividerH: 7, earthPad: 6, earthH: 118,
  fPadX: 10, fPadY: 6,
};

/* compact – portrait mobile (width < 640 px) */
const COMPACT: Cfg = {
  beadD: 30, beadStep: 37, colW: 50, colGap: 6, rodW: 7,
  heavenPad: 9, heavenH: 70, dividerH: 9, earthPad: 9, earthH: 182,
  fPadX: 14, fPadY: 10,
};

/* full – desktop / large tablet */
const FULL: Cfg = {
  beadD: 40, beadStep: 48, colW: 62, colGap: 8, rodW: 8,
  heavenPad: 12, heavenH: 100, dividerH: 12, earthPad: 12, earthH: 240,
  fPadX: 20, fPadY: 16,
};

/* ─────────────────────────────────────────────────────────────────────────
   COLUMN COLOURS  (15 rods, cycling palette)
───────────────────────────────────────────────────────────────────────── */
interface ColDef { active: string; dark: string; light: string; }

const PALETTE: ColDef[] = [
  { active: '#c026d3', dark: '#86198f', light: '#e879f9' },
  { active: '#7c3aed', dark: '#4c1d95', light: '#a78bfa' },
  { active: '#2563eb', dark: '#1e3a8a', light: '#60a5fa' },
  { active: '#0891b2', dark: '#164e63', light: '#67e8f9' },
  { active: '#059669', dark: '#064e3b', light: '#34d399' },
  { active: '#65a30d', dark: '#365314', light: '#a3e635' },
  { active: '#d97706', dark: '#78350f', light: '#fbbf24' },
  { active: '#ea580c', dark: '#7c2d12', light: '#fb923c' },
  { active: '#dc2626', dark: '#7f1d1d', light: '#f87171' },
  { active: '#db2777', dark: '#831843', light: '#f9a8d4' },
];

const COLS: ColDef[] = Array.from({ length: NUM_COLS }, (_, i) => PALETTE[i % PALETTE.length]);

/* Positional value: leftmost column = highest place value */
function colPlaceValue(i: number): number {
  return 10 ** (NUM_COLS - 1 - i);
}

/* ─────────────────────────────────────────────────────────────────────────
   FULLSCREEN HOOK
   Works on Android Chrome / desktop. iOS Safari doesn't support the API
   so the button is hidden there automatically.
───────────────────────────────────────────────────────────────────────── */
function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    const el = document.documentElement as HTMLElement & {
      webkitRequestFullscreen?: () => Promise<void>;
    };
    setSupported(!!(el.requestFullscreen || el.webkitRequestFullscreen));

    const onChange = () => {
      const doc = document as Document & { webkitFullscreenElement?: Element | null };
      setIsFullscreen(!!(document.fullscreenElement || doc.webkitFullscreenElement));
    };
    document.addEventListener('fullscreenchange', onChange);
    document.addEventListener('webkitfullscreenchange', onChange);
    return () => {
      document.removeEventListener('fullscreenchange', onChange);
      document.removeEventListener('webkitfullscreenchange', onChange);
    };
  }, []);

  const toggle = useCallback(async () => {
    const doc = document as Document & { webkitExitFullscreen?: () => Promise<void>; webkitFullscreenElement?: Element | null };
    const el  = document.documentElement as HTMLElement & { webkitRequestFullscreen?: () => Promise<void> };
    try {
      if (document.fullscreenElement || doc.webkitFullscreenElement) {
        await (document.exitFullscreen?.() ?? doc.webkitExitFullscreen?.());
      } else {
        await (el.requestFullscreen?.({ navigationUI: 'hide' }) ?? el.webkitRequestFullscreen?.());
      }
    } catch {
      /* silently ignore – browser denied or not supported */
    }
  }, []);

  return { isFullscreen, supported, toggle };
}

/* ─────────────────────────────────────────────────────────────────────────
   BEAD Y-POSITION HELPERS  (relative to column div top)
───────────────────────────────────────────────────────────────────────── */
function heavenY(active: boolean, c: Cfg): number {
  return active ? c.heavenH - c.beadD - 4 : c.heavenPad;
}

function earthBeadY(j: number, earth: number, c: Cfg): number {
  const zoneTop = c.heavenH + c.dividerH;
  if (j < earth) return zoneTop + c.earthPad + j * c.beadStep;
  return zoneTop + c.earthH - c.earthPad - c.beadD - (3 - j) * c.beadStep;
}

/* ─────────────────────────────────────────────────────────────────────────
   PAGE
───────────────────────────────────────────────────────────────────────── */
interface ColState { heaven: boolean; earth: number; }

export default function AbacusPage() {
  /* window dimensions – updated on resize / orientation-change */
  const [win, setWin] = useState({ w: 1280, h: 800 });
  useEffect(() => {
    const upd = () => setWin({ w: window.innerWidth, h: window.innerHeight });
    upd();
    window.addEventListener('resize', upd);
    window.addEventListener('orientationchange', () => setTimeout(upd, 120));
    return () => window.removeEventListener('resize', upd);
  }, []);

  const { isFullscreen, supported: fsSupported, toggle: toggleFullscreen } = useFullscreen();

  const isLandscapeMobile = win.w > win.h && win.h <= 500;
  const cfg: Cfg = isLandscapeMobile
    ? (win.h < 360 ? TINY : LANDSCAPE)
    : (win.w < 640 ? COMPACT : FULL);

  /* abacus state */
  const [cols, setCols] = useState<ColState[]>(() =>
    Array(NUM_COLS).fill(null).map(() => ({ heaven: false, earth: 0 }))
  );

  const total = useMemo(
    () => cols.reduce((s, c, i) => s + ((c.heaven ? 5 : 0) + c.earth) * colPlaceValue(i), 0),
    [cols],
  );

  const clickHeaven = useCallback((ci: number) => {
    setCols(p => p.map((c, i) => i === ci ? { ...c, heaven: !c.heaven } : c));
  }, []);

  const clickEarth = useCallback((ci: number, j: number) => {
    setCols(p => p.map((c, i) => {
      if (i !== ci) return c;
      return { ...c, earth: j < c.earth ? j : j + 1 };
    }));
  }, []);

  const reset = () => setCols(Array(NUM_COLS).fill(null).map(() => ({ heaven: false, earth: 0 })));

  const frameW = NUM_COLS * cfg.colW + (NUM_COLS - 1) * cfg.colGap + cfg.fPadX * 2;

  /* ── Abacus frame (shared between layouts) ─────────────────────────── */
  const abacusFrame = (
    <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
      <div style={{
        width: frameW,
        background: 'linear-gradient(150deg,#92400e 0%,#78350f 40%,#451a03 100%)',
        borderRadius: 20,
        padding: `${cfg.fPadY}px ${cfg.fPadX}px`,
        boxShadow: '0 16px 48px rgba(120,53,15,.45),0 6px 16px rgba(0,0,0,.28),inset 0 1px 0 rgba(255,200,80,.18)',
      }}>
        <HRail />

        {/* Columns + divider */}
        <div style={{ position: 'relative', display: 'flex', gap: cfg.colGap, margin: `${isLandscapeMobile ? 5 : 10}px 0` }}>
          <div style={{
            position: 'absolute', left: 0, right: 0,
            top: cfg.heavenH, height: cfg.dividerH,
            background: 'linear-gradient(180deg,#1c0a00 0%,#92400e 50%,#1c0a00 100%)',
            borderRadius: 4,
            boxShadow: 'inset 0 2px 5px rgba(0,0,0,.65),0 2px 0 rgba(255,180,60,.14)',
            zIndex: 10, pointerEvents: 'none',
          }} />

          {COLS.map((col, ci) => (
            <AbacusColumn
              key={ci}
              col={col}
              state={cols[ci]}
              cfg={cfg}
              onHeavenClick={() => clickHeaven(ci)}
              onEarthClick={j => clickEarth(ci, j)}
            />
          ))}
        </div>

        <HRail />

        {/* Column digit readout – no place-value label */}
        <div style={{ display: 'flex', gap: cfg.colGap, marginTop: isLandscapeMobile ? 4 : 7 }}>
          {COLS.map((col, ci) => {
            const digit = (cols[ci].heaven ? 5 : 0) + cols[ci].earth;
            return (
              <div key={ci} style={{
                width: cfg.colW, textAlign: 'center', flexShrink: 0,
                fontWeight: 900,
                fontSize: isLandscapeMobile ? 12 : cfg === FULL ? 18 : 14,
                color: digit > 0 ? col.active : 'rgba(255,255,255,0.22)',
                transition: 'color 0.15s',
                lineHeight: 1,
              }}>
                {digit}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  /* ── LANDSCAPE MOBILE ──────────────────────────────────────────────── */
  if (isLandscapeMobile) {
    return (
      <div style={{
        height: '100dvh', overflow: 'hidden',
        background: 'linear-gradient(135deg,#fffbeb 0%,#fef3c7 50%,#fde68a 100%)',
        display: 'flex', flexDirection: 'column',
        fontFamily: '"Segoe UI",system-ui,sans-serif',
      }}>
        {/* Slim header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 12px', height: 40, flexShrink: 0,
          borderBottom: '1px solid rgba(120,53,15,0.15)',
          gap: 10,
        }}>
          <Link href="/" style={{
            background: '#78350f', color: '#fef3c7', borderRadius: 8,
            padding: '4px 12px', textDecoration: 'none',
            fontWeight: 700, fontSize: 12, whiteSpace: 'nowrap', flexShrink: 0,
          }}>
            ← Back
          </Link>

          <span style={{ fontWeight: 900, fontSize: 15, color: '#78350f', whiteSpace: 'nowrap', flexShrink: 0 }}>
            🧮 Abacus
          </span>

          <span style={{
            fontWeight: 900, fontSize: 'clamp(13px,2.5vw,20px)',
            color: total > 0 ? '#16a34a' : '#9ca3af',
            transition: 'color 0.2s', letterSpacing: '-0.5px',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1,
            textAlign: 'center',
          }}>
            {total.toLocaleString('en-IN')}
          </span>

          <button onClick={reset} style={{
            background: '#dc2626', color: '#fff', border: 'none',
            borderRadius: 8, padding: '4px 12px',
            fontWeight: 700, fontSize: 12, cursor: 'pointer', flexShrink: 0,
          }}>
            ↺
          </button>

          {fsSupported && (
            <button
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              style={{
                background: isFullscreen ? 'rgba(120,53,15,0.25)' : '#78350f',
                color: '#fef3c7', border: 'none',
                borderRadius: 8, padding: '4px 10px',
                cursor: 'pointer', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              {isFullscreen ? <ExitFsIcon /> : <EnterFsIcon />}
            </button>
          )}
        </div>

        {/* Abacus centred in remaining space */}
        <div style={{
          flex: 1, overflow: 'hidden',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '4px 8px',
        }}>
          {abacusFrame}
        </div>
      </div>
    );
  }

  /* ── PORTRAIT / DESKTOP ────────────────────────────────────────────── */
  return (
    <div style={{
      minHeight: '100dvh',
      background: 'linear-gradient(135deg,#fffbeb 0%,#fef3c7 50%,#fde68a 100%)',
      padding: '20px 16px 36px',
      fontFamily: '"Segoe UI",system-ui,sans-serif',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        maxWidth: 900, margin: '0 auto 20px',
      }}>
        <Link href="/" style={{
          background: '#78350f', color: '#fef3c7', borderRadius: 12,
          padding: '8px 18px', textDecoration: 'none', fontWeight: 700, fontSize: 14,
        }}>
          ← Back
        </Link>
        <h1 style={{ fontSize: 'clamp(20px,5vw,28px)', fontWeight: 900, color: '#78350f', margin: 0, letterSpacing: '-0.5px' }}>
          🧮 Abacus
        </h1>
        <button onClick={reset} style={{
          background: '#dc2626', color: '#fff', border: 'none',
          borderRadius: 12, padding: '8px 18px', fontWeight: 700, fontSize: 14, cursor: 'pointer',
        }}>
          ↺ Clear
        </button>
      </div>

      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{
          display: 'inline-block', background: '#fff',
          border: '3px solid #fbbf24', borderRadius: 20,
          padding: '12px 32px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 4 }}>
            Current Number
          </div>
          <div style={{
            fontSize: 'clamp(24px,6vw,48px)', fontWeight: 900,
            color: total > 0 ? '#16a34a' : '#d1d5db',
            lineHeight: 1, letterSpacing: '-1px', transition: 'color 0.2s',
          }}>
            {total.toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        {abacusFrame}
      </div>

      <div style={{ textAlign: 'center', marginTop: 16, color: '#92400e', fontSize: 13, fontWeight: 600 }}>
        👆 Tap a bead to slide it toward the bar &nbsp;·&nbsp; Top bead = 5 &nbsp;·&nbsp; Bottom beads = 1 each
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   HORIZONTAL RAIL
───────────────────────────────────────────────────────────────────────── */
function HRail() {
  return (
    <div style={{
      height: 12, borderRadius: 6,
      background: 'linear-gradient(180deg,#3b1505 0%,#92400e 50%,#3b1505 100%)',
      boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.55),0 1px 0 rgba(255,180,60,0.08)',
    }} />
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   COLUMN
───────────────────────────────────────────────────────────────────────── */
interface AbacusColumnProps {
  col: ColDef; state: ColState; cfg: Cfg;
  onHeavenClick: () => void; onEarthClick: (j: number) => void;
}

function AbacusColumn({ col, state, cfg, onHeavenClick, onEarthClick }: AbacusColumnProps) {
  const colH = cfg.heavenH + cfg.dividerH + cfg.earthH;
  return (
    <div style={{ width: cfg.colW, height: colH, position: 'relative', flexShrink: 0 }}>
      <div style={{
        position: 'absolute', left: '50%', top: 0, bottom: 0,
        width: cfg.rodW, transform: 'translateX(-50%)',
        background: 'linear-gradient(90deg,#3b1505 0%,#92400e 50%,#3b1505 100%)',
        borderRadius: 3,
        boxShadow: '1px 0 4px rgba(0,0,0,0.45)',
        zIndex: 0,
      }} />

      <Bead y={heavenY(state.heaven, cfg)} active={state.heaven} col={col} cfg={cfg} onClick={onHeavenClick} />

      {[0, 1, 2, 3].map(j => (
        <Bead key={j} y={earthBeadY(j, state.earth, cfg)} active={j < state.earth} col={col} cfg={cfg} onClick={() => onEarthClick(j)} />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   BEAD  – touch target always ≥ 44 × 44 px (HIG)
───────────────────────────────────────────────────────────────────────── */
interface BeadProps { y: number; active: boolean; col: ColDef; cfg: Cfg; onClick: () => void; }

function Bead({ y, active, col, cfg, onClick }: BeadProps) {
  const [hovered, setHovered] = React.useState(false);
  const [pressed, setPressed] = React.useState(false);

  const TOUCH  = Math.max(cfg.beadD, 44);
  const offset = (TOUCH - cfg.beadD) / 2;
  const scale  = pressed ? 0.86 : hovered ? 1.08 : 1;

  const touchStyle: CSSProperties = {
    position: 'absolute', left: '50%',
    top: y - offset, width: TOUCH, height: TOUCH,
    transform: 'translateX(-50%)',
    transition: 'top 0.22s cubic-bezier(0.34,1.56,0.64,1)',
    cursor: 'pointer', zIndex: 5,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  };

  const beadStyle: CSSProperties = {
    width: cfg.beadD, height: cfg.beadD, borderRadius: '50%', flexShrink: 0,
    transform: `scale(${scale})`,
    transition: 'transform 0.12s ease',
    background: active
      ? `radial-gradient(circle at 38% 32%,${col.light} 0%,${col.active} 55%,${col.dark} 100%)`
      : `radial-gradient(circle at 38% 32%,#f9fafb 0%,#e5e7eb 55%,#9ca3af 100%)`,
    border: `${cfg.beadD >= 30 ? 3 : 2}px solid ${active ? col.dark : '#6b7280'}`,
    boxShadow: active
      ? `0 5px 14px ${col.active}77,0 2px 4px rgba(0,0,0,0.35),inset 0 2px 0 rgba(255,255,255,0.4)`
      : `0 3px 8px rgba(0,0,0,0.25),inset 0 2px 0 rgba(255,255,255,0.6)`,
  };

  return (
    <div
      role="button" tabIndex={0} aria-pressed={active}
      onClick={onClick}
      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onClick()}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onTouchStart={e => { e.preventDefault(); setPressed(true); }}
      onTouchEnd={e => { e.preventDefault(); setPressed(false); onClick(); }}
      style={touchStyle}
    >
      <div style={beadStyle} />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   FULLSCREEN ICONS  (inline SVG, no external deps)
───────────────────────────────────────────────────────────────────────── */
function EnterFsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor" aria-hidden>
      <path d="M1 1h5v2H3v3H1V1zm11 0h5v5h-2V3h-3V1zM1 12h2v3h3v2H1v-5zm14 3h-3v2h5v-5h-2v3z"/>
    </svg>
  );
}

function ExitFsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor" aria-hidden>
      <path d="M6 1v5H1V4h3V1h2zm5 0h2v3h3v2h-5V1zM1 12h5v5H4v-3H1v-2zm11 3v3h-2v-5h5v2h-3z"/>
    </svg>
  );
}
