import { Chess } from 'chess.js';

function parseUci(uci) {
  return { from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] };
}

// Plays a UCI move. Returns null when the move is not legal in that position.
export function applyUci(fen, uci) {
  const game = new Chess(fen);
  try {
    const move = game.move(parseUci(uci));
    return { fen: game.fen(), san: move.san, from: move.from, to: move.to, checkmate: game.isCheckmate() };
  } catch {
    return null;
  }
}

// The position the player sees: after the opponent's first move.
export function getPuzzleStart(puzzle) {
  const start = applyUci(puzzle.startFen, puzzle.firstMove);
  if (!start) throw new Error(`Puzzle ${puzzle.id} has an illegal first move`);
  return { ...start, playerColor: start.fen.split(' ')[1] };
}

// Checks the player's move against the solution, without playing the reply.
export function checkPuzzleMove(puzzle, fen, moveIndex, uci) {
  const played = applyUci(fen, uci);
  if (!played) return { accepted: false, legal: false };
  // Lichess accepts any checkmate, not only the recorded one.
  if (uci !== puzzle.solution[moveIndex] && !played.checkmate) {
    return { accepted: false, legal: true };
  }
  const nextIndex = moveIndex + 1;
  const solved = played.checkmate || nextIndex >= puzzle.solution.length;
  return { accepted: true, legal: true, ...played, solved, reply: solved ? null : puzzle.solution[nextIndex] };
}

// Player move plus the automatic opponent reply, in one step.
export function playPuzzleMove(puzzle, fen, moveIndex, uci) {
  const result = checkPuzzleMove(puzzle, fen, moveIndex, uci);
  if (!result.accepted) return result;
  const moves = [result.san];
  let nextFen = result.fen;
  let nextIndex = moveIndex + 1;
  if (result.reply) {
    const reply = applyUci(result.fen, result.reply);
    moves.push(reply.san);
    nextFen = reply.fen;
    nextIndex += 1;
  }
  return { accepted: true, fen: nextFen, moveIndex: nextIndex, moves, solved: result.solved };
}

// Full solution in algebraic notation, starting from the player's first move.
export function getPuzzleSolution(puzzle) {
  const game = new Chess(getPuzzleStart(puzzle).fen);
  return puzzle.solution.map((uci) => game.move(parseUci(uci)).san);
}

const THEME_NAMES = {
  mateIn1: 'Mate en 1', mateIn2: 'Mate en 2', mateIn3: 'Mate en 3', mateIn4: 'Mate en 4', mateIn5: 'Mate en 5',
  backRankMate: 'Mate del pasillo', smotheredMate: 'Mate de la coz', fork: 'Doble ataque', pin: 'Clavada',
  skewer: 'Enfilada', discoveredAttack: 'Ataque descubierto', doubleCheck: 'Jaque doble',
  hangingPiece: 'Pieza indefensa', trappedPiece: 'Pieza atrapada', sacrifice: 'Sacrificio',
  deflection: 'Desviación', attraction: 'Atracción', clearance: 'Despeje', interference: 'Interferencia',
  intermezzo: 'Jugada intermedia', quietMove: 'Jugada tranquila', defensiveMove: 'Jugada defensiva',
  xRayAttack: 'Rayos X', zugzwang: 'Zugzwang', capturingDefender: 'Eliminar al defensor',
  promotion: 'Coronación', underPromotion: 'Coronación menor', advancedPawn: 'Peón avanzado',
  enPassant: 'Captura al paso', castling: 'Enroque', exposedKing: 'Rey expuesto',
  kingsideAttack: 'Ataque en el flanco de rey', queensideAttack: 'Ataque en el flanco de dama',
  opening: 'Apertura', middlegame: 'Medio juego', endgame: 'Final', rookEndgame: 'Final de torres',
  pawnEndgame: 'Final de peones', queenEndgame: 'Final de damas', bishopEndgame: 'Final de alfiles',
  knightEndgame: 'Final de caballos',
};

const THEME_HINTS = {
  mateIn1: 'Hay un jaque mate en una sola jugada.',
  mateIn2: 'Puedes dar mate en dos jugadas: empieza con una jugada que no deje escapar al rey.',
  mateIn3: 'Hay un mate forzado en tres jugadas. Busca jaques y amenazas imparables.',
  backRankMate: 'El rey rival está encerrado en su última fila.',
  smotheredMate: 'El rey rival está ahogado por sus propias piezas.',
  fork: 'Busca una jugada que ataque dos piezas a la vez.',
  pin: 'Aprovecha una pieza rival que no puede moverse sin perder algo más valioso.',
  skewer: 'Ataca una pieza valiosa que, al apartarse, deja otra expuesta detrás.',
  discoveredAttack: 'Mueve una pieza para abrir la línea de otra que está detrás.',
  doubleCheck: 'Dos piezas pueden dar jaque al mismo tiempo.',
  hangingPiece: 'Hay una pieza rival sin defensa.',
  trappedPiece: 'Una pieza rival se ha quedado sin casillas de escape.',
  sacrifice: 'Entregar material ahora da una ventaja mayor después.',
  deflection: 'Aparta a la pieza que defiende una casilla clave.',
  attraction: 'Obliga a una pieza rival a ir a una mala casilla.',
  capturingDefender: 'Elimina la pieza que sostiene la defensa rival.',
  promotion: 'Un peón está cerca de coronar.',
  underPromotion: 'Coronar una dama no siempre es lo mejor.',
  advancedPawn: 'Tu peón avanzado es la clave.',
  quietMove: 'La mejor jugada no es jaque ni captura.',
  defensiveMove: 'Primero hay que parar la amenaza del rival.',
  intermezzo: 'Antes de la jugada obvia hay otra más fuerte.',
  zugzwang: 'Deja al rival sin jugadas buenas.',
  exposedKing: 'El rey rival tiene poca protección.',
};

// Spanish labels for the themes we know, most specific first.
export function getThemeLabels(puzzle) {
  return Object.keys(THEME_NAMES).filter((key) => puzzle.themes.includes(key)).map((key) => THEME_NAMES[key]);
}

export function getThemeHint(puzzle) {
  const key = Object.keys(THEME_HINTS).find((theme) => puzzle.themes.includes(theme));
  return key ? THEME_HINTS[key] : 'Revisa primero los jaques, luego las capturas y después las amenazas.';
}
