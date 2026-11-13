# Desafío Diario

Retos diarios en español: un problema de matemáticas por grado (7.º a 11.º) y un puzzle de ajedrez por nivel de rating. React, Vite, Tailwind, KaTeX, chess.js y react-chessboard; Firebase para la autenticación y para enviar el progreso a Firestore.

## Desarrollo

```sh
npm ci
npm run dev
npm test
npm run lint
npm run build
npm run preview
```

El build se publica desde `dist/` en Netlify. Las pruebas (`node:test`) reproducen la solución de todos los puzzles de ajedrez con chess.js y comprueban las jugadas incorrectas, las coronaciones, los mates alternativos y la selección por fecha; tardan unos 20 segundos.

## Módulo de ajedrez

- **Niveles:** 200, 400, 600, 800, 1000 y, a partir de ahí, de 100 en 100 hasta 2800. Cada nivel es un rating objetivo e independiente del grado escolar.
- **Un puzzle por día y nivel:** la fecha y el nivel determinan el puzzle, así que todos los usuarios ven el mismo y no cambia al recargar ni al cambiar de nivel.
- **Rating real:** cada puzzle está a ±40 puntos de su nivel y la tarjeta muestra su rating real. La base de Lichess no tiene puzzles por debajo de 399, por lo que el nivel 200 usa los más fáciles disponibles (399–407) y el nivel 400 usa 407–440.
- **Tablero:** se muestra primero la jugada del rival y después juega el estudiante, arrastrando o tocando pieza y casilla. Incluye coronación con selector de pieza, respuesta automática del rival, pista en dos pasos, solución animada y reintento. Ver la solución no completa el reto.
- **Progreso:** se guarda por fecha y nivel en `localStorage` y se envía a Firestore con el mismo patrón que matemáticas.

## Preparar los datos de ajedrez

Los datos ya generados están en el repositorio; solo hay que repetir este paso para cambiar los niveles, los filtros o la versión de la base.

1. Descarga `lichess_db_puzzle.csv.zst` de la [Lichess Open Database](https://database.lichess.org/#puzzles) (licencia CC0, unos 6,2 millones de puzzles). Guárdala fuera del repositorio.
2. Instala la dependencia de Python:

   ```sh
   pip install zstandard
   ```

3. Genera los archivos (la ruta es opcional; por defecto busca en `~/Downloads`):

   ```sh
   python content-engine/build_chess_levels.py "C:/ruta/a/lichess_db_puzzle.csv.zst"
   ```

   También está disponible como `npm run build:chess`.

4. Comprueba el resultado con `npm test` y revisa el diff antes de publicar.

El script lee el archivo comprimido en una sola pasada, sin descomprimirlo en disco (alrededor de un minuto). Conserva los puzzles con rating estable (desviación ≤ 90), popularidad ≥ 85 y al menos 200 partidas, y elige 730 por nivel (dos años sin repetir) con un orden determinista basado en el ID. Escribe:

- `public/chess/level-<nivel>.json`: un archivo por nivel, de unos 100 KB, con filas `[id, fen, jugadas, rating, temas]` tal como vienen en Lichess. El navegador solo descarga el nivel que se está mostrando.
- `src/content/chess/levels.json`: lista de niveles, cantidad y rango real de ratings; se incluye en el bundle.

Volver a generar con otra versión de la base o con otros filtros cambia qué puzzle corresponde a cada fecha.

## Progreso

Matemáticas guarda las finalizaciones por fecha y grado; ajedrez, por fecha y nivel. Resolver cualquier reto del día mantiene la racha, como máximo una vez al día. Los datos se guardan en el dispositivo y las finalizaciones se envían a Firestore al iniciar sesión y al resolver. Iniciar sesión en otro dispositivo todavía no descarga el historial.
