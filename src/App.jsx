import React, { lazy, Suspense, useState, useEffect, useRef } from 'react';
import {
  Calendar as CalendarIcon,
  Flame,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Check,
  Brain,
  Calculator,
  ChessKnight,
  LogOut,
  User,
  WifiOff,
  RotateCcw
} from 'lucide-react';
import MathChallenge from './components/MathChallenge';
import {
  getTodayDateString,
  formatDisplayDate,
  getDailyMathProblem,
  getSavedGrade,
  saveGrade,
  getSavedChessLevel,
  saveChessLevel,
  getSavedModule,
  saveModule,
  getDayProgress,
  markChallengeCompleted,
  getStreak,
  getTotalSolved,
  LAUNCH_DATE
} from './features/daily/dailySelector';
import {
  CHESS_LEVELS,
  DEFAULT_CHESS_LEVEL,
  isChessLevel,
  getChessLevelName,
  getDailyChessPuzzle
} from './features/daily/chessLevels';
import StatsModal from './components/StatsModal';
import { useAuth } from './context/AuthContext';
import { syncToFirestore } from './features/sync/firebaseSync';

// chess.js and the board are only downloaded when the chess module is opened
const ChessChallenge = lazy(() => import('./components/ChessChallenge'));

const GRADES = [7, 8, 9, 10, 11];

const MODULES = [
  { id: 'math', label: 'Matemáticas', detail: 'Grados 7.º a 11.º', Icon: Calculator },
  { id: 'chess', label: 'Ajedrez', detail: `Niveles ${CHESS_LEVELS[0]} a ${CHESS_LEVELS[CHESS_LEVELS.length - 1]}`, Icon: ChessKnight },
];

