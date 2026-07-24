import React, { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { Award, CheckCircle, Lightbulb, RotateCcw, Eye, ShieldAlert } from 'lucide-react';
import confetti from 'canvas-confetti';

// Helper: parse UCI string (e.g. "e2e4", "e7e8q") into chess.js move object
function uciToMoveObj(uci) {
  if (!uci || uci.length < 4) return null;
  const obj = { from: uci.slice(0, 2), to: uci.slice(2, 4) };
  if (uci.length > 4) obj.promotion = uci[4];
  return obj;
}

export default function ChessChallenge({ puzzle, onSolve, isCompleted }) {
  const [game, setGame] = useState(null);
  const [currentFen, setCurrentFen] = useState('start');
  const [moveIndex, setMoveIndex] = useState(0);
  const [status, setStatus] = useState(isCompleted ? 'success' : 'idle'); // 'idle', 'error', 'success'
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(isCompleted);
  const [customFeedback, setCustomFeedback] = useState('');

  useEffect(() => {
    if (puzzle && puzzle.fen) {
      try {
        const newGame = new Chess(puzzle.fen);
        setGame(newGame);
        setCurrentFen(newGame.fen());
        setMoveIndex(0);
        setStatus(isCompleted ? 'success' : 'idle');
        setShowHint(false);
        setShowSolution(isCompleted);
        setCustomFeedback('');
      } catch (e) {
        console.error('Invalid FEN:', puzzle.fen);
      }
    }
  }, [puzzle, isCompleted]);

  if (!puzzle || !game) return null;

  // Move handler
  const makeAMove = (move) => {
    try {
      const gameCopy = new Chess(game.fen());
      const result = gameCopy.move(move);

      if (!result) return false;

      // Check if move matches expected solution at current step
      const expectedUci = puzzle.solution[moveIndex];
      const actualUci = result.from + result.to + (result.promotion || '');
      const expectedNormalized = expectedUci.toLowerCase();
      const isCorrect = actualUci === expectedNormalized || (result.from + result.to) === expectedNormalized;

      if (isCorrect) {
        setGame(gameCopy);
        setCurrentFen(gameCopy.fen());
        const nextIndex = moveIndex + 1;
        setMoveIndex(nextIndex);

        if (nextIndex >= puzzle.solution.length) {
          // Complete!
          setStatus('success');
          setShowSolution(true);
          setCustomFeedback('¡Jaque Mate! Combinación ejecutada a la perfección.');
          if (!isCompleted) {
            confetti({
              particleCount: 90,
              spread: 70,
              origin: { y: 0.6 }
            });
            if (onSolve) onSolve();
          }
        } else {
          // If puzzle has opponent response move next in sequence
          setTimeout(() => {
            const oppUci = puzzle.solution[nextIndex];
            const oppMoveObj = uciToMoveObj(oppUci);
            if (oppMoveObj) {
              const oppGame = new Chess(gameCopy.fen());
              const oppResult = oppGame.move(oppMoveObj);
              if (oppResult) {
                setGame(oppGame);
                setCurrentFen(oppGame.fen());
                setMoveIndex(nextIndex + 1);
              }
            }
          }, 400);
        }
        return true;
      } else {
        // Incorrect move
        setStatus('error');
        setCustomFeedback('Esa jugada no es la mejor. ¡Inténtalo de nuevo!');
        setTimeout(() => {
          // Reset position
          const resetGame = new Chess(puzzle.fen);
          setGame(resetGame);
          setCurrentFen(resetGame.fen());
          setMoveIndex(0);
        }, 1200);
        return false;
      }
    } catch (error) {
      return false;
    }
  };

  const onDrop = (sourceSquare, targetSquare) => {
    if (status === 'success') return false;
    const move = makeAMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q', // auto-promote to queen for simplicity
    });
    return move;
  };

  const handleReset = () => {
    const resetGame = new Chess(puzzle.fen);
    setGame(resetGame);
    setCurrentFen(resetGame.fen());
    setMoveIndex(0);
    setStatus('idle');
    setCustomFeedback('');
  };

  const boardOrientation = puzzle.sideToMove === 'w' ? 'white' : 'black';

  return (
    <div className="chess-card glass-panel rounded-2xl p-6 border border-amber-500/20 bg-slate-900/80 shadow-xl transition-all">
      {/* Header Badge */}
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

      {/* Main Grid: Board + Info */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Interactive Board Container */}
        <div className="md:col-span-7 flex justify-center">
          <div className="w-full max-w-[380px] sm:max-w-[420px] aspect-square rounded-xl overflow-hidden border-2 border-slate-700 shadow-2xl bg-slate-950 p-1">
            <Chessboard
              key={puzzle.id}
              position={currentFen}
              onPieceDrop={onDrop}
              boardOrientation={boardOrientation}
              customBoardStyle={{
                borderRadius: '8px',
                boxShadow: '0 5px 15px rgba(0, 0, 0, 0.5)',
              }}
              customDarkSquareStyle={{ backgroundColor: '#2d3748' }}
              customLightSquareStyle={{ backgroundColor: '#718096' }}
            />
          </div>
        </div>

        {/* Info & Control Column */}
        <div className="md:col-span-5 flex flex-col justify-between h-full">
          <div>
            <h3 className="text-xl font-bold text-slate-100 mb-2">{puzzle.title}</h3>
            <p className="text-slate-300 text-sm leading-relaxed mb-4">{puzzle.description}</p>

            {/* Turn status indicator */}
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 mb-4 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Objetivo táctico:</span>
              <span className="text-sm font-bold text-amber-400">{puzzle.theme}</span>
            </div>
          </div>

          {/* Feedback messages */}
          {status === 'error' && (
            <div className="p-3.5 bg-rose-950/40 border border-rose-500/40 rounded-xl text-rose-200 text-xs flex items-center gap-2 animate-shake mb-4">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{customFeedback || 'Jugada incorrecta. El tablero se ha reiniciado.'}</span>
            </div>
          )}

          {status === 'success' && (
            <div className="p-3.5 bg-amber-950/40 border border-amber-500/40 rounded-xl text-amber-200 text-xs flex items-center gap-2 animate-fadeIn mb-4">
              <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>¡Completado! {puzzle.explanation}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2 mt-2">
            <button
              onClick={handleReset}
              className="flex-1 py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reiniciar
            </button>

            {puzzle.hints && puzzle.hints.length > 0 && (
              <button
                onClick={() => setShowHint(!showHint)}
                className="py-2.5 px-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-semibold rounded-xl border border-amber-500/30 transition-all flex items-center justify-center gap-1.5"
              >
                <Lightbulb className="w-3.5 h-3.5" /> Pista
              </button>
            )}

            <button
              onClick={() => setShowSolution(!showSolution)}
              className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" /> {showSolution ? 'Ocultar' : 'Solución'}
            </button>
          </div>

          {/* Hint view */}
          {showHint && puzzle.hints && (
            <div className="mt-4 p-3 bg-amber-950/30 border border-amber-500/20 rounded-xl text-amber-200 text-xs">
              <span className="font-bold block mb-1">💡 Pista Táctica:</span>
              {puzzle.hints.map((h, i) => (
                <p key={i}>{h}</p>
              ))}
            </div>
          )}

          {/* Solution view */}
          {showSolution && (
            <div className="mt-4 p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-xs">
              <span className="font-bold text-amber-400 block mb-1">Solución táctica:</span>
              <p className="font-mono text-slate-200 mb-2">{puzzle.solution.join('  ⟶  ')}</p>
              <p className="text-slate-400 text-[11px] leading-relaxed">{puzzle.explanation}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
