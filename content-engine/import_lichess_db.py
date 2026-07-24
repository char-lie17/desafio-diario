"""
Desafío Diario - Lichess Puzzle Database Importer
Extracts 365 curated tactical puzzles from the local Lichess SQLite database.
"""
import sqlite3
import json
import os

DB_PATH = r"C:\Users\carlo\Downloads\lichess_db_puzzle.sqlite"
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_FILE = os.path.join(BASE_DIR, "..", "src", "content", "chess", "puzzles.json")

# Theme distribution targets (365 total - one per day of the year)
THEME_QUOTAS = {
    "mateIn1":           60,
    "mateIn2":           70,
    "mateIn3":           40,
    "fork":              45,
    "pin":               30,
    "skewer":            20,
    "discoveredAttack":  20,
    "hangingPiece":      25,
    "sacrifice":         20,
    "deflection":        15,
    "attraction":        10,
    "backRankMate":      10,
}

# Spanish theme name mapping
THEME_NAMES_ES = {
    "mateIn1": "Mate en 1",
    "mateIn2": "Mate en 2",
    "mateIn3": "Mate en 3",
    "fork": "Doble Ataque",
    "pin": "Clavada",
    "skewer": "Enfilada",
    "discoveredAttack": "Ataque Descubierto",
    "hangingPiece": "Pieza Indefensa",
    "sacrifice": "Sacrificio Tactico",
    "deflection": "Desviacion",
    "attraction": "Atraccion",
    "backRankMate": "Mate del Pasillo",
    "crushing": "Aplastante",
    "advantage": "Ventaja Decisiva",
    "endgame": "Final",
    "middlegame": "Medio Juego",
    "opening": "Apertura",
    "short": "Corto",
    "long": "Largo",
    "quietMove": "Jugada Tranquila",
    "defensiveMove": "Jugada Defensiva",
    "clearance": "Despeje",
    "intermezzo": "Jugada Intermedia",
    "xRayAttack": "Ataque en Rayos X",
    "interference": "Interferencia",
    "doubleCheck": "Jaque Doble",
    "castling": "Enroque",
    "promotion": "Coronacion",
    "enPassant": "Captura al Paso",
    "zugzwang": "Zugzwang",
    "trappedPiece": "Pieza Atrapada",
    "kingsideAttack": "Ataque al Flanco Rey",
    "queensideAttack": "Ataque al Flanco Dama",
}

# Rating-based difficulty mapping
def rating_to_difficulty(rating):
    if rating < 1000:
        return 1
    elif rating < 1400:
        return 2
    elif rating < 1800:
        return 3
    elif rating < 2200:
        return 4
    else:
        return 5

def get_side_to_move(fen):
    """Extract side to move from FEN string."""
    parts = fen.split(" ")
    if len(parts) >= 2:
        return parts[1]  # 'w' or 'b'
    return "w"

def generate_description(themes_list, side, difficulty):
    side_str = "Blancas" if side == "w" else "Negras"
    primary = themes_list[0] if themes_list else "puzzle"
    theme_es = THEME_NAMES_ES.get(primary, primary)
    return f"Juegan {side_str}. {theme_es}. Encuentra la mejor continuacion."

def generate_hints(themes_list):
    hints = []
    for t in themes_list[:2]:
        if t == "mateIn1":
            hints.append("Busca un jaque que el rey no pueda evadir.")
        elif t == "mateIn2":
            hints.append("Piensa en forzar al rey a una posicion sin escape en dos jugadas.")
        elif t == "mateIn3":
            hints.append("Calcula tres jugadas de profundidad. Busca jaques y amenazas imparables.")
        elif t == "fork":
            hints.append("Busca una pieza que ataque dos objetivos al mismo tiempo.")
        elif t == "pin":
            hints.append("Busca alinear una pieza enemiga con su rey o una pieza de mayor valor.")
        elif t == "skewer":
            hints.append("Ataca una pieza valiosa que al moverse deja expuesta otra pieza detras.")
        elif t == "discoveredAttack":
            hints.append("Mueve una pieza para revelar un ataque de otra pieza detras de ella.")
        elif t == "hangingPiece":
            hints.append("Busca una pieza enemiga sin proteccion que puedas capturar.")
        elif t == "sacrifice":
            hints.append("A veces entregar material abre lineas decisivas. Busca sacrificios con compensacion.")
        elif t == "backRankMate":
            hints.append("El rey enemigo esta encerrado en la primera fila. Aprovecha la falta de aire.")
        elif t == "deflection":
            hints.append("Obliga a un defensor clave a abandonar su puesto.")
        elif t == "attraction":
            hints.append("Atrae una pieza enemiga a una casilla desfavorable.")
        else:
            hints.append("Analiza las debilidades en la posicion enemiga.")
    return hints if hints else ["Busca la mejor jugada tactica en la posicion."]

