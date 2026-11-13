import React, { useEffect, useState } from 'react';
import { X, Share2, Check, Flame, Trophy, Award } from 'lucide-react';
import { formatDisplayDate } from '../features/daily/dailySelector';

// share: { title, detail, difficulty } describing the challenge on screen
export default function StatsModal({ isOpen, onClose, streak, totalSolved, dateStr, isCompleted, share }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const generateShareText = () => {
    const lines = [
      share.title,
      `📅 ${formatDisplayDate(dateStr)}`,
      share.detail,
      share.difficulty,
      `🔥 Racha: ${streak} ${streak === 1 ? 'día' : 'días'}`,
      '',
      isCompleted ? '¡Completado con éxito! ✅' : 'Reto pendiente ⏳',
      'https://daily-problem.netlify.app/',
    ];
    return lines.filter((line) => line !== null && line !== undefined).join('\n');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generateShareText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="stats-title"
        className="card p-6 md:p-8 max-w-sm w-full relative animate-scaleIn max-h-[calc(100vh-2rem)] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Cerrar"
          autoFocus
          className="btn btn-secondary btn-icon absolute top-3 right-3"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6 mt-2">
          <div className="w-14 h-14 bg-amber-400 rounded-2xl mx-auto grid place-items-center mb-4">
            <Trophy className="w-7 h-7 text-amber-950" />
          </div>
          <h2 id="stats-title" className="text-2xl font-extrabold text-white">Tus estadísticas</h2>
          <p className="text-[var(--text-muted)] text-sm mt-1">Resuelve un reto cada día para mantener tu racha</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="card-inset p-4 text-center">
            <Flame className="w-7 h-7 text-amber-500 fill-amber-500 mx-auto mb-2" />
            <div className="font-display text-3xl font-extrabold text-white tabular-nums">{streak}</div>
            <div className="eyebrow mt-1">Racha actual</div>
          </div>
          <div className="card-inset p-4 text-center">
            <Award className="w-7 h-7 text-[var(--ok)] mx-auto mb-2" />
            <div className="font-display text-3xl font-extrabold text-white tabular-nums">{totalSolved}</div>
            <div className="eyebrow mt-1">Retos resueltos</div>
          </div>
        </div>

        <div className="card-inset p-4 mb-5 text-left">
          <p className="eyebrow mb-2">Tu resultado</p>
          <div className="text-sm text-slate-300 font-mono whitespace-pre-wrap break-words leading-relaxed">
            {generateShareText()}
          </div>
        </div>

        <button onClick={handleCopy} className="btn btn-primary btn-lg w-full">
          {copied ? (
            <>
              <Check className="w-5 h-5" />
              ¡Copiado al portapapeles!
            </>
          ) : (
            <>
              <Share2 className="w-5 h-5" />
              Compartir mi resultado
            </>
          )}
        </button>
      </div>
    </div>
  );
}
