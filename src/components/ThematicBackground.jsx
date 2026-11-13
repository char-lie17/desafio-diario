import React, { useEffect, useRef } from 'react';

// Decorative background: a loose "word search" grid of thematic elements drawn
// on one fixed canvas behind the interface. Near the cursor the elements drift
// away and rotate, then ease back. The canvas only repaints while something is
// moving; on touch devices and with reduced motion it is painted once.

const THEMES = {
  math: {
    color: '52, 211, 153',
    glyphs: [
      '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
      'π', '∑', '√', '∞', '±', '÷', '×', '≠', '≤', '∫', 'Δ', 'θ', '%', '=', '+',
      'x²', 'a²+b²', 'y=mx+b', '2x+1', 'f(x)', '3/4', 'x<5', '(a+b)²', 'sen θ', 'n!',
    ],
    shapes: ['triangle', 'circle', 'square', 'graphLine', 'graphCurve', 'angle'],
  },
  chess: {
    color: '125, 211, 252',
    glyphs: [
      '♔', '♕', '♖', '♗', '♘', '♙', '♚', '♛', '♜', '♝', '♞', '♟',
      '♘', '♜', '♝', '♛', '♙', '♟',
      'e4', 'Nf3', 'a1', 'h8', 'd5', 'O-O', 'Qh5', 'c6', 'g7', 'Bb5', 'exd5', '#', '+',
    ],
    shapes: ['checker2', 'checker3', 'knightPath', 'diagonal', 'file'],
  },
};

const NEUTRAL = '148, 163, 184'; // slate, mixed in so the accent does not dominate
const RADIUS = 170;       // how far the cursor reaches, in CSS pixels
const PUSH = 44;          // maximum displacement
const TWIST = 0.9;        // maximum extra rotation, in radians
const FOLLOW_RATE = 7;    // easing towards the cursor effect (per second)
const RETURN_RATE = 2.6;  // slower easing back to the resting arrangement
const FADE_MS = 500;

// Small deterministic PRNG so a module always gets the same arrangement.
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildElements(theme, width, height, seed) {
  // Fewer, larger cells on small screens.
  const cell = width < 640 ? 104 : width < 1100 ? 96 : 88;
  const random = mulberry32(seed);
  const pick = (list) => list[Math.floor(random() * list.length)];
  const elements = [];
  const columns = Math.ceil(width / cell) + 1;
  const rows = Math.ceil(height / cell) + 1;
  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      const isShape = random() < 0.24;
      const glyph = isShape ? null : pick(theme.glyphs);
      const long = glyph && glyph.length > 3;
      elements.push({
        x: (column + 0.5 + (random() - 0.5) * 0.5) * cell - cell / 2,
        y: (row + 0.5 + (random() - 0.5) * 0.5) * cell - cell / 2,
        rotation: (random() - 0.5) * (long ? 0.35 : 0.8),
        size: long ? 12 + random() * 3 : 15 + random() * 11,
        alpha: 0.13 + random() * 0.12,
        accent: random() < 0.45,
        spin: random() < 0.5 ? -1 : 1,
        glyph,
        shape: isShape ? pick(theme.shapes) : null,
        dx: 0,
        dy: 0,
        dr: 0,
      });
    }
  }
  return elements;
}

function drawShape(ctx, shape, s) {
  const h = s / 2;
  ctx.lineWidth = 1.5;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.beginPath();
  switch (shape) {
    case 'triangle':
      ctx.moveTo(-h, h); ctx.lineTo(h, h); ctx.lineTo(-h, -h); ctx.closePath(); ctx.stroke();
      ctx.strokeRect(-h, h - 5, 5, 5); // right-angle mark
      break;
    case 'circle':
      ctx.arc(0, 0, h, 0, Math.PI * 2); ctx.moveTo(0, 0); ctx.lineTo(h, 0); ctx.stroke();
      break;
    case 'square':
      ctx.strokeRect(-h, -h, s, s);
      break;
    case 'angle':
      ctx.moveTo(h, h); ctx.lineTo(-h, h); ctx.lineTo(h * 0.6, -h); ctx.stroke();
      ctx.beginPath(); ctx.arc(-h, h, h * 0.7, -0.85, 0); ctx.stroke();
      break;
    case 'graphLine':
    case 'graphCurve':
      // Small coordinate axes with a line or a parabola
      ctx.moveTo(-h, 0); ctx.lineTo(h, 0); ctx.moveTo(0, -h); ctx.lineTo(0, h); ctx.stroke();
      ctx.beginPath();
      if (shape === 'graphLine') {
        ctx.moveTo(-h * 0.8, h * 0.6); ctx.lineTo(h * 0.8, -h * 0.7);
      } else {
        for (let i = -8; i <= 8; i++) {
          const x = (i / 8) * h * 0.85;
          const y = h * 0.6 - (i * i / 64) * h * 1.3;
          if (i === -8) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
      }
      ctx.lineWidth = 2;
      ctx.stroke();
      break;
    case 'checker2':
    case 'checker3': {
      const n = shape === 'checker2' ? 2 : 3;
      const q = s / n;
      for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
          if ((r + c) % 2 === 0) ctx.fillRect(-h + c * q, -h + r * q, q, q);
        }
      }
      ctx.strokeRect(-h, -h, s, s);
      break;
    }
    case 'knightPath': {
      // The L of a knight move: three dots joined by a path
      const q = s / 2;
      ctx.moveTo(-q / 2, q); ctx.lineTo(-q / 2, -q); ctx.lineTo(q / 2, -q); ctx.stroke();
      for (const [x, y] of [[-q / 2, q], [-q / 2, 0], [-q / 2, -q], [q / 2, -q]]) {
        ctx.beginPath(); ctx.arc(x, y, 2.5, 0, Math.PI * 2); ctx.fill();
      }
      break;
    }
    case 'diagonal':
      // A bishop's diagonal
      for (let i = -1; i <= 1; i++) ctx.fillRect(i * (s / 3) - s / 6, -i * (s / 3) - s / 6, s / 3, s / 3);
      break;
    case 'file':
      // A rook's file
      for (let i = -1; i <= 1; i++) ctx.strokeRect(-s / 6, i * (s / 3) - s / 6, s / 3, s / 3);
      break;
    default:
      break;
  }
}

