"""
Desafío Diario - Chess level builder

Reads the Lichess puzzle database (lichess_db_puzzle.csv.zst, ~6 million rows)
in a single streaming pass and writes one compact JSON file per difficulty
level, so the browser only ever downloads the level it is showing.

Output:
    public/chess/level-<rating>.json   {"level": N, "puzzles": [[id, fen, moves, rating, themes], ...]}
    src/content/chess/levels.json      manifest bundled with the app (levels, counts, rating ranges)

Usage:
    pip install zstandard
    python content-engine/build_chess_levels.py [path/to/lichess_db_puzzle.csv.zst]

The selection is deterministic: the same dataset always produces the same
files, in the same order. The app maps a calendar date to a position in each
file, so regenerating from a different dataset export changes which puzzle
each date shows.
"""
import csv
import hashlib
import heapq
import io
import json
import os
import sys

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PUBLIC_DIR = os.path.join(BASE_DIR, "..", "public", "chess")
MANIFEST_PATH = os.path.join(BASE_DIR, "..", "src", "content", "chess", "levels.json")
DEFAULT_DATASET = os.path.join(os.path.expanduser("~"), "Downloads", "lichess_db_puzzle.csv.zst")

# Target puzzle ratings: 200-point steps up to 1000, then 100-point steps.
LEVELS = [200, 400, 600, 800] + list(range(1000, 2801, 100))

PUZZLES_PER_LEVEL = 730   # two years of daily puzzles before a level repeats
RATING_WINDOW = 40        # a puzzle fits a level when |rating - level| <= window

# Quality filters: settled rating, well liked, played enough to be trusted.
MAX_RATING_DEVIATION = 90
MIN_POPULARITY = 85
MIN_PLAYS = 200


def stable_hash(puzzle_id):
    """Deterministic pseudo-random order, independent of Python's hash seed."""
    return int.from_bytes(hashlib.blake2b(puzzle_id.encode(), digest_size=8).digest(), "big")


def open_dataset(path):
    if path.endswith(".zst"):
        import zstandard
        raw = zstandard.ZstdDecompressor().stream_reader(open(path, "rb"))
        return io.TextIOWrapper(raw, encoding="utf-8", newline="")
    return open(path, "r", encoding="utf-8", newline="")


def push_bounded(heap, limit, key, row):
    """Keep the `limit` rows with the smallest keys (heap stores negated keys)."""
    item = (tuple(-k for k in key), row)
    if len(heap) < limit:
        heapq.heappush(heap, item)
    elif item[0] > heap[0][0]:
        heapq.heapreplace(heap, item)


def main():
    dataset = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_DATASET
    if not os.path.exists(dataset):
        print(f"Dataset not found: {dataset}")
        sys.exit(1)

    # Twice the needed size leaves room to drop puzzles already used by a lower level.
    limit = PUZZLES_PER_LEVEL * 2
    in_window = {level: [] for level in LEVELS}   # key: (hash,)
    nearest = {level: [] for level in LEVELS}     # key: (distance, hash)

    total = kept = 0
    with open_dataset(dataset) as handle:
        reader = csv.reader(handle)
        header = next(reader)
        col = {name: i for i, name in enumerate(header)}
        for row in reader:
            total += 1
            if total % 1_000_000 == 0:
                print(f"  {total:,} rows read...")
            try:
                rating = int(row[col["Rating"]])
                if (int(row[col["RatingDeviation"]]) > MAX_RATING_DEVIATION
                        or int(row[col["Popularity"]]) < MIN_POPULARITY
                        or int(row[col["NbPlays"]]) < MIN_PLAYS):
                    continue
            except (ValueError, IndexError):
                continue

            moves = row[col["Moves"]]
            move_count = moves.count(" ") + 1
            # First move is the opponent's; the solver must have the last word.
            if move_count < 2 or move_count % 2 != 0:
                continue

            kept += 1
            puzzle_id = row[col["PuzzleId"]]
            order = stable_hash(puzzle_id)
            record = [puzzle_id, row[col["FEN"]], moves, rating, row[col["Themes"]]]

            for level in LEVELS:
                distance = abs(rating - level)
                if distance <= RATING_WINDOW:
                    push_bounded(in_window[level], limit, (order,), record)
                else:
                    heap = nearest[level]
                    # Cheap reject: most rows are farther than the current worst.
                    if len(heap) < limit or distance <= -heap[0][0][0]:
                        push_bounded(heap, limit, (distance, order), record)

    print(f"Read {total:,} puzzles, {kept:,} passed the quality filters.")

    os.makedirs(PUBLIC_DIR, exist_ok=True)
    os.makedirs(os.path.dirname(MANIFEST_PATH), exist_ok=True)

    used = set()
    manifest = []
    for level in LEVELS:
        window_rows = [r for _, r in sorted(in_window[level], key=lambda item: item[0], reverse=True)]
        nearest_rows = [r for _, r in sorted(nearest[level], key=lambda item: item[0], reverse=True)]

        chosen = []
        for record in window_rows + nearest_rows:   # nearest_rows only fill a shortfall
            if len(chosen) == PUZZLES_PER_LEVEL:
                break
            if record[0] in used:
                continue
            used.add(record[0])
            chosen.append(record)

        # Shuffle deterministically so fallback puzzles are spread across the calendar.
        chosen.sort(key=lambda record: stable_hash(f"{level}:{record[0]}"))

        ratings = [record[3] for record in chosen]
        out_path = os.path.join(PUBLIC_DIR, f"level-{level}.json")
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump({"level": level, "puzzles": chosen}, f, separators=(",", ":"))

        manifest.append({
            "level": level,
            "count": len(chosen),
            "minRating": min(ratings),
            "maxRating": max(ratings),
        })
        print(f"Level {level}: {len(chosen)} puzzles, ratings {min(ratings)}-{max(ratings)}, "
              f"{os.path.getsize(out_path) / 1024:.0f} KB")

    with open(MANIFEST_PATH, "w", encoding="utf-8") as f:
        json.dump({"source": "Lichess puzzle database (CC0)", "levels": manifest}, f, indent=2)
        f.write("\n")
    print(f"Manifest written to {os.path.normpath(MANIFEST_PATH)}")


if __name__ == "__main__":
    main()
