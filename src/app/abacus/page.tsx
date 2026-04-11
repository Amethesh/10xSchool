'use client';

import React, { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';

/* ── Constants ──────────────────────────────────────────────────────────── */
const NUM_COLS   = 7;
const BEAD_D     = 40;    // bead diameter (px)
const BEAD_STEP  = 48;    // diameter + gap between stacked beads
const COL_W      = 62;    // column width (px)
const COL_GAP    = 10;    // gap between columns
const ROD_W      = 8;     // rod width

// Heaven zone (1 bead above divider)
const HEAVEN_PAD = 12;
const HEAVEN_H   = 100;   // inactive bead y=12, active bead y=56

// Divider bar
const DIVIDER_H  = 12;

// Earth zone (4 beads below divider)
const EARTH_PAD  = 12;
const EARTH_H    = 240;

// Derived
const COL_H      = HEAVEN_H + DIVIDER_H + EARTH_H;   // 352px per column
const FRAME_PAD_X = 20;
const FRAME_PAD_Y = 16;
const FRAME_W    = NUM_COLS * COL_W + (NUM_COLS - 1) * COL_GAP + FRAME_PAD_X * 2;

/* ── Column definitions ─────────────────────────────────────────────────── */
interface ColDef {
  label: string;
  value: number;
  active: string;
  dark:   string;
  light:  string;
}

const COLS: ColDef[] = [
  { label: '10L', value: 1_000_000, active: '#c026d3', dark: '#86198f', light: '#e879f9' },
  { label: 'L',   value:   100_000, active: '#7c3aed', dark: '#4c1d95', light: '#a78bfa' },
  { label: '10K', value:    10_000, active: '#2563eb', dark: '#1e3a8a', light: '#60a5fa' },
  { label: '1K',  value:     1_000, active: '#059669', dark: '#064e3b', light: '#34d399' },
  { label: '100', value:       100, active: '#d97706', dark: '#78350f', light: '#fbbf24' },
  { label: '10',  value:        10, active: '#ea580c', dark: '#7c2d12', light: '#fb923c' },
  { label: '1',   value:         1, active: '#dc2626', dark: '#7f1d1d', light: '#f87171' },
];

interface ColState {
  heaven: boolean;   // heaven bead pushed down (active = counts 5)
  earth:  number;    // earth beads pushed up (0–4), each counts 1
}

/* ── Y-position helpers (relative to column div top) ────────────────────── */
function heavenY(active: boolean): number {
  // Inactive: resting at top. Active: pushed toward divider.
  return active ? HEAVEN_H - BEAD_D - 4 : HEAVEN_PAD;
}

function earthBeadY(j: number, earth: number): number {
  // j=0 is the topmost earth bead (closest to divider).
  // Active beads stack from top of earth zone toward divider.
  // Inactive beads stack at the bottom of earth zone.
  const zoneTop = HEAVEN_H + DIVIDER_H;
  if (j < earth) {
    return zoneTop + EARTH_PAD + j * BEAD_STEP;
  }
  return zoneTop + EARTH_H - EARTH_PAD - BEAD_D - (3 - j) * BEAD_STEP;
}

/* ── Page ────────────────────────────────────────────────────────────────── */
export default function AbacusPage() {
  const [cols, setCols] = useState<ColState[]>(() =>
    Array(NUM_COLS).fill(null).map(() => ({ heaven: false, earth: 0 }))
  );

  const total = useMemo(
    () => cols.reduce((sum, c, i) => sum + ((c.heaven ? 5 : 0) + c.earth) * COLS[i].value, 0),
    [cols],
  );

  const clickHeaven = useCallback((ci: number) => {
    setCols(prev => prev.map((c, i) => i === ci ? { ...c, heaven: !c.heaven } : c));
  }, []);

  const clickEarth = useCallback((ci: number, j: number) => {
    setCols(prev => prev.map((c, i) => {
      if (i !== ci) return c;
      // clicking active bead j: deactivate from j up (earth = j)
      // clicking inactive bead j: activate up to j (earth = j + 1)
      return { ...c, earth: j < c.earth ? j : j + 1 };
    }));
  }, []);

  const reset = () => setCols(Array(NUM_COLS).fill(null).map(() => ({ heaven: false, earth: 0 })));

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 50%, #fde68a 100%)',
      padding: '20px 16px 40px',
      fontFamily: '"Segoe UI", system-ui, sans-serif',
    }}>

      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        maxWidth: 780, margin: '0 auto 24px',
      }}>
        <Link href="/student/levels" style={{
          background: '#78350f', color: '#fef3c7', borderRadius: 12,
          padding: '8px 18px', textDecoration: 'none', fontWeight: 700, fontSize: 14,
        }}>
          ← Back
        </Link>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: '#78350f', margin: 0, letterSpacing: '-0.5px' }}>
          🧮 Abacus
        </h1>
        <button onClick={reset} style={{
          background: '#dc2626', color: '#fff', border: 'none',
          borderRadius: 12, padding: '8px 18px', fontWeight: 700, fontSize: 14, cursor: 'pointer',
        }}>
          ↺ Clear
        </button>
      </div>

      {/* ── Value card ───────────────────────────────────────────────────── */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{
          display: 'inline-block', background: '#fff',
          border: '3px solid #fbbf24', borderRadius: 20, padding: '14px 40px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 4 }}>
            Current Number
          </div>
          <div style={{
            fontSize: 'clamp(32px, 8vw, 56px)', fontWeight: 900,
            color: total > 0 ? '#16a34a' : '#d1d5db',
            lineHeight: 1, letterSpacing: '-1px', transition: 'color 0.2s',
          }}>
            {total.toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      {/* ── Abacus frame ─────────────────────────────────────────────────── */}
      <div style={{ overflowX: 'auto', paddingBottom: 8 }}>
        <div style={{
          margin: '0 auto',
          width: FRAME_W,
          background: 'linear-gradient(150deg, #92400e 0%, #78350f 40%, #451a03 100%)',
          borderRadius: 24,
          padding: `${FRAME_PAD_Y}px ${FRAME_PAD_X}px`,
          boxShadow: '0 24px 64px rgba(120,53,15,0.40), 0 8px 20px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,200,80,0.18)',
        }}>
          {/* Top rail */}
          <HRail />

          {/* Columns + divider overlay */}
          <div style={{ position: 'relative', display: 'flex', gap: COL_GAP, margin: '10px 0' }}>

            {/* Horizontal divider bar spanning all columns */}
            <div style={{
              position: 'absolute',
              left: 0, right: 0,
              top: HEAVEN_H,
              height: DIVIDER_H,
              background: 'linear-gradient(180deg, #1c0a00 0%, #92400e 50%, #1c0a00 100%)',
              borderRadius: 6,
              boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.65), 0 2px 0 rgba(255,180,60,0.14)',
              zIndex: 10,
              pointerEvents: 'none',
            }} />

            {COLS.map((col, ci) => (
              <Column
                key={ci}
                col={col}
                state={cols[ci]}
                onHeavenClick={() => clickHeaven(ci)}
                onEarthClick={j => clickEarth(ci, j)}
              />
            ))}
          </div>

          {/* Bottom rail */}
          <HRail />

          {/* Column place-value labels */}
          <div style={{ display: 'flex', gap: COL_GAP, marginTop: 10 }}>
            {COLS.map((col, ci) => (
              <div key={ci} style={{
                width: COL_W, textAlign: 'center',
                color: '#fde68a', fontWeight: 800, fontSize: 12, letterSpacing: 0.3,
              }}>
                {col.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Per-column digit display ──────────────────────────────────────── */}
      <div style={{ overflowX: 'auto' }}>
        <div style={{
          margin: '8px auto 0',
          width: FRAME_W,
          display: 'flex',
          paddingLeft: FRAME_PAD_X,
          paddingRight: FRAME_PAD_X,
          gap: COL_GAP,
        }}>
          {COLS.map((col, ci) => {
            const digit = (cols[ci].heaven ? 5 : 0) + cols[ci].earth;
            return (
              <div key={ci} style={{
                width: COL_W, textAlign: 'center',
                fontSize: 22, fontWeight: 900,
                color: digit > 0 ? col.active : '#d1d5db',
                transition: 'color 0.15s',
              }}>
                {digit}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Instruction ──────────────────────────────────────────────────── */}
      <div style={{ textAlign: 'center', marginTop: 16, color: '#92400e', fontSize: 13, fontWeight: 600 }}>
        👆 Click beads to slide them toward the bar · Top bead (heaven) = 5 · Bottom beads = 1 each
      </div>
    </div>
  );
}

/* ── Horizontal wooden rail ─────────────────────────────────────────────── */
function HRail() {
  return (
    <div style={{
      height: 12, borderRadius: 6,
      background: 'linear-gradient(180deg, #3b1505 0%, #92400e 50%, #3b1505 100%)',
      boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.55), 0 1px 0 rgba(255,180,60,0.08)',
    }} />
  );
}

/* ── Single column (one vertical rod + beads) ───────────────────────────── */
interface ColumnProps {
  col:           ColDef;
  state:         ColState;
  onHeavenClick: () => void;
  onEarthClick:  (j: number) => void;
}

function Column({ col, state, onHeavenClick, onEarthClick }: ColumnProps) {
  return (
    <div style={{ width: COL_W, height: COL_H, position: 'relative', flexShrink: 0 }}>
      {/* Vertical rod */}
      <div style={{
        position: 'absolute',
        left: '50%', top: 0, bottom: 0,
        width: ROD_W,
        transform: 'translateX(-50%)',
        background: 'linear-gradient(90deg, #3b1505 0%, #92400e 50%, #3b1505 100%)',
        borderRadius: 4,
        boxShadow: '1px 0 4px rgba(0,0,0,0.45)',
        zIndex: 0,
      }} />

      {/* Heaven bead (1) */}
      <Bead
        y={heavenY(state.heaven)}
        active={state.heaven}
        col={col}
        onClick={onHeavenClick}
      />

      {/* Earth beads (4) */}
      {Array.from({ length: 4 }, (_, j) => (
        <Bead
          key={j}
          y={earthBeadY(j, state.earth)}
          active={j < state.earth}
          col={col}
          onClick={() => onEarthClick(j)}
        />
      ))}
    </div>
  );
}

/* ── Single bead ────────────────────────────────────────────────────────── */
interface BeadProps {
  y:       number;
  active:  boolean;
  col:     ColDef;
  onClick: () => void;
}

function Bead({ y, active, col, onClick }: BeadProps) {
  const [hovered, setHovered] = React.useState(false);
  const [pressed, setPressed] = React.useState(false);

  const scale = pressed ? 0.88 : hovered ? 1.1 : 1;

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onTouchStart={e => { e.preventDefault(); setPressed(true); }}
      onTouchEnd={e => { e.preventDefault(); setPressed(false); onClick(); }}
      style={{
        position:     'absolute',
        left:         '50%',
        top:          y,
        width:        BEAD_D,
        height:       BEAD_D,
        borderRadius: '50%',
        /* translateX centers the bead on the rod; scale handles hover/press */
        transform:    `translateX(-50%) scale(${scale})`,
        /* top animates with a spring; transform (scale) is a quick ease */
        transition:   'top 0.22s cubic-bezier(0.34,1.56,0.64,1), transform 0.12s ease',
        cursor:       'pointer',
        zIndex:       5,
        background:   active
          ? `radial-gradient(circle at 38% 32%, ${col.light} 0%, ${col.active} 55%, ${col.dark} 100%)`
          : `radial-gradient(circle at 38% 32%, #f9fafb 0%, #e5e7eb 55%, #9ca3af 100%)`,
        border:       `3px solid ${active ? col.dark : '#6b7280'}`,
        boxShadow:    active
          ? `0 6px 16px ${col.active}77, 0 2px 4px rgba(0,0,0,0.35), inset 0 2px 0 rgba(255,255,255,0.4)`
          : `0 4px 10px rgba(0,0,0,0.25), inset 0 2px 0 rgba(255,255,255,0.6)`,
      }}
    />
  );
}
