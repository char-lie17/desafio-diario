import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { CheckCircle2, XCircle, Lightbulb, Eye, RotateCcw, ExternalLink, Target, Info } from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  applyUci,
  checkPuzzleMove,
  getPuzzleSolution,
  getPuzzleStart,
  getThemeHint,
  getThemeLabels,
} from '../features/daily/chessPuzzle';
import { getChessLevelName } from '../features/daily/chessLevels';

const INTRO_DELAY = 650;   // pause before the opponent's first move is shown
const REPLY_DELAY = 550;   // pause before the automatic reply
const REVEAL_DELAY = 900;  // pace of the solution playback
const WRONG_FLASH = 900;

const HIGHLIGHT = {
  lastMove: { backgroundColor: 'rgba(250, 204, 21, 0.42)' },
  selected: { backgroundColor: 'rgba(56, 189, 248, 0.6)' },
  wrong: { backgroundColor: 'rgba(244, 63, 94, 0.65)' },
  hint: { boxShadow: 'inset 0 0 0 4px #f59e0b', backgroundColor: 'rgba(245, 158, 11, 0.3)' },
  check: { background: 'radial-gradient(circle, rgba(244, 63, 94, 0.85) 0%, rgba(244, 63, 94, 0.35) 55%, transparent 75%)' },
  target: { background: 'radial-gradient(circle, rgba(8, 47, 73, 0.38) 22%, transparent 24%)' },
  capture: { background: 'radial-gradient(circle, transparent 58%, rgba(8, 47, 73, 0.38) 60%)' },
};

const PROMOTION_PIECES = [
  { code: 'q', name: 'Dama', glyph: '♛' },
  { code: 'r', name: 'Torre', glyph: '♜' },
  { code: 'b', name: 'Alfil', glyph: '♝' },
  { code: 'n', name: 'Caballo', glyph: '♞' },
];

function findKingSquare(game, color) {
  for (const row of game.board()) {
    for (const piece of row) {
      if (piece && piece.type === 'k' && piece.color === color) return piece.square;
    }
  }
  return null;
}

