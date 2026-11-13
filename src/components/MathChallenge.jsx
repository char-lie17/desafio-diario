import React, { useState, useEffect } from 'react';
import { Star, CheckCircle2, XCircle, Lightbulb, BookOpen, Check } from 'lucide-react';
import KaTeXView from './KaTeXView';
import MathToolbar from './MathToolbar';
import confetti from 'canvas-confetti';

function formatUserAnswerToLatex(str) {
  if (!str) return '';
  let res = str;
  // Convert fractions like (A)/(B) to \frac{A}{B}
  res = res.replace(/\(([^()]+)\)\/\(([^()]+)\)/g, '\\frac{$1}{$2}');
  // Convert sqrt(...) to \sqrt{...}
  res = res.replace(/sqrt\(([^()]+)\)/g, '\\sqrt{$1}');
  // Convert ^2 to ^2, ^(N) to ^{N}
  res = res.replace(/\^\(([^()]+)\)/g, '^{$1}');
  // Convert trig & log
  res = res.replace(/sen\(([^()]+)\)/g, '\\sin($1)');
  res = res.replace(/cos\(([^()]+)\)/g, '\\cos($1)');
  res = res.replace(/tan\(([^()]+)\)/g, '\\tan($1)');
  res = res.replace(/log\(([^()]+)\)/g, '\\log($1)');
  res = res.replace(/ln\(([^()]+)\)/g, '\\ln($1)');
  res = res.replace(/pi/g, '\\pi');
  // Convert inf to \infty
  res = res.replace(/inf/g, '\\infty');
  // Convert U to \cup
  res = res.replace(/\sU\s/g, ' \\cup ');
  // Convert <= and >=
  res = res.replace(/<=/g, '\\le ').replace(/>=/g, '\\ge ');
  return res;
}

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
        className={`w-3.5 h-3.5 ${i < diff ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`}
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

  const isChoice = problem.type === 'multiple_choice' || problem.type === 'true_false';
  const choices = problem.type === 'true_false' ? ['Verdadero', 'Falso'] : (problem.options || []);

  return (
    <section aria-label="Problema de matemáticas del día" className="card p-4 sm:p-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-5 pb-4 border-b border-[var(--line)]">
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip chip-accent">{problem.grade}.º Grado</span>
          <span className="chip">{problem.category}</span>
          {problem.subcategory && <span className="chip hidden sm:inline-flex">{problem.subcategory}</span>}
        </div>
        <div className="flex items-center gap-2">
          <span className="chip" title={`Dificultad ${problem.difficulty} de 5`}>
            <span className="sr-only">Dificultad {problem.difficulty} de 5</span>
            <span className="flex gap-0.5" aria-hidden="true">{renderStars(problem.difficulty)}</span>
          </span>
          {isCompleted && (
            <span className="chip chip-ok"><CheckCircle2 className="w-3.5 h-3.5" /> Completado</span>
          )}
        </div>
      </div>

      {/* Question */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-50 mb-2">{problem.title}</h2>
        <p className="text-slate-300 text-base leading-relaxed">{renderTextWithMath(problem.question)}</p>

        {problem.latex && (
          <div className="card-inset my-5 p-5 flex justify-center items-center text-[var(--accent)] overflow-x-auto">
            <KaTeXView math={problem.latex} displayMode={true} className="text-lg md:text-xl" />
          </div>
        )}
      </div>

      {/* Answer Inputs */}
      {status !== 'success' && (
        <div className="mb-5">
          {isChoice && choices.length > 0 && (
            <div role="radiogroup" aria-label="Opciones de respuesta" className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {choices.map((opt) => {
                const active = selectedOption === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setSelectedOption(opt)}
                    className={`min-h-13 p-3.5 rounded-[var(--radius-sm)] border text-left font-medium transition-all flex items-center justify-between gap-3 cursor-pointer ${
                      active
                        ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-slate-50 shadow-[0_0_0_1px_var(--accent)]'
                        : 'border-[var(--line)] bg-[var(--surface-2)] text-slate-200 hover:border-[var(--line-strong)] hover:bg-[var(--surface-3)]'
                    }`}
                  >
                    <span>{opt}</span>
                    <span className={`w-5 h-5 shrink-0 rounded-full border grid place-items-center transition-colors ${
                      active ? 'border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-ink)]' : 'border-[var(--line-strong)]'
                    }`}>
                      {active && <Check className="w-3 h-3" strokeWidth={4} />}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {!isChoice && (
            <div className="flex flex-col gap-3">
              <MathToolbar onInsert={(text) => setUserAnswer((prev) => prev + text)} />

              <label className="sr-only" htmlFor="math-answer">Tu respuesta</label>
              <input
                id="math-answer"
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCheckAnswer()}
                placeholder="Escribe tu respuesta…"
                autoComplete="off"
                className="field font-mono"
              />

              {/* Live Math Formatted Preview */}
              {userAnswer.trim() !== '' && (
                <div className="card-inset p-3 flex items-center gap-3 text-sm">
                  <span className="eyebrow">Vista previa</span>
                  <div className="text-[var(--accent)] font-medium">
                    <KaTeXView math={formatUserAnswerToLatex(userAnswer)} displayMode={false} />
                  </div>
                </div>
              )}

              {/* FORMATTING GUIDE (Collapsible, right below input) */}
              <details className="group card-inset overflow-hidden [&_summary::-webkit-details-marker]:hidden text-left">
                <summary className="min-h-11 px-4 cursor-pointer flex items-center justify-between text-xs font-semibold text-[var(--text-muted)] hover:text-slate-200 transition-colors select-none">
                  <span>Cómo escribir tu respuesta</span>
                  <span className="eyebrow group-open:hidden">Ver guía</span>
                  <span className="eyebrow hidden group-open:inline">Ocultar</span>
                </summary>
                <div className="px-4 pb-4 pt-1 text-xs text-[var(--text-muted)] leading-relaxed [&_code]:bg-[var(--surface-3)] [&_code]:text-[var(--accent)] [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded">
                  <ul className="list-disc pl-4 space-y-1.5">
                    <li><strong className="text-slate-200">Multiplicación:</strong> usa un asterisco, por ejemplo <code>22*sqrt(3)</code>.</li>
                    <li><strong className="text-slate-200">Fracciones:</strong> usa la barra y paréntesis, por ejemplo <code>(x+1)/(x-1)</code>.</li>
                    <li><strong className="text-slate-200">Exponentes:</strong> usa <code>^</code>, por ejemplo <code>x^2</code> o <code>2^(x+1)</code>.</li>
                    <li><strong className="text-slate-200">Raíces:</strong> escribe <code>sqrt()</code>, por ejemplo <code>sqrt(5)</code>.</li>
                  </ul>
                </div>
              </details>
            </div>
          )}

          {/* Action Row */}
          <div className="flex flex-wrap items-center gap-2 mt-5">
            {problem.hints && problem.hints.length > 0 && (
              <button type="button" onClick={() => setShowHint(!showHint)} className="btn btn-hint">
                <Lightbulb className="w-4 h-4" />
                {showHint ? 'Ocultar pista' : 'Pista'}
              </button>
            )}

            {attempts >= 2 && (
              <button type="button" onClick={() => setShowSolution(!showSolution)} className="btn btn-secondary">
                <BookOpen className="w-4 h-4" />
                {showSolution ? 'Ocultar solución' : 'Ver solución'}
              </button>
            )}

            <button
              type="button"
              onClick={handleCheckAnswer}
              disabled={isChoice ? !selectedOption : !userAnswer.trim()}
              className="btn btn-primary btn-lg ml-auto w-full sm:w-auto"
            >
              Comprobar respuesta
            </button>
          </div>
        </div>
      )}

      <div role="status" aria-live="polite" className="flex flex-col gap-3">
        {/* Hints Banner */}
        {showHint && problem.hints && (
          <div className="alert alert-hint animate-fadeIn">
            <Lightbulb className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <strong>Pista</strong>
              {problem.hints.map((hint, i) => (
                <p key={i}>{hint}</p>
              ))}
            </div>
          </div>
        )}

        {/* Feedback Messages */}
        {status === 'error' && (
          <div key={attempts} className="alert alert-bad animate-shake">
            <XCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <strong>Respuesta incorrecta</strong>
              Revisa el procedimiento e inténtalo de nuevo.{attempts >= 2 ? ' Ya puedes ver la solución.' : ''}
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="alert alert-ok animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <strong>¡Excelente razonamiento!</strong>
              Has resuelto correctamente el problema de este día.
            </div>
          </div>
        )}
      </div>

      {/* Step-by-Step Solution Breakdown */}
      {showSolution && problem.solution && (
        <div className="mt-6 border-t border-[var(--line)] pt-5 animate-fadeIn">
          <h3 className="eyebrow mb-3 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[var(--accent)]" /> Solución paso a paso
          </h3>
          <ol className="space-y-2.5">
            {problem.solution.map((step, idx) => (
              <li key={idx} className="card-inset p-3.5 flex flex-col sm:flex-row sm:items-center gap-3">
                <span className="grid place-items-center w-6 h-6 shrink-0 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] text-xs font-bold">{idx + 1}</span>
                <div className="text-[var(--accent)] text-sm sm:w-1/2 overflow-x-auto">
                  <KaTeXView math={step.latex} />
                </div>
                <div className="text-[var(--text-muted)] text-sm sm:w-1/2 border-t sm:border-t-0 sm:border-l border-[var(--line)] pt-2 sm:pt-0 sm:pl-3">
                  {step.explanation}
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
    </section>
  );
}
