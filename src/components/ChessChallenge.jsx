import React, { useState } from 'react';
import { CheckCircle, Lightbulb, ExternalLink, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ChessChallenge({ puzzle, onSolve, isCompleted }) {
  const [solved, setSolved] = useState(isCompleted);
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(isCompleted);

  if (!puzzle) return null;

  const lichessUrl = `https://lichess.org/training/${puzzle.lichessId}`;

  const handleMarkSolved = () => {
    if (solved) return;
    setSolved(true);
    setShowSolution(true);
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    if (onSolve) onSolve();
  };

  return (
    <div className="chess-card glass-panel rounded-2xl p-6 border border-amber-500/20 bg-slate-900/80 shadow-xl transition-all">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 text-xs font-bold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
            ♟️ Ajedrez Táctico
          </span>
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-slate-800 text-slate-300">
            {puzzle.theme || 'Puzzle'}
          </span>
          {puzzle.subtheme && (
            <span className="hidden sm:inline-block px-3 py-1 text-xs rounded-full bg-slate-800/60 text-slate-400">
              {puzzle.subtheme}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 bg-slate-800/60 px-3 py-1 rounded-lg">
          <span className={`w-2.5 h-2.5 rounded-full ${puzzle.sideToMove === 'w' ? 'bg-slate-100 border border-slate-400' : 'bg-slate-950 border border-slate-600'}`} />
          <span>Juegan {puzzle.sideToMove === 'w' ? 'Blancas' : 'Negras'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Lichess Puzzle iframe */}
        <div className="md:col-span-7">
          <div className="rounded-xl overflow-hidden border-2 border-slate-700 shadow-2xl bg-slate-950"
               style={{ aspectRatio: '1/1.08', minHeight: 380 }}>
            <iframe
              key={puzzle.lichessId}
              src={lichessUrl}
              title={`Puzzle de ajedrez: ${puzzle.title}`}
              style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
              allow="fullscreen"
            />
          </div>
          <a
            href={lichessUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 hover:text-amber-400 transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            Ver en Lichess
          </a>
        </div>

        {/* Info Column */}
        <div className="md:col-span-5 flex flex-col gap-4">
          <div>
            <h3 className="text-xl font-bold text-slate-100 mb-1">{puzzle.title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{puzzle.description}</p>
          </div>

          {/* Tactical objective */}
          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Objetivo táctico:</span>
            <span className="text-sm font-bold text-amber-400">{puzzle.theme}</span>
          </div>

          {/* Rating */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">Rating Lichess:</span>
            <span className="text-sm font-semibold text-slate-200">⭐ {puzzle.rating}</span>
          </div>

          {/* Solved banner */}
          {solved && (
            <div className="p-3.5 bg-amber-950/40 border border-amber-500/40 rounded-xl text-amber-200 text-xs flex items-center gap-2 animate-fadeIn">
              <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>¡Puzzle completado hoy! Vuelve mañana por el siguiente desafío.</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            {/* Mark solved button */}
            <button
              onClick={handleMarkSolved}
              disabled={solved}
              className={`flex-1 py-3 px-4 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                solved
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 cursor-default'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 hover:shadow-amber-400/30'
              }`}
            >
              <Trophy className="w-4 h-4" />
              {solved ? '✓ Completado' : '¡Lo resolví!'}
            </button>

            {/* Hint button */}
            {puzzle.hints && puzzle.hints.length > 0 && (
              <button
                onClick={() => setShowHint(!showHint)}
                className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-semibold rounded-xl border border-amber-500/20 transition-all flex items-center gap-1.5"
              >
                <Lightbulb className="w-3.5 h-3.5" />
                Pista
              </button>
            )}
          </div>

          {/* Hint view */}
          {showHint && puzzle.hints && (
            <div className="p-3 bg-amber-950/30 border border-amber-500/20 rounded-xl text-amber-200 text-xs">
              <span className="font-bold block mb-1">💡 Pista Táctica:</span>
              {puzzle.hints.map((h, i) => (
                <p key={i} className="mb-0.5">{h}</p>
              ))}
            </div>
          )}

          {/* Solution view */}
          {showSolution && (
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-xs">
              <span className="font-bold text-amber-400 block mb-1">Solución táctica:</span>
              <p className="font-mono text-slate-200 mb-2">{puzzle.solution.join('  ⟶  ')}</p>
              <p className="text-slate-400 text-[11px] leading-relaxed">{puzzle.explanation}</p>
            </div>
          )}

          {!showSolution && solved && (
            <button
              onClick={() => setShowSolution(true)}
              className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs rounded-xl transition-all"
            >
              Ver solución completa
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