function ChessBoardSkeleton() {
  return (
    <div className="card p-4 sm:p-6" role="status" aria-label="Cargando el puzzle de ajedrez">
      <div className="flex gap-2 mb-5 pb-4 border-b border-[var(--line)]">
        <div className="skeleton h-7 w-40" />
        <div className="skeleton h-7 w-44" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <div className="board-frame"><div className="skeleton aspect-square w-full" /></div>
        </div>
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="skeleton h-9 w-48" />
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-20 w-full" />
          <div className="skeleton h-11 w-full" />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const { user, signInWithGoogle, logout } = useAuth();
  const [activeModule, setActiveModule] = useState(() => getSavedModule());
  const [selectedGrade, setSelectedGrade] = useState(() => getSavedGrade());
  const [chessLevel, setChessLevel] = useState(() => {
    const saved = getSavedChessLevel(DEFAULT_CHESS_LEVEL);
    return isChessLevel(saved) ? saved : DEFAULT_CHESS_LEVEL;
  });
  const [currentDateStr, setCurrentDateStr] = useState(() => getTodayDateString());
  // Everything completed on the selected date: { math: { [grade]: true }, chess: { [level]: true } }
  const [progress, setProgress] = useState(() => getDayProgress(getTodayDateString()));
  const [streak, setStreak] = useState(1);
  const [totalSolved, setTotalSolved] = useState(0);

  const [isStatsOpen, setIsStatsOpen] = useState(false);

  // Current challenges
  const [mathProblem, setMathProblem] = useState(null);
  const [chess, setChess] = useState({ status: 'loading', puzzle: null });
  const [chessReload, setChessReload] = useState(0);

  const levelListRef = useRef(null);

  useEffect(() => {
    saveGrade(selectedGrade);
    setMathProblem(getDailyMathProblem(selectedGrade, currentDateStr));
  }, [selectedGrade, currentDateStr]);

  useEffect(() => {
    setProgress(getDayProgress(currentDateStr));
    setStreak(getStreak());
    setTotalSolved(getTotalSolved());
  }, [currentDateStr]);

  useEffect(() => {
    saveModule(activeModule);
  }, [activeModule]);

  // The level file is fetched only while the chess module is open
  useEffect(() => {
    saveChessLevel(chessLevel);
    if (activeModule !== 'chess') return undefined;
    let cancelled = false;
    setChess({ status: 'loading', puzzle: null });
    getDailyChessPuzzle(chessLevel, currentDateStr)
      .then((puzzle) => {
        if (!cancelled) setChess(puzzle ? { status: 'ready', puzzle } : { status: 'error', puzzle: null });
      })
      .catch(() => {
        if (!cancelled) setChess({ status: 'error', puzzle: null });
      });
    return () => {
      cancelled = true;
    };
  }, [activeModule, chessLevel, currentDateStr, chessReload]);

  // Keep the selected level visible in the horizontal list on small screens
  useEffect(() => {
    if (activeModule !== 'chess') return;
    const list = levelListRef.current;
    const selected = list?.querySelector('[aria-pressed="true"]');
    if (list && selected) {
      list.scrollTo({ left: selected.offsetLeft - list.clientWidth / 2 + selected.clientWidth / 2 });
    }
  }, [activeModule, chessLevel]);

  const syncProgress = (dayProgress, currentStreak) => {
    if (!user) return;
    syncToFirestore(user, {
      grade: selectedGrade,
      chessLevel,
      streak: currentStreak,
      dateStr: currentDateStr,
      progress: dayProgress,
    });
  };

  useEffect(() => {
    if (user) syncProgress(getDayProgress(currentDateStr), getStreak());
  }, [user]);

  const handleChallengeSolved = (type) => {
    const key = type === 'math' ? selectedGrade : chessLevel;
    const updated = markChallengeCompleted(type, currentDateStr, key);
    setProgress(updated);
    const newStreak = getStreak();
    setStreak(newStreak);
    setTotalSolved(getTotalSolved());
    syncProgress(updated, newStreak);

    // Auto-open stats modal on success to share
    setTimeout(() => setIsStatsOpen(true), 1500);
  };

  const shiftDate = (days) => {
    const [y, m, d] = currentDateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    dateObj.setDate(dateObj.getDate() + days);
    const nextStr = getTodayDateString(dateObj);
    if (nextStr <= getTodayDateString() && nextStr >= LAUNCH_DATE) {
      setCurrentDateStr(nextStr);
    }
  };

  const isToday = currentDateStr === getTodayDateString();
  const isAtLaunchDate = currentDateStr <= LAUNCH_DATE;
  const isMath = activeModule === 'math';
  const mathDone = Boolean(progress.math[selectedGrade]);
  const chessDone = Boolean(progress.chess[chessLevel]);
  const isCompleted = isMath ? mathDone : chessDone;
  const doneCount = (map) => Object.values(map).filter(Boolean).length;

  const share = isMath
    ? {
        title: 'Desafío Diario · Matemáticas 🧠',
        detail: `🎓 ${selectedGrade}.º Grado`,
        difficulty: mathProblem ? `⚡ Dificultad: ${'⭐'.repeat(mathProblem.difficulty)}` : null,
      }
    : {
        title: 'Desafío Diario · Ajedrez ♟',
        detail: `🎯 Nivel ${chessLevel}`,
        difficulty: chess.puzzle ? `⚡ Rating del puzzle: ${chess.puzzle.rating}` : null,
      };

  return (
    <div data-module={activeModule} className="min-h-screen pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6">
        {/* TOP BAR */}
        <header className="flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3 min-w-0">
            <div className="grid place-items-center w-11 h-11 shrink-0 rounded-2xl bg-[var(--accent)] text-[var(--accent-ink)] transition-colors duration-300">
              <Brain className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-extrabold text-white leading-tight truncate">Desafío Diario</h1>
              <p className="hidden sm:block text-xs text-[var(--text-muted)]">Un reto de matemáticas y uno de ajedrez cada día</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsStatsOpen(true)}
              title="Ver mis estadísticas"
              className="btn btn-secondary text-amber-400"
            >
              <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
              <span>{streak} {streak === 1 ? 'día' : 'días'}</span>
            </button>

            {user ? (
              <div className="group relative">
                <button className="btn btn-secondary btn-icon" aria-label={`Cuenta de ${user.displayName}`}>
                  <img src={user.photoURL} alt="" className="w-7 h-7 rounded-lg" />
                </button>
                <div className="absolute right-0 top-full pt-2 w-52 opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all z-50">
                  <div className="card overflow-hidden">
                    <div className="p-3 border-b border-[var(--line)]">
                      <p className="text-sm font-semibold text-white truncate">{user.displayName}</p>
                      <p className="text-xs text-[var(--text-muted)] truncate">{user.email}</p>
                    </div>
                    <button onClick={logout} className="w-full min-h-11 text-left px-3 text-sm text-rose-400 hover:bg-[var(--surface-2)] flex items-center gap-2 transition-colors">
                      <LogOut className="w-4 h-4" /> Cerrar sesión
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={signInWithGoogle}
                title="Iniciar sesión con Google"
                aria-label="Iniciar sesión con Google"
                className="btn btn-secondary btn-icon"
              >
                <User className="w-4 h-4" />
              </button>
            )}
          </div>
        </header>

        <main>
          {/* MODULE SWITCH */}
          <div role="tablist" aria-label="Módulo" className="grid grid-cols-2 gap-2 sm:gap-3 mb-4">
            {MODULES.map(({ id, label, detail, Icon }) => {
              const count = doneCount(progress[id]);
              return (
                <button
                  key={id}
                  role="tab"
                  id={`tab-${id}`}
                  aria-selected={activeModule === id}
                  aria-controls="challenge-panel"
                  onClick={() => setActiveModule(id)}
                  className="module-tab"
                >
                  <span className="module-tab-icon"><Icon className="w-5 h-5" /></span>
                  <span className="min-w-0">
                    <span className="block font-display text-base sm:text-lg font-bold leading-tight">{label}</span>
                    <span className="hidden sm:block text-xs text-[var(--text-faint)] truncate">{detail}</span>
                  </span>
                  {count > 0 && (
                    <span className="chip chip-ok absolute -top-2 -right-1 sm:static sm:ml-auto !px-2 !bg-[#0f2a2a] sm:!bg-[var(--ok-soft)]" title={`${count} completado${count === 1 ? '' : 's'} en esta fecha`}>
                      <Check className="w-3.5 h-3.5" /> {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* DATE + DIFFICULTY */}
          <section aria-label="Fecha y dificultad" className="card p-4 sm:p-5 mb-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => shiftDate(-1)}
                  disabled={isAtLaunchDate}
                  aria-label="Día anterior"
                  className="btn btn-secondary btn-icon"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="px-2 sm:px-3 flex items-center gap-2 text-sm font-semibold text-slate-100">
                  <CalendarIcon className="w-4 h-4 text-[var(--accent)] shrink-0" />
                  <span>{formatDisplayDate(currentDateStr)}</span>
                </div>
                <button
                  onClick={() => shiftDate(1)}
                  disabled={isToday}
                  aria-label="Día siguiente"
                  className="btn btn-secondary btn-icon"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                {!isToday && (
                  <button onClick={() => setCurrentDateStr(getTodayDateString())} className="btn btn-secondary ml-1">
                    Hoy
                  </button>
                )}
              </div>

              <span className={`chip ${isCompleted ? 'chip-ok' : ''}`}>
                {isCompleted ? <><CheckCircle2 className="w-3.5 h-3.5" /> Completado</> : 'Pendiente'}
              </span>
            </div>

            {isMath ? (
              <div>
                <p className="eyebrow mb-2" id="grade-label">Elige tu grado</p>
                <div role="group" aria-labelledby="grade-label" className="flex flex-wrap gap-2">
                  {GRADES.map((g) => (
                    <button
                      key={g}
                      onClick={() => setSelectedGrade(g)}
                      aria-pressed={selectedGrade === g}
                      data-done={Boolean(progress.math[g])}
                      className="option"
                    >
                      {g}.º
                      {progress.math[g] && (
                        <span className="option-done" aria-label="completado"><Check className="w-2.5 h-2.5" strokeWidth={4} /></span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 mb-2">
                  <p className="eyebrow" id="level-label">Elige tu nivel (rating del puzzle)</p>
                  <p className="text-xs text-[var(--text-muted)]">
                    Nivel {chessLevel} · <span className="text-[var(--accent)] font-semibold">{getChessLevelName(chessLevel)}</span>
                  </p>
                </div>
                <div
                  ref={levelListRef}
                  role="group"
                  aria-labelledby="level-label"
                  className="scroll-row flex gap-2 overflow-x-auto -mx-4 px-4 py-2 sm:mx-0 sm:px-0 sm:flex-wrap sm:overflow-visible"
                >
                  {CHESS_LEVELS.map((level) => (
                    <button
                      key={level}
                      onClick={() => setChessLevel(level)}
                      aria-pressed={chessLevel === level}
                      data-done={Boolean(progress.chess[level])}
                      className="option"
                    >
                      {level}
                      {progress.chess[level] && (
                        <span className="option-done" aria-label="completado"><Check className="w-2.5 h-2.5" strokeWidth={4} /></span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* CHALLENGE */}
          <div role="tabpanel" id="challenge-panel" aria-labelledby={`tab-${activeModule}`}>
            {isMath && mathProblem && (
              <MathChallenge
                problem={mathProblem}
                onSolve={() => handleChallengeSolved('math')}
                isCompleted={mathDone}
              />
            )}

            {!isMath && chess.status === 'loading' && <ChessBoardSkeleton />}

            {!isMath && chess.status === 'error' && (
              <div className="card p-8 text-center animate-fadeIn" role="alert">
                <WifiOff className="w-10 h-10 mx-auto mb-3 text-[var(--text-faint)]" />
                <h2 className="text-lg font-bold text-white mb-1">No se pudo cargar el puzzle</h2>
                <p className="text-sm text-[var(--text-muted)] mb-4">Revisa tu conexión e inténtalo de nuevo.</p>
                <button onClick={() => setChessReload((n) => n + 1)} className="btn btn-primary">
                  <RotateCcw className="w-4 h-4" /> Reintentar
                </button>
              </div>
            )}

            {!isMath && chess.status === 'ready' && (
              <Suspense fallback={<ChessBoardSkeleton />}>
                <ChessChallenge
                  key={`${currentDateStr}-${chess.puzzle.level}-${chess.puzzle.id}`}
                  puzzle={chess.puzzle}
                  onSolve={() => handleChallengeSolved('chess')}
                  isCompleted={chessDone}
                />
              </Suspense>
            )}
          </div>
        </main>

        {/* FOOTER */}
        <footer className="mt-14 text-center border-t border-[var(--line)] pt-8 pb-4 text-xs text-[var(--text-faint)]">
          <p className="font-semibold text-[var(--text-muted)] mb-1">
            Desafío Diario — Matemáticas y ajedrez, un reto nuevo cada día.
          </p>
          <p className="mb-2">
            Puzzles de ajedrez de la{' '}
            <a className="underline underline-offset-2 hover:text-[var(--accent)]" href="https://database.lichess.org/#puzzles" target="_blank" rel="noopener noreferrer">
              base abierta de Lichess (CC0)
            </a>.
          </p>
          <p>
            ¿Encontraste un error en algún problema? Repórtalo a{' '}
            <a href="mailto:prompting.homework@gmail.com" className="underline underline-offset-2 hover:text-[var(--accent)]">
              prompting.homework@gmail.com
            </a>
          </p>
        </footer>
      </div>

      <StatsModal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        streak={streak}
        totalSolved={totalSolved}
        dateStr={currentDateStr}
        isCompleted={isCompleted}
        share={share}
      />
    </div>
  );
}