def main():
    print("=" * 50)
    print("DESAFIO DIARIO - LICHESS DB IMPORTER")
    print("=" * 50)

    if not os.path.exists(DB_PATH):
        print("ERROR: Database not found at " + DB_PATH)
        return

    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    # Get total count
    cur.execute("SELECT COUNT(*) FROM puzzles")
    total = cur.fetchone()[0]
    print("Total puzzles in Lichess DB: " + str(total))

    all_puzzles = []

    for theme_key, quota in THEME_QUOTAS.items():
        print("Querying theme: " + theme_key + " (target: " + str(quota) + ")...")

        query = """
            SELECT id, fen, moves, rating, rating_deviation, popularity, nb_plays, themes, game_url
            FROM puzzles
            WHERE themes LIKE ?
              AND popularity >= 80
              AND nb_plays >= 500
              AND rating_deviation <= 100
            ORDER BY popularity DESC, nb_plays DESC
            LIMIT ?
        """
        cur.execute(query, (f"%{theme_key}%", quota * 3))  # Fetch 3x to have selection margin
        rows = cur.fetchall()

        selected = 0
        for row in rows:
            if selected >= quota:
                break

            puzzle_id = row["id"]
            fen = row["fen"]
            moves_uci = row["moves"]
            rating = row["rating"]
            popularity = row["popularity"]
            nb_plays = row["nb_plays"]
            themes_raw = row["themes"] or ""
            game_url = row["game_url"] or ""

            themes_list = [t.strip() for t in themes_raw.split() if t.strip()]
            moves_list = moves_uci.strip().split()

            if len(moves_list) < 2:
                continue

            # The FEN shows the position BEFORE the opponent's last move
            # In Lichess puzzles, the first move in 'moves' is the opponent's last move
            # The user must find the SECOND move onwards
            
            # Apply the opponent's setup move to get the puzzle starting position
            try:
                import chess
                board = chess.Board(fen)
                setup_move = chess.Move.from_uci(moves_list[0])
                board.push(setup_move)
                puzzle_fen = board.fen()
                
                # The solution moves are everything after the first move
                solution_uci = moves_list[1:]
            except Exception:
                # Fallback: use original FEN and all moves if python-chess not available
                puzzle_fen = fen
                solution_uci = moves_list

            side = get_side_to_move(puzzle_fen)
            difficulty = rating_to_difficulty(rating)

            # Build primary theme name
            primary_theme = theme_key
            theme_es = THEME_NAMES_ES.get(primary_theme, primary_theme)

            # Build secondary themes list
            secondary_themes = [THEME_NAMES_ES.get(t, t) for t in themes_list if t != primary_theme][:2]

            puzzle_obj = {
                "id": "chess-" + puzzle_id,
                "lichessId": puzzle_id,
                "title": theme_es,
                "difficulty": difficulty,
                "rating": rating,
                "theme": theme_es,
                "subtheme": secondary_themes[0] if secondary_themes else "",
                "themes": [THEME_NAMES_ES.get(t, t) for t in themes_list[:4]],
                "sideToMove": side,
                "fen": puzzle_fen,
                "solution": solution_uci,
                "description": generate_description(themes_list, side, difficulty),
                "explanation": "Puzzle de Lichess con rating " + str(rating) + ". Tema principal: " + theme_es + ".",
                "hints": generate_hints(themes_list),
                "popularity": popularity,
                "nbPlays": nb_plays,
                "gameUrl": game_url,
            }

            all_puzzles.append(puzzle_obj)
            selected += 1

        print("  -> Selected " + str(selected) + "/" + str(quota) + " puzzles for " + theme_key)

    conn.close()

    # Sort by difficulty for balanced daily distribution
    all_puzzles.sort(key=lambda p: (p["difficulty"], p["rating"]))

    # Write output
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(all_puzzles, f, ensure_ascii=False, indent=2)

    print("\n" + "=" * 50)
    print("RESULT: Exported " + str(len(all_puzzles)) + " curated puzzles")
    print("Output: " + OUTPUT_FILE)

    # Print distribution summary
    diff_counts = {}
    for p in all_puzzles:
        d = p["difficulty"]
        diff_counts[d] = diff_counts.get(d, 0) + 1
    print("\nDifficulty distribution:")
    for d in sorted(diff_counts.keys()):
        labels = {1: "Facil", 2: "Basico", 3: "Intermedio", 4: "Dificil", 5: "Desafio"}
        print("  Level " + str(d) + " (" + labels.get(d, "?") + "): " + str(diff_counts[d]))

if __name__ == "__main__":
    main()
