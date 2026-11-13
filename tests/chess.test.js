import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Chess } from 'chess.js';
import {
  getPuzzleStart,
  getPuzzleSolution,
  checkPuzzleMove,
  playPuzzleMove,
} from '../src/features/daily/chessPuzzle.js';
import { selectDailyChessPuzzle, rowToPuzzle } from '../src/features/daily/chessDaily.js';

const readJson = (path) => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
const manifest = readJson('../src/content/chess/levels.json');
const loadLevel = (level) => readJson(`../public/chess/level-${level}.json`).puzzles.map((row) => rowToPuzzle(row, level));

test('levels cover 200 to 1000 in 200-point steps, then 100-point steps', () => {
  const levels = manifest.levels.map((entry) => entry.level);
  assert.deepEqual(levels.slice(0, 5), [200, 400, 600, 800, 1000]);
  for (let i = 5; i < levels.length; i++) assert.equal(levels[i] - levels[i - 1], 100);
});

test('every puzzle in every level is unique and has a legal, complete solution', () => {
  const seen = new Set();
  for (const { level, count, minRating, maxRating } of manifest.levels) {
    const puzzles = loadLevel(level);
    assert.equal(puzzles.length, count, `level ${level} count`);
    for (const puzzle of puzzles) {
      assert.ok(!seen.has(puzzle.id), `duplicate ${puzzle.id}`);
      seen.add(puzzle.id);
      assert.ok(puzzle.rating >= minRating && puzzle.rating <= maxRating, puzzle.id);

      const start = getPuzzleStart(puzzle);
      // The opponent moves first, so the player is the side NOT to move in the dataset FEN.
      assert.notEqual(start.playerColor, new Chess(puzzle.startFen).turn(), puzzle.id);
      assert.equal(getPuzzleSolution(puzzle).length, puzzle.solution.length, puzzle.id);

      let fen = start.fen, index = 0, result;
      while (index < puzzle.solution.length) {
        result = playPuzzleMove(puzzle, fen, index, puzzle.solution[index]);
        assert.equal(result.accepted, true, puzzle.id);
        fen = result.fen;
        index = result.moveIndex;
      }
      assert.equal(result.solved, true, puzzle.id);
    }
  }
});

test('puzzles stay close to their level; out-of-range levels use the closest ratings', () => {
  for (const { level, minRating, maxRating } of manifest.levels) {
    if (level >= 600) {
      assert.ok(minRating >= level - 40 && maxRating <= level + 40, `level ${level}: ${minRating}-${maxRating}`);
    }
  }
  // The dataset has nothing near 200: that level falls back to the lowest ratings available.
  assert.ok(manifest.levels[0].maxRating < 450);
});

test('rejects illegal moves and legal incorrect moves without changing the puzzle', () => {
  const puzzle = loadLevel(1200).find((p) => p.solution.length > 1);
  const { fen } = getPuzzleStart(puzzle);
  assert.deepEqual(checkPuzzleMove(puzzle, fen, 0, 'a1a1'), { accepted: false, legal: false });
  const wrong = new Chess(fen).moves({ verbose: true }).find((m) => m.lan !== puzzle.solution[0] && !m.san.endsWith('#'));
  assert.deepEqual(checkPuzzleMove(puzzle, fen, 0, wrong.lan), { accepted: false, legal: true });
});

test('accepts alternative mates in one', () => {
  const fen = '8/7p/R7/1r4k1/6P1/5PKP/1q6/8 w - - 6 49';
  const mates = new Chess(fen).moves({ verbose: true }).filter((m) => m.san.endsWith('#'));
  assert.ok(mates.length > 1);
  assert.equal(playPuzzleMove({ solution: [mates[0].lan] }, fen, 0, mates[1].lan).solved, true);
});

test('supports underpromotion and automatic opponent replies', () => {
  const fen = '8/4P3/8/8/8/8/7k/K7 w - - 0 1';
  const promo = { solution: ['e7e8n'] };
  assert.equal(playPuzzleMove(promo, fen, 0, 'e7e8q').accepted, false);
  assert.equal(playPuzzleMove(promo, fen, 0, 'e7e8n').solved, true);

  const multi = loadLevel(1500).find((p) => p.solution.length > 1);
  const start = getPuzzleStart(multi);
  const step = checkPuzzleMove(multi, start.fen, 0, multi.solution[0]);
  assert.equal(step.solved, false);
  assert.equal(step.reply, multi.solution[1]);
  const result = playPuzzleMove(multi, start.fen, 0, multi.solution[0]);
  assert.equal(result.moveIndex, 2);
  assert.equal(result.moves.length, 2);
});

test('daily selection is stable, advances across DST dates and wraps the catalog', () => {
  const catalog = ['a', 'b', 'c'];
  assert.equal(selectDailyChessPuzzle(catalog, '2026-03-08', '2026-03-07'), 'b');
  assert.equal(selectDailyChessPuzzle(catalog, '2026-03-08', '2026-03-07'), 'b');
  assert.equal(selectDailyChessPuzzle(catalog, '2026-03-09', '2026-03-07'), 'c');
  assert.equal(selectDailyChessPuzzle(catalog, '2026-03-10', '2026-03-07'), 'a');
  assert.equal(selectDailyChessPuzzle(catalog, '2026-03-01', '2026-03-07'), 'a');
  assert.equal(selectDailyChessPuzzle([], '2026-03-08', '2026-03-07'), null);
});

test('different levels get different puzzles on the same date', () => {
  const ids = manifest.levels.map(({ level }) => selectDailyChessPuzzle(loadLevel(level), '2026-11-13', '2026-07-23').id);
  assert.equal(new Set(ids).size, ids.length);
});
