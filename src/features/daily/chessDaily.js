export function selectDailyChessPuzzle(puzzles, dateStr, launchDate) {
  if (!puzzles.length) return null;
  const days = Math.floor((Date.parse(`${dateStr}T00:00:00Z`) - Date.parse(`${launchDate}T00:00:00Z`)) / 86400000);
  return puzzles[Math.max(0, days) % puzzles.length];
}

// Turns one row of a public/chess/level-*.json file into a puzzle object.
// Lichess stores the position BEFORE the opponent's last move: `startFen` plus
// `firstMove` lead to the position the player has to solve, and `solution`
// alternates player move, opponent reply, player move...
export function rowToPuzzle([id, startFen, moves, rating, themes], level) {
  const [firstMove, ...solution] = moves.split(' ');
  return {
    id,
    level,
    rating,
    startFen,
    firstMove,
    solution,
    themes: themes ? themes.split(' ') : [],
  };
}