export default function ChessChallenge({ puzzle, onSolve, isCompleted }) {
  const start = useMemo(() => getPuzzleStart(puzzle), [puzzle]);
  const solutionSan = useMemo(() => getPuzzleSolution(puzzle), [puzzle]);
  const playerColor = start.playerColor;
  const playerMoves = Math.ceil(puzzle.solution.length / 2);

  const [fen, setFen] = useState(puzzle.startFen);
  const [moveIndex, setMoveIndex] = useState(0);
  // intro -> play <-> reply -> solved, or reveal (solution playback)
  const [phase, setPhase] = useState('intro');
  const [lastMove, setLastMove] = useState(null);
  const [selected, setSelected] = useState(null);
  const [wrongMove, setWrongMove] = useState(null);
  const [hintStep, setHintStep] = useState(0);
  const [promotion, setPromotion] = useState(null);
  const [feedback, setFeedback] = useState('idle');
  const [attempt, setAttempt] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [solvedBefore, setSolvedBefore] = useState(false);
  const timers = useRef([]);

  const later = (fn, delay) => {
    timers.current.push(setTimeout(fn, delay));
  };
  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  // Show the position before the opponent's move, then play that move so the
  // student sees what the rival just did. Runs again on every retry.
  useEffect(() => {
    setFen(puzzle.startFen);
    setMoveIndex(0);
    setPhase('intro');
    setLastMove(null);
    setSelected(null);
    setWrongMove(null);
    setHintStep(0);
    setPromotion(null);
    setFeedback('idle');
    later(() => {
      setFen(start.fen);
      setLastMove({ from: start.from, to: start.to });
      setPhase('play');
    }, INTRO_DELAY);
    return clearTimers;
  }, [puzzle, start, attempt]);

  const game = useMemo(() => new Chess(fen), [fen]);
  const canMove = phase === 'play';
  const expected = puzzle.solution[moveIndex];

  const tryMove = (from, to, promotionPiece) => {
    if (!canMove) return false;
    const candidates = game.moves({ square: from, verbose: true }).filter((move) => move.to === to);
    setSelected(null);
    if (candidates.length === 0) return false;
    if (candidates.some((move) => move.promotion) && !promotionPiece) {
      setPromotion({ from, to });
      return false;
    }

    const result = checkPuzzleMove(puzzle, fen, moveIndex, from + to + (promotionPiece || ''));
    if (!result.accepted) {
      setWrongMove({ from, to });
      setFeedback('wrong');
      setMistakes((count) => count + 1);
      later(() => setWrongMove(null), WRONG_FLASH);
      return false;
    }

    setFen(result.fen);
    setLastMove({ from, to });
    setHintStep(0);
    setWrongMove(null);

    if (result.solved) {
      setMoveIndex(puzzle.solution.length);
      setPhase('solved');
      setFeedback('solved');
      setSolvedBefore(isCompleted);
      if (!isCompleted) {
        confetti({ particleCount: 90, spread: 65, origin: { y: 0.6 } });
        if (onSolve) onSolve();
      }
      return true;
    }

    setPhase('reply');
    setFeedback('correct');
    later(() => {
      const reply = applyUci(result.fen, result.reply);
      setFen(reply.fen);
      setLastMove({ from: reply.from, to: reply.to });
      setMoveIndex(moveIndex + 2);
      setPhase('play');
    }, REPLY_DELAY);
    return true;
  };

  const handleSquareClick = ({ square }) => {
    if (!canMove) return;
    const piece = game.get(square);
    if (selected && selected !== square && !(piece && piece.color === playerColor)) {
      tryMove(selected, square);
    } else if (piece && piece.color === playerColor) {
      setSelected(selected === square ? null : square);
    } else {
      setSelected(null);
    }
  };

  const handleRetry = () => {
    clearTimers();
    setAttempt((value) => value + 1);
  };

  const handleReveal = () => {
    clearTimers();
    setPhase('reveal');
    setFeedback('reveal');
    setSelected(null);
    setHintStep(0);
    setPromotion(null);
    let position = fen;
    puzzle.solution.slice(moveIndex).forEach((uci, offset) => {
      const move = applyUci(position, uci);
      position = move.fen;
      later(() => {
        setFen(move.fen);
        setLastMove({ from: move.from, to: move.to });
        setMoveIndex(moveIndex + offset + 1);
      }, REVEAL_DELAY * (offset + 1));
    });
  };

  // ----- Board highlights -----
  const squareStyles = {};
  if (lastMove) {
    squareStyles[lastMove.from] = HIGHLIGHT.lastMove;
    squareStyles[lastMove.to] = HIGHLIGHT.lastMove;
  }
  if (game.inCheck()) {
    const kingSquare = findKingSquare(game, game.turn());
    if (kingSquare) squareStyles[kingSquare] = HIGHLIGHT.check;
  }
  if (canMove && hintStep >= 1 && expected) {
    squareStyles[expected.slice(0, 2)] = HIGHLIGHT.hint;
  }
  if (selected) {
    squareStyles[selected] = HIGHLIGHT.selected;
    game.moves({ square: selected, verbose: true }).forEach((move) => {
      squareStyles[move.to] = game.get(move.to) ? HIGHLIGHT.capture : HIGHLIGHT.target;
    });
  }
  if (wrongMove) {
    squareStyles[wrongMove.from] = HIGHLIGHT.wrong;
    squareStyles[wrongMove.to] = HIGHLIGHT.wrong;
  }
  const arrows = canMove && hintStep >= 2 && expected
    ? [{ startSquare: expected.slice(0, 2), endSquare: expected.slice(2, 4), color: '#f59e0b' }]
    : [];

  const sideName = playerColor === 'w' ? 'blancas' : 'negras';
  const playerMoveNumber = Math.min(Math.floor(moveIndex / 2) + 1, playerMoves);
  const finished = phase === 'solved' || phase === 'reveal';
  const revealDone = phase === 'reveal' && moveIndex >= puzzle.solution.length;
  const themes = getThemeLabels(puzzle);
  const boardState = phase === 'solved' ? 'solved' : wrongMove ? 'wrong' : 'idle';

  const renderFeedback = () => {
    if (feedback === 'solved') {
      return (
        <div className="alert alert-ok animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <strong>¡Puzzle resuelto!</strong>
            {solvedBefore ? 'Ya habías completado este reto. Vuelve mañana por uno nuevo.' : 'Has encontrado toda la secuencia ganadora.'}
          </div>
        </div>
      );
    }
    if (feedback === 'wrong') {
      return (
        <div key={`wrong-${mistakes}`} className="alert alert-bad animate-shake">
          <XCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <strong>Esa no es la mejor jugada</strong>
            La pieza vuelve a su sitio. Inténtalo otra vez o pide una pista.
          </div>
        </div>
      );
    }
    if (feedback === 'correct') {
      return (
        <div className="alert alert-ok animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <strong>¡Buena jugada!</strong>
            {phase === 'reply' ? 'El rival está respondiendo…' : 'El rival respondió. Encuentra la siguiente.'}
          </div>
        </div>
      );
    }
    if (feedback === 'reveal') {
      return (
        <div className="alert animate-fadeIn">
          <Eye className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <strong>{revealDone ? 'Esta era la solución' : 'Mostrando la solución…'}</strong>
            Ver la solución no completa el reto. Pulsa «Reintentar» para resolverlo por tu cuenta.
          </div>
        </div>
      );
    }
    return (
      <div className="alert">
        <Info className="w-5 h-5 shrink-0 mt-0.5" />
        <div>
          <strong>{phase === 'intro' ? 'El rival está jugando…' : 'Tu turno'}</strong>
          Arrastra una pieza, o toca la pieza y luego su casilla de destino.
        </div>
      </div>
    );
  };

  return (
    <section aria-label="Puzzle de ajedrez del día" className="card p-3 sm:p-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-5 pb-4 border-b border-[var(--line)]">
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip chip-accent">Nivel {puzzle.level} · {getChessLevelName(puzzle.level)}</span>
          <span className="chip" title="Rating real de este puzzle en Lichess">
            <Target className="w-3.5 h-3.5" /> Rating del puzzle: {puzzle.rating}
          </span>
        </div>
        {isCompleted && (
          <span className="chip chip-ok"><CheckCircle2 className="w-3.5 h-3.5" /> Completado</span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Board */}
        <div className="lg:col-span-7">
          <div className="board-frame" data-state={boardState}>
            <Chessboard
              options={{
                id: `puzzle-${puzzle.id}`,
                position: fen,
                boardOrientation: playerColor === 'w' ? 'white' : 'black',
                animationDurationInMs: 260,
                allowDragging: canMove,
                allowDrawingArrows: false,
                canDragPiece: ({ piece }) => canMove && piece.pieceType[0] === playerColor,
                onPieceDrop: ({ sourceSquare, targetSquare }) => (targetSquare ? tryMove(sourceSquare, targetSquare) : false),
                onSquareClick: handleSquareClick,
                squareStyles,
                arrows,
                boardStyle: { borderRadius: '0.75rem', overflow: 'hidden' },
                lightSquareStyle: { backgroundColor: '#e3ebf5' },
                darkSquareStyle: { backgroundColor: '#6585ad' },
                dropSquareStyle: { boxShadow: 'inset 0 0 0 4px rgba(56, 189, 248, 0.9)' },
                lightSquareNotationStyle: { color: '#4d6c94', fontWeight: 700 },
                darkSquareNotationStyle: { color: '#e3ebf5', fontWeight: 700 },
              }}
            />

            {/* Promotion picker */}
            {promotion && (
              <div
                role="dialog"
                aria-modal="true"
                aria-label="Elige la pieza de coronación"
                className="absolute inset-0 z-[100] grid place-items-center rounded-[1.125rem] bg-slate-950/75 backdrop-blur-sm animate-fadeIn"
              >
                <div className="card p-4 text-center animate-scaleIn">
                  <p className="font-display font-bold text-slate-100 mb-3">¿En qué pieza coronas?</p>
                  <div className="grid grid-cols-4 gap-2">
                    {PROMOTION_PIECES.map((piece, index) => (
                      <button
                        key={piece.code}
                        type="button"
                        autoFocus={index === 0}
                        onClick={() => {
                          const { from, to } = promotion;
                          setPromotion(null);
                          tryMove(from, to, piece.code);
                        }}
                        className="btn flex-col gap-1 h-20 w-16 px-0 bg-[#e3ebf5] hover:bg-white text-slate-900 border-[#6585ad]"
                      >
                        <span
                          aria-hidden="true"
                          className={`text-4xl leading-none ${playerColor === 'w' ? 'text-white [-webkit-text-stroke:1.5px_#0f172a]' : 'text-slate-950'}`}
                        >
                          {piece.glyph}
                        </span>
                        <span className="text-[11px] font-bold">{piece.name}</span>
                      </button>
                    ))}
                  </div>
                  <button type="button" onClick={() => setPromotion(null)} className="btn btn-secondary mt-3 w-full">
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Side panel */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span
                aria-hidden="true"
                className={`w-5 h-5 rounded-full border-2 ${playerColor === 'w' ? 'bg-slate-100 border-slate-400' : 'bg-slate-950 border-slate-500'}`}
              />
              <h3 className="text-2xl font-bold text-slate-50">Juegan {sideName}</h3>
            </div>
            <p className="text-sm text-[var(--text-muted)]">
              Encuentra la mejor jugada para las {sideName}. El rival responde solo.
            </p>
          </div>

          {/* Progress through the sequence */}
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5" aria-hidden="true">
              {Array.from({ length: playerMoves }).map((_, index) => {
                const done = index < Math.floor(moveIndex / 2) || moveIndex >= puzzle.solution.length;
                return (
                  <span
                    key={index}
                    className={`h-2 w-7 rounded-full transition-colors duration-300 ${done ? 'bg-[var(--ok)]' : 'bg-[var(--surface-3)]'}`}
                  />
                );
              })}
            </div>
            <span className="text-xs font-semibold text-[var(--text-faint)]">
              {finished ? `${playerMoves} ${playerMoves === 1 ? 'jugada' : 'jugadas'}` : `Jugada ${playerMoveNumber} de ${playerMoves}`}
            </span>
          </div>

          <div role="status" aria-live="polite">{renderFeedback()}</div>

          {canMove && hintStep >= 1 && (
            <div className="alert alert-hint animate-fadeIn">
              <Lightbulb className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <strong>Pista</strong>
                {getThemeHint(puzzle)} {hintStep === 1 ? 'La pieza que debes mover está marcada en el tablero.' : 'La flecha muestra la jugada.'}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="grid grid-cols-3 gap-2 whitespace-nowrap">
            <button
              type="button"
              className="btn btn-hint px-2"
              disabled={!canMove || hintStep >= 2}
              onClick={() => setHintStep((step) => Math.min(step + 1, 2))}
            >
              <Lightbulb className="w-4 h-4" /> {hintStep === 0 ? 'Pista' : 'Otra pista'}
            </button>
            <button type="button" className="btn btn-secondary px-2" disabled={!canMove} onClick={handleReveal}>
              <Eye className="w-4 h-4" /> Solución
            </button>
            <button type="button" className="btn btn-secondary px-2" disabled={phase === 'intro'} onClick={handleRetry}>
              <RotateCcw className="w-4 h-4" /> Reintentar
            </button>
          </div>

          {/* Solution and themes, only once the puzzle is over */}
          {(phase === 'solved' || revealDone) && (
            <div className="card-inset p-4 animate-fadeIn">
              <p className="eyebrow mb-2">Solución</p>
              <ol className="flex flex-wrap gap-x-3 gap-y-1 font-mono text-sm text-slate-200">
                {solutionSan.map((san, index) => (
                  <li key={index} className={index % 2 === 0 ? 'font-bold text-[var(--accent)]' : 'text-[var(--text-muted)]'}>
                    {san}
                  </li>
                ))}
              </ol>
              {themes.length > 0 && (
                <>
                  <p className="eyebrow mt-4 mb-2">Temas tácticos</p>
                  <div className="flex flex-wrap gap-1.5">
                    {themes.map((theme) => <span key={theme} className="chip">{theme}</span>)}
                  </div>
                </>
              )}
            </div>
          )}

          <a
            href={`https://lichess.org/training/${puzzle.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 self-start py-2 text-xs font-medium text-[var(--text-faint)] hover:text-[var(--accent)] transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Puzzle {puzzle.id} en Lichess
          </a>
        </div>
      </div>
    </section>
  );
}
