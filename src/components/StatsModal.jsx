import React, { useState } from 'react';
import { X, Share2, Copy, Check, Flame, Trophy, Calendar } from 'lucide-react';
import { getTodayDateString, formatDisplayDate } from '../features/daily/dailySelector';

export default function StatsModal({ isOpen, onClose, streak, problem }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const generateShareText = () => {
    const dateStr = formatDisplayDate(getTodayDateString());
    const gradeText = problem ? `${problem.grade}.º Grado` : 'General';
    let stars = '⭐'.repeat(problem ? problem.difficulty : 3);
    
    return `Desafío Diario Matemático 🧠\n📅 ${dateStr}\n🎓 ${gradeText}\n⚡ Dificultad: ${stars}\n🔥 Racha: ${streak} días\n\n¡Completado con éxito! ✅\nhttps://daily-problem.netlify.app/`;
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

  // Prevent clicks inside modal from closing it
  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl relative animate-scaleIn"
        onClick={handleModalClick}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-8 mt-2">
          <div className="w-16 h-16 bg-gradient-to-tr from-amber-500 to-orange-400 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-amber-500/20 mb-4 rotate-3">
            <Trophy className="w-8 h-8 text-slate-900" />
          </div>
          <h2 className="text-2xl font-black text-white">Tus Estadísticas</h2>
          <p className="text-slate-400 text-sm mt-1">Sigue practicando para mantener tu racha</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4 text-center">
            <Flame className="w-8 h-8 text-amber-500 mx-auto mb-2" />
            <div className="text-3xl font-black text-white">{streak}</div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">Racha Actual</div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4 text-center">
            <Calendar className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <div className="text-3xl font-black text-white">{streak}</div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">Mejor Racha</div>
          </div>
        </div>

        {problem && (
          <div className="mb-6 p-4 bg-slate-950/50 rounded-xl border border-slate-800 text-left">
            <p className="text-xs text-slate-500 font-bold mb-2 uppercase tracking-wide">Tu resultado de hoy</p>
            <div className="text-sm text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">
              {generateShareText()}
            </div>
          </div>
        )}

        <button 
          onClick={handleCopy}
          className={`w-full py-4 px-6 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${
            copied 
              ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/20' 
              : 'bg-indigo-500 hover:bg-indigo-400 text-white shadow-indigo-500/20'
          }`}
        >
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
