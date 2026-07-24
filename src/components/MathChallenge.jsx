import React, { useState, useEffect } from 'react';
import { Star, CheckCircle, XCircle, Lightbulb, BookOpen, RefreshCw, Award } from 'lucide-react';
import KaTeXView from './KaTeXView';
import confetti from 'canvas-confetti';

export default function MathChallenge({ problem, onSolve, isCompleted }) {
  const [userAnswer, setUserAnswer] = useState('');
  const [selectedOption, setSelectedOption] = useState(null);
  const [status, setStatus] = useState(isCompleted ? 'success' : 'idle'); // 'idle', 'success', 'error'
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(isCompleted);

  useEffect(() => {
    setUserAnswer('');
    setSelectedOption(null);
    setStatus(isCompleted ? 'success' : 'idle');
    setAttempts(0);
    setShowHint(false);
    setShowSolution(isCompleted);
  }, [problem, isCompleted]);

  if (!problem) return null;

  const normalizeStr = (s) => (s || '').toString().toLowerCase().trim().replace(/\s+/g, '');

  const handleCheckAnswer = () => {
    let isCorrect = false;

    if (problem.type === 'multiple_choice') {
      if (!selectedOption) return;
      isCorrect = normalizeStr(selectedOption) === normalizeStr(problem.answer);
    } else if (problem.type === 'true_false') {
      if (!selectedOption) return;
      isCorrect = normalizeStr(selectedOption) === normalizeStr(problem.answer);
    } else {
      if (!userAnswer) return;
      const expected = normalizeStr(problem.answer);
      const actual = normalizeStr(userAnswer);
      isCorrect = actual === expected;
    }

    if (isCorrect) {
      setStatus('success');
      setShowSolution(true);
      if (!isCompleted) {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 }
        });
        if (onSolve) onSolve();
      }
    } else {
      setStatus('error');
      setAttempts((prev) => prev + 1);
    }
  };

  const renderStars = (diff) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < diff ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`}
      />
    ));
  };

  const renderTextWithMath = (text) => {
    if (!text) return null;
    const parts = text.split('$');
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        return <KaTeXView key={index} math={part} displayMode={false} />;
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="math-card glass-panel rounded-2xl p-6 border border-emerald-500/20 bg-slate-900/80 shadow-xl transition-all">
      {/* Header Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 text-xs font-bold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            {problem.grade}.º Grado
          </span>
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-slate-800 text-slate-300">
            {problem.category}
          </span>
          {problem.subcategory && (
            <span className="hidden sm:inline-block px-3 py-1 text-xs rounded-full bg-slate-800/60 text-slate-400">
              {problem.subcategory}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 bg-slate-800/40 px-2.5 py-1 rounded-lg">
          <span className="text-xs text-slate-400 mr-1">Dificultad:</span>
          {renderStars(problem.difficulty)}
        </div>
      </div>

      {/* Question Title & Prompt */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-slate-100 mb-2 flex items-center gap-2">
          <span className="text-emerald-400">🧮</span> {problem.title}
        </h3>
        <p className="text-slate-300 text-base leading-relaxed mb-4">{renderTextWithMath(problem.question)}</p>

        {/* Formula Container */}
        {problem.latex && (
          <div className="my-5 p-5 bg-slate-950/80 rounded-xl border border-emerald-500/30 flex justify-center items-center text-emerald-300 overflow-x-auto shadow-inner">
            <KaTeXView math={problem.latex} displayMode={true} className="text-lg md:text-xl" />
          </div>
        )}
      </div>

      {/* Answer Inputs */}
      {status !== 'success' && (
        <div className="mb-6">
          {problem.type === 'multiple_choice' && problem.options && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {problem.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedOption(opt)}
                  className={`p-3.5 rounded-xl border text-left font-medium transition-all flex items-center justify-between ${
                    selectedOption === opt
                      ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300 shadow-md shadow-emerald-500/10'
                      : 'border-slate-700 bg-slate-800/50 text-slate-200 hover:border-slate-600 hover:bg-slate-800'
                  }`}
                >
                  <span>{opt}</span>
                  <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-xs ${
                    selectedOption === opt ? 'border-emerald-400 bg-emerald-400 text-slate-950 font-bold' : 'border-slate-600'
                  }`}>
                    {selectedOption === opt ? '✓' : ''}
                  </span>
                </button>
              ))}
            </div>
          )}

          {problem.type === 'true_false' && (
            <div className="grid grid-cols-2 gap-4">
              {['Verdadero', 'Falso'].map((opt) => (
                <button
                  key={opt}
                  onClick={() => setSelectedOption(opt)}
                  className={`p-4 rounded-xl border text-center font-bold transition-all ${
                    selectedOption === opt
                      ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300 shadow-md shadow-emerald-500/10'
                      : 'border-slate-700 bg-slate-800/50 text-slate-200 hover:border-slate-600 hover:bg-slate-800'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}

          {(problem.type === 'numeric' || problem.type === 'algebraic') && (
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCheckAnswer()}
                placeholder="Ingresa tu respuesta aquí..."
                className="flex-1 px-4 py-3.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 font-mono"
              />
            </div>
          )}

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 mt-5">
            <div className="flex gap-2">
              {problem.hints && problem.hints.length > 0 && (
                <button
                  onClick={() => setShowHint(!showHint)}
                  className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 transition-colors flex items-center gap-1.5"
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                  {showHint ? 'Ocultar pista' : 'Ver pista'}
                </button>
              )}

              {attempts >= 2 && (
                <button
                  onClick={() => setShowSolution(!showSolution)}
                  className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors flex items-center gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  {showSolution ? 'Ocultar solución' : 'Ver solución'}
                </button>
              )}
            </div>

            <button
              onClick={handleCheckAnswer}
              disabled={
                (problem.type === 'multiple_choice' || problem.type === 'true_false')
                  ? !selectedOption
                  : !userAnswer.trim()
              }
              className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 text-sm ml-auto"
            >
              <span>Comprobar respuesta</span>
            </button>
          </div>
        </div>
      )}

      {/* Hints Banner */}
      {showHint && problem.hints && (
        <div className="mb-5 p-4 bg-amber-950/40 border border-amber-500/30 rounded-xl text-amber-200 text-sm flex items-start gap-3 animate-fadeIn">
          <Lightbulb className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block mb-1">Pista educativa:</span>
            {problem.hints.map((hint, i) => (
              <p key={i}>{hint}</p>
            ))}
          </div>
        </div>
      )}

      {/* Feedback Messages */}
      {status === 'error' && (
        <div className="mb-5 p-4 bg-rose-950/40 border border-rose-500/40 rounded-xl text-rose-200 text-sm flex items-center gap-3 animate-shake">
          <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <div>
            <span className="font-bold block">Respuesta incorrecta</span>
            <span>Revisa el procedimiento e inténtalo de nuevo. {attempts >= 2 ? '¡Puedes habilitar la solución abajo!' : ''}</span>
          </div>
        </div>
      )}

      {status === 'success' && (
        <div className="mb-6 p-4 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-emerald-200 text-sm flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <span className="font-bold text-base block text-emerald-300">¡Excelente razonamiento!</span>
              <span>Has completado correctamente el desafío matemático de hoy.</span>
            </div>
          </div>
          <Award className="w-8 h-8 text-emerald-400 opacity-80 hidden sm:block" />
        </div>
      )}

      {/* Step-by-Step Solution Breakdown */}
      {showSolution && problem.solution && (
        <div className="mt-6 border-t border-slate-800 pt-5 animate-fadeIn">
          <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-400" /> Solución Paso a Paso
          </h4>
          <div className="space-y-3">
            {problem.solution.map((step, idx) => (
              <div key={idx} className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-emerald-300 font-mono text-sm sm:w-1/2">
                  <KaTeXView math={step.latex} />
                </div>
                <div className="text-slate-400 text-xs sm:w-1/2 border-t sm:border-t-0 sm:border-l border-slate-800 pt-2 sm:pt-0 sm:pl-3">
                  {step.explanation}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
