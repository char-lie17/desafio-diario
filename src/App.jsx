import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Flame,
  Award,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Brain,
  Zap
} from 'lucide-react';
import MathChallenge from './components/MathChallenge';
import ChessChallenge from './components/ChessChallenge';
import {
  getTodayDateString,
  formatDisplayDate,
  getDailyMathProblem,
  getDailyChessPuzzle,
  getSavedGrade,
  saveGrade,
  getCompletedStatus,
  markChallengeCompleted,
  getStreak
} from './features/daily/dailySelector';

export default function App() {
  const [selectedGrade, setSelectedGrade] = useState(() => getSavedGrade());
  const [currentDateStr, setCurrentDateStr] = useState(() => getTodayDateString());
  const [completedStatus, setCompletedStatus] = useState({ math: false, chess: false });
  const [streak, setStreak] = useState(1);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'math', 'chess'

  // Current problem & puzzle
  const [mathProblem, setMathProblem] = useState(null);
  const [chessPuzzle, setChessPuzzle] = useState(null);

  useEffect(() => {
    saveGrade(selectedGrade);
    const math = getDailyMathProblem(selectedGrade, currentDateStr);
    const chess = getDailyChessPuzzle(currentDateStr);
    setMathProblem(math);
    setChessPuzzle(chess);

    const status = getCompletedStatus(currentDateStr, selectedGrade);
    setCompletedStatus(status);
    setStreak(getStreak());
  }, [selectedGrade, currentDateStr]);

  const handleGradeChange = (grade) => {
    setSelectedGrade(grade);
  };

  const handleMathSolved = () => {
    const updated = markChallengeCompleted('math', currentDateStr, selectedGrade);
    setCompletedStatus({ ...updated });
    setStreak(getStreak());
  };

  const handleChessSolved = () => {
    const updated = markChallengeCompleted('chess', currentDateStr);
    setCompletedStatus({ ...updated });
    setStreak(getStreak());
  };

  const handlePrevDay = () => {
    const [y, m, d] = currentDateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    dateObj.setDate(dateObj.getDate() - 1);
    setCurrentDateStr(getTodayDateString(dateObj));
  };

  const handleNextDay = () => {
    const [y, m, d] = currentDateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    dateObj.setDate(dateObj.getDate() + 1);
    const nextStr = getTodayDateString(dateObj);
    if (nextStr <= getTodayDateString()) {
      setCurrentDateStr(nextStr);
    }
  };

  const isToday = currentDateStr === getTodayDateString();
  const bothCompleted = completedStatus.math && completedStatus.chess;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950 pb-16">
      {/* Background Decorative Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* TOP BAR / HEADER */}
        <header className="flex flex-col md:flex-row items-center justify-between gap-4 py-4 border-b border-slate-800/80 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-amber-500 p-0.5 shadow-lg shadow-emerald-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Brain className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                DESAFÍO DIARIO <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">MVP</span>
              </h1>
              <p className="text-xs text-slate-400 font-medium">
                Razonamiento matemático y estratégico cada día
              </p>
            </div>
          </div>

          {/* Date Control & Discrete Streak */}
          <div className="flex items-center gap-3">
            {/* Streak Counter */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-amber-400 shadow-inner">
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500 animate-pulse" />
              <span>Racha: {streak} {streak === 1 ? 'día' : 'días'}</span>
            </div>

            {/* Date Navigator */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 shadow-sm">
              <button
                onClick={handlePrevDay}
                title="Día anterior"
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="px-3 py-1 text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <CalendarIcon className="w-3.5 h-3.5 text-emerald-400" />
                <span>{formatDisplayDate(currentDateStr)}</span>
              </div>
              <button
                onClick={handleNextDay}
                disabled={isToday}
                title="Día siguiente"
                className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed rounded-lg hover:bg-slate-800 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* HERO SECTION / COVER OF THE DAY */}
        <section className="mb-10 text-center md:text-left bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 p-6 md:p-8 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-emerald-500/5 to-transparent pointer-events-none" />

          <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 mb-3">
                <Sparkles className="w-3.5 h-3.5" /> PORTADA DEL DESAFÍO
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mb-2">
                ¿Listo para el reto de hoy?
              </h2>
              <p className="text-slate-400 text-sm max-w-xl">
                Un problema matemático adaptado a tu nivel y una táctica de ajedrez. Resuélvelos y vuelve mañana.
              </p>
            </div>

            {/* GRADE SELECTOR PILLS */}
            <div className="bg-slate-950/80 p-2 rounded-2xl border border-slate-800 w-full md:w-auto">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block text-center mb-2">
                Selecciona tu Grado:
              </span>
              <div className="flex justify-center gap-1.5 flex-wrap">
                {[7, 8, 9, 10, 11].map((g) => (
                  <button
                    key={g}
                    onClick={() => handleGradeChange(g)}
                    className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all ${
                      selectedGrade === g
                        ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20 scale-105'
                        : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
                    }`}
                  >
                    {g}.º
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* STATUS BAR OVERVIEW */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-800/80">
            <div className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
              completedStatus.math
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                : 'bg-slate-950/50 border-slate-800 text-slate-400'
            }`}>
              <div className="flex items-center gap-2 text-xs font-semibold">
                <span>🧮 Desafío Matemático ({selectedGrade}.º Grado)</span>
              </div>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                completedStatus.math
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-slate-800 text-slate-500'
              }`}>
                {completedStatus.math ? <><CheckCircle2 className="w-3 h-3" /> Completado</> : 'Pendiente'}
              </span>
            </div>

            <div className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
              completedStatus.chess
                ? 'bg-amber-950/40 border-amber-500/40 text-amber-300'
                : 'bg-slate-950/50 border-slate-800 text-slate-400'
            }`}>
              <div className="flex items-center gap-2 text-xs font-semibold">
                <span>♟️ Reto de Ajedrez Táctico</span>
              </div>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                completedStatus.chess
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-slate-800 text-slate-500'
              }`}>
                {completedStatus.chess ? <><CheckCircle2 className="w-3 h-3" /> Completado</> : 'Pendiente'}
              </span>
            </div>
          </div>
        </section>

        {/* BOTH COMPLETED CELEBRATION BANNER */}
        {bothCompleted && (
          <div className="mb-10 p-6 bg-gradient-to-r from-emerald-950 via-slate-900 to-amber-950 rounded-2xl border-2 border-amber-400/40 shadow-2xl text-center relative overflow-hidden animate-fadeIn">
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center border border-amber-400/40 shadow-lg shadow-amber-400/10">
                <Award className="w-7 h-7 text-amber-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-amber-300 mb-1">
                  ¡Felicitaciones! Desafío del día completado
                </h3>
                <p className="text-slate-300 text-sm max-w-md mx-auto">
                  Has ejercitado el razonamiento matemático y la táctica de ajedrez hoy. Nos vemos mañana para el siguiente reto.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* FILTER TABS */}
        <div className="flex justify-center mb-8">
          <div className="bg-slate-900 p-1.5 rounded-2xl border border-slate-800 flex gap-1 shadow-inner">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-5 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'all' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Ambos Desafíos
            </button>
            <button
              onClick={() => setActiveTab('math')}
              className={`px-5 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'math' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🧮 Solo Matemáticas
            </button>
            <button
              onClick={() => setActiveTab('chess')}
              className={`px-5 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'chess' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ♟️ Solo Ajedrez
            </button>
          </div>
        </div>

        {/* MAIN CHALLENGE CARDS SECTION */}
        <div className="space-y-10">
          {(activeTab === 'all' || activeTab === 'math') && mathProblem && (
            <MathChallenge
              problem={mathProblem}
              onSolve={handleMathSolved}
              isCompleted={completedStatus.math}
            />
          )}

          {(activeTab === 'all' || activeTab === 'chess') && chessPuzzle && (
            <ChessChallenge
              puzzle={chessPuzzle}
              onSolve={handleChessSolved}
              isCompleted={completedStatus.chess}
            />
          )}
        </div>

        {/* FOOTER */}
        <footer className="mt-16 text-center border-t border-slate-800/80 pt-8 pb-4 text-xs text-slate-500">
          <p className="font-semibold text-slate-400 mb-1">
            Desafío Diario — Una pregunta. Un problema. Una posición. Cada día.
          </p>
          <p>
            Construido con React, Vite, KaTeX, SymPy & Chess.js. Cero backend, 100% estático.
          </p>
        </footer>
      </div>
    </div>
  );
}