export default function ThematicBackground({ module }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const theme = THEMES[module] || THEMES.math;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

    let width = 0;
    let height = 0;
    let elements = [];
    let pointer = null;        // { x, y } in CSS pixels, or null when away
    let frame = 0;             // requestAnimationFrame id, 0 when idle
    let lastTime = 0;
    let fadeStart = 0;         // 0 once the fade-in has finished

    const interactive = () => finePointer.matches && !reducedMotion.matches;

    const draw = (opacity) => {
      ctx.clearRect(0, 0, width, height);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (const el of elements) {
        const color = el.accent ? theme.color : NEUTRAL;
        ctx.save();
        ctx.translate(el.x + el.dx, el.y + el.dy);
        ctx.rotate(el.rotation + el.dr);
        ctx.globalAlpha = el.alpha * opacity;
        ctx.fillStyle = `rgb(${color})`;
        ctx.strokeStyle = `rgb(${color})`;
        if (el.glyph) {
          ctx.font = `600 ${el.size}px Outfit, "Segoe UI Symbol", "Noto Sans Symbols 2", system-ui, sans-serif`;
          ctx.fillText(el.glyph, 0, 0);
        } else {
          drawShape(ctx, el.shape, el.size);
        }
        ctx.restore();
      }
    };

    const tick = (time) => {
      frame = 0;
      const dt = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;
      let moving = false;

      for (const el of elements) {
        let tx = 0;
        let ty = 0;
        let tr = 0;
        if (pointer) {
          const ox = el.x - pointer.x;
          const oy = el.y - pointer.y;
          const distance = Math.hypot(ox, oy);
          if (distance < RADIUS) {
            const force = (1 - distance / RADIUS) ** 2;
            const nx = distance > 0.01 ? ox / distance : 1;
            const ny = distance > 0.01 ? oy / distance : 0;
            // Push away, with a slight sideways swirl so it feels stirred
            tx = (nx - ny * 0.35 * el.spin) * force * PUSH;
            ty = (ny + nx * 0.35 * el.spin) * force * PUSH;
            tr = force * TWIST * el.spin;
          }
        }
        const returning = tx === 0 && ty === 0;
        const ease = 1 - Math.exp(-dt * (returning ? RETURN_RATE : FOLLOW_RATE));
        el.dx += (tx - el.dx) * ease;
        el.dy += (ty - el.dy) * ease;
        el.dr += (tr - el.dr) * ease;
        if (Math.abs(tx - el.dx) > 0.05 || Math.abs(ty - el.dy) > 0.05 || Math.abs(tr - el.dr) > 0.002) {
          moving = true;
        } else {
          el.dx = tx; el.dy = ty; el.dr = tr;
        }
      }

      let opacity = 1;
      if (fadeStart) {
        opacity = Math.min((time - fadeStart) / FADE_MS, 1);
        if (opacity >= 1) fadeStart = 0;
      }
      draw(opacity);

      // Keep running only while something is still settling
      if ((moving || fadeStart) && !document.hidden) schedule();
    };

    const schedule = () => {
      if (!frame) {
        if (!lastTime || performance.now() - lastTime > 100) lastTime = performance.now();
        frame = requestAnimationFrame(tick);
      }
    };

    const stop = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    };

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      elements = buildElements(theme, width, height, module === 'chess' ? 64 : 314);
      draw(fadeStart ? 0 : 1);
      if (fadeStart) schedule();
    };

    const handlePointerMove = (event) => {
      if (!interactive() || event.pointerType === 'touch') return;
      pointer = { x: event.clientX, y: event.clientY };
      schedule();
    };

    const handlePointerAway = () => {
      if (!pointer) return;
      pointer = null;
      schedule(); // let the elements ease back
    };

    const handleVisibility = () => {
      if (document.hidden) {
        stop();
      } else {
        pointer = null;
        schedule();
      }
    };

    const handlePreferenceChange = () => {
      if (!interactive()) {
        // Calm, static version: snap everything back and paint once
        pointer = null;
        stop();
        for (const el of elements) { el.dx = 0; el.dy = 0; el.dr = 0; }
        fadeStart = 0;
        draw(1);
      }
    };

    let resizeTimer = 0;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 150);
    };

    if (!reducedMotion.matches) fadeStart = performance.now();
    resize();
    // The display font may load after the first paint
    document.fonts?.ready.then(() => { if (!frame) draw(fadeStart ? 0 : 1); });

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('blur', handlePointerAway);
    document.documentElement.addEventListener('pointerleave', handlePointerAway);
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('resize', handleResize);
    reducedMotion.addEventListener('change', handlePreferenceChange);
    finePointer.addEventListener('change', handlePreferenceChange);

    return () => {
      stop();
      clearTimeout(resizeTimer);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('blur', handlePointerAway);
      document.documentElement.removeEventListener('pointerleave', handlePointerAway);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('resize', handleResize);
      reducedMotion.removeEventListener('change', handlePreferenceChange);
      finePointer.removeEventListener('change', handlePreferenceChange);
    };
  }, [module]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 w-full h-full z-0 pointer-events-none"
    />
  );
}
