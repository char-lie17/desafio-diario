import json
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = os.path.join(BASE_DIR, "..", "src", "content", "chess")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Curated tactical chess puzzles dataset
CHESS_PUZZLES = [
    {
        "id": "chess-001",
        "title": "Mate del Pasillo",
        "difficulty": 1,
        "theme": "Mate en 1",
        "subtheme": "Pasillo de la Primera Fila",
        "sideToMove": "w",
        "fen": "6k1/5ppp/8/8/8/8/1R3PPP/6K1 w - - 0 1",
        "solution": ["b2b8"],
        "description": "Juegan blancas y dan mate en 1 jugada. Observa la casilla del rey enemigo.",
        "explanation": "1. Tb8# aprovecha que los peones f7-g7-h7 impiden al rey negro escapar de la octava fila.",
        "hints": ["Lleva tu torre a la octava fila."]
    },
    {
        "id": "chess-002",
        "difficulty": 2,
        "title": "Beso de la Muerte",
        "theme": "Mate en 1",
        "subtheme": "Dama y Alfil",
        "sideToMove": "w",
        "fen": "5rk1/5ppp/8/2B5/8/8/5QPP/6K1 w - - 0 1",
        "solution": ["f2f7"],
        "description": "Juegan blancas. Encuentra el mate directo apoyado por la estructura de piezas.",
        "explanation": "1. Dxf7# o Dxf8# da mate inmediatamente a la casilla indefensa del rey.",
        "hints": ["La dama apoya el ataque en f7."]
    },
    {
        "id": "chess-003",
        "difficulty": 2,
        "title": "Mate en 2 - Red de Mate con Dama y Torre",
        "theme": "Mate en 2",
        "subtheme": "Ataque Coordinado",
        "sideToMove": "w",
        "fen": "6k1/5p1p/6p1/8/8/1Q6/1R6/6K1 w - - 0 1",
        "solution": ["b3b8", "g8g7", "b8e5"],
        "description": "Juegan blancas. Corta la retirada del rey con tu Dama y Torre.",
        "explanation": "1. Db8+ Rg7 2. De5+ encierra progresivamente al rey enemigo sin escape.",
        "hints": ["Juega Db8+ primero para obligar al rey a mover a g7."]
    },
    {
        "id": "chess-004",
        "difficulty": 3,
        "title": "Ataque Doble de Caballo (Tenedor)",
        "theme": "Táctica",
        "subtheme": "Tenedor de Caballo",
        "sideToMove": "w",
        "fen": "r1bqk2r/pppp1ppp/2n5/4p3/2B1n3/5N2/PPPP1PPP/R1BQK2R w KQkq - 0 6",
        "solution": ["c4f7", "e8f7"],
        "description": "Juegan blancas. Encuentra la combinación para debilitar la posición del rey.",
        "explanation": "1. Axf7+ Rxf7 2. Cxe5+ recupera la pieza atacando rey y pieza indefensa a la vez.",
        "hints": ["Sacrifica en f7 para sacar al rey de su casilla protegida."]
    },
    {
        "id": "chess-005",
        "difficulty": 2,
        "title": "Mate Ahogado del Caballo",
        "theme": "Mate en 1",
        "subtheme": "Mate Ahogado",
        "sideToMove": "w",
        "fen": "6rk/5Npp/8/8/8/8/8/6K1 w - - 0 1",
        "solution": ["f7h6"],
        "description": "Juegan blancas. El rey negro está completamente encerrado por sus propias piezas.",
        "explanation": "El famoso mate ahogado donde el Caballo salta dando jaque directo sin que el rey pueda mover.",
        "hints": ["El rey negro no tiene ninguna casilla de escape."]
    },
    {
        "id": "chess-006",
        "difficulty": 3,
        "title": "Mate en 2 - Sacrificio de Dama",
        "theme": "Mate en 2",
        "subtheme": "Sacrificio Táctico",
        "sideToMove": "w",
        "fen": "r1b2rk1/pp3ppp/2n5/q1b5/4Q3/3B4/PPP2PPP/R1B2RK1 w - - 0 1",
        "solution": ["e4h7"],
        "description": "Juegan blancas. Amenaza letal sobre h7 apuntada por Dama y Alfil.",
        "explanation": "1. Dxh7# es mate directo apoyado por el alfil de d3 sobre el punto h7.",
        "hints": ["Apunta al punto h7 con tu Dama."]
    },
    {
        "id": "chess-007",
        "difficulty": 2,
        "title": "La Clavada Absoluta",
        "theme": "Táctica",
        "subtheme": "Clavada de Torre",
        "sideToMove": "w",
        "fen": "4r1k1/pp3ppp/8/8/8/3R4/PP3PPP/6K1 w - - 0 1",
        "solution": ["d3d8"],
        "description": "Juegan blancas. Clava o amenaza la octava fila del rey negro.",
        "explanation": "1. Td8 obliga al cambio de torres o concluye en mate del pasillo.",
        "hints": ["Ataca la torre enemiga alineada con el rey."]
    },
    {
        "id": "chess-008",
        "difficulty": 3,
        "title": "Ataque Descubierto",
        "theme": "Táctica",
        "subtheme": "Jaque Descubierto",
        "sideToMove": "w",
        "fen": "r1b1k2r/pppp1ppp/8/8/2B5/4B3/PPP2PPP/R3K2R w KQkq - 0 1",
        "solution": ["c4f7"],
        "description": "Juegan blancas. Aprovecha la mala posición del rey enemigo en el centro.",
        "explanation": "1. Axf7+ saca al rey de casilla segura rompiendo el enroque.",
        "hints": ["Ataca el punto débil f7."]
    },
    {
        "id": "chess-009",
        "difficulty": 4,
        "title": "Mate en 2 - Desviación del Defensor",
        "theme": "Mate en 2",
        "subtheme": "Desviación Táctica",
        "sideToMove": "w",
        "fen": "5r1k/6pp/8/8/8/8/1Q6/6K1 w - - 0 1",
        "solution": ["b2g7"],
        "description": "Juegan blancas. Encuentra el remate definitivo atacando g7.",
        "explanation": "1. Dxg7# da mate apoyado por la casilla de control.",
        "hints": ["Ataca la casilla g7 frente al rey."]
    },
    {
        "id": "chess-010",
        "difficulty": 1,
        "title": "Mate de la Coffin Tower",
        "theme": "Mate en 1",
        "subtheme": "Torre y Rey",
        "sideToMove": "w",
        "fen": "7k/8/5K2/8/8/8/8/7R w - - 0 1",
        "solution": ["h1h8"],
        "description": "Juegan blancas y dan jaque mate en 1 jugada.",
        "explanation": "1. Th8# acorrala al rey negro en la esquina sin huida posible.",
        "hints": ["Da jaque con la torre en la última fila."]
    },
    {
        "id": "chess-011",
        "difficulty": 2,
        "title": "Ataque Doble de Dama",
        "theme": "Táctica",
        "subtheme": "Tenedor de Dama",
        "sideToMove": "w",
        "fen": "r1bqk2r/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/R1BQK2R w KQkq - 0 1",
        "solution": ["d1d5"],
        "description": "Juegan blancas. La Dama se posiciona en d5 amenazando mate en f7 y pieza en c5.",
        "explanation": "1. Dd5 crea una doble amenaza letal de mate en f7.",
        "hints": ["Ubica tu dama en d5 apuntando a f7."]
    },
    {
        "id": "chess-012",
        "difficulty": 3,
        "title": "Mate en 2 - Batería de Alfil y Dama",
        "theme": "Mate en 2",
        "subtheme": "Batería Diagonal",
        "sideToMove": "w",
        "fen": "r4rk1/pp3ppp/8/1B6/3Q4/8/PPP2PPP/R4RK1 w - - 0 1",
        "solution": ["d4g7"],
        "description": "Juegan blancas. Remata la posición apuntando con la Dama a g7.",
        "explanation": "1. Dxg7# aprovecha la alineación diagonal para el mate fatal.",
        "hints": ["Apunta directamente al peón g7."]
    },
    {
        "id": "chess-013",
        "difficulty": 4,
        "title": "Sacrificio en h7",
        "theme": "Mate en 2",
        "subtheme": "Regalo Griego",
        "sideToMove": "w",
        "fen": "r1bq1rk1/ppp2ppp/2n5/3np3/2B5/3P1N2/PPP2PPP/R1BQ1RK1 w - - 0 1",
        "solution": ["c4d5", "d8d5"],
        "description": "Juegan blancas. Simplifica ganando centro y posición.",
        "explanation": "1. Axd5 Dxd5 elimina la pieza central defensiva del negro.",
        "hints": ["Elimina el caballo central en d5."]
    },
    {
        "id": "chess-014",
        "difficulty": 2,
        "title": "Enfilada de Torre (Skewer)",
        "theme": "Táctica",
        "subtheme": "Ataque en Rayos X",
        "sideToMove": "w",
        "fen": "4k3/8/8/8/8/8/1r6/R3K3 w - - 0 1",
        "solution": ["a1a8"],
        "description": "Juegan blancas. Fuerza al rey a moverse para capturar la pieza detrás de él.",
        "explanation": "1. Ta8+ Rey mueve y la torre blanca captura la torre negra en b2.",
        "hints": ["Da jaque en a8."]
    },
    {
        "id": "chess-015",
        "difficulty": 3,
        "title": "Mate en 2 - Red de Peón y Torre",
        "theme": "Mate en 2",
        "subtheme": "Peón Avanzado",
        "sideToMove": "w",
        "fen": "6k1/5pP1/5K2/8/8/8/8/7R w - - 0 1",
        "solution": ["h1h8"],
        "description": "Juegan blancas. El peón en g7 controla la casilla f8 y h8.",
        "explanation": "1. Th8# aprovecha el sostén de g7 que corta la casilla h8.",
        "hints": ["Tu peón en g7 le quita la casilla f8 al rey."]
    },
    {
        "id": "chess-016",
        "difficulty": 5,
        "title": "Mate de Anastacia",
        "theme": "Mate en 3",
        "subtheme": "Caballo y Torre Cooridandos",
        "sideToMove": "w",
        "fen": "5rk1/5ppp/4N3/8/8/8/5PPP/5RK1 w - - 0 1",
        "solution": ["e6f8", "g8f8", "f1f8"],
        "description": "Juegan blancas. Elimina la torre defensiva e invade la posición enemiga.",
        "explanation": "1. Cxf8 Rxf8 2. Tf8# acaba con la defensa del negro.",
        "hints": ["Captura la torre en f8 con tu caballo."]
    },
    {
        "id": "chess-017",
        "difficulty": 1,
        "title": "Mate de Pastora Corto",
        "theme": "Mate en 1",
        "subtheme": "Ataque a f7",
        "sideToMove": "w",
        "fen": "r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 0 4",
        "solution": ["f3f7"],
        "description": "Juegan blancas. El famoso Mate del Pastor directo en f7.",
        "explanation": "1. Dxf7# aprovecha que f7 solo estaba defendido por el rey.",
        "hints": ["Ataca f7 con tu dama."]
    },
    {
        "id": "chess-018",
        "difficulty": 2,
        "title": "Mate del Rey Solitario",
        "theme": "Mate en 1",
        "subtheme": "Torres Dobladas",
        "sideToMove": "w",
        "fen": "3r2k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1",
        "solution": ["d1d8"],
        "description": "Juegan blancas. Intercambio táctico resultando en jaque mate.",
        "explanation": "1. Txd8# aprovecha la falta de aire en la casilla de escape.",
        "hints": ["Captura la torre negra en d8."]
    },
    {
        "id": "math-019",
        "difficulty": 3,
        "title": "Mate de Bodan",
        "theme": "Mate en 2",
        "subtheme": "Pareja de Alfiles",
        "sideToMove": "w",
        "fen": "2kr4/ppp2ppp/8/8/2B5/8/PPP2PPP/2K1R3 w - - 0 1",
        "solution": ["c4f7"],
        "description": "Juegan blancas. Gana material atacando la pieza o peón indefenso.",
        "explanation": "1. Axf7 liquida el peón de f7 abriendo diagonales.",
        "hints": ["Captura en f7 con el alfil."]
    },
    {
        "id": "chess-020",
        "difficulty": 2,
        "title": "Clavada sobre la Dama",
        "theme": "Táctica",
        "subtheme": "Clavada de Alfil",
        "sideToMove": "w",
        "fen": "r3k2r/ppp2ppp/2n5/3q4/3P4/5B2/PPP2PPP/R2QK2R w KQkq - 0 1",
        "solution": ["f3d5"],
        "description": "Juegan blancas. Captura la Dama enemiga desprotegida.",
        "explanation": "1. Axd5 gana la Dama del bando negro.",
        "hints": ["Captura la Dama en d5."]
    }
]

def main():
    out_file = os.path.join(OUTPUT_DIR, "puzzles.json")
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(CHESS_PUZZLES, f, ensure_ascii=False, indent=2)
    print("Exported " + str(len(CHESS_PUZZLES)) + " chess puzzles to " + out_file)

if __name__ == "__main__":
    main()
