// Generates a fresh tactics puzzle using the local Stockfish engine.
// Used by puzzles.html whenever get-puzzle reports the bank has nothing
// unseen left near the player's rating (see supabase/functions/get-puzzle).
//
// How it works:
//  1. Walk forward from the start position with semi-random, shallow-Stockfish
//     -weighted moves (not pure random — pieces aren't hung for no reason,
//     but the game isn't "real" either) to reach a varied middlegame position.
//  2. At each resulting position, ask Stockfish for the top 2 lines at real
//     depth. If the best move clearly outclasses the second-best (a big
//     centipawn swing, or a forced mate where the alternative isn't mate),
//     that position is a genuine tactic: save the position *before* that
//     move as the puzzle, and the engine's principal variation as the
//     solution the player has to find.
import { GameController } from './chess-core.js';

const SWING_THRESHOLD_CP = 250;

function scoreValue(line) {
  if (!line) return -Infinity;
  if (line.type === 'mate') return line.value > 0 ? 100000 - line.value : -100000 - line.value;
  return line.value;
}

async function weightedRandomMove(engine, controller) {
  const legalCount = controller.chess.moves().length;
  if (legalCount === 0) return null;
  if (Math.random() < 0.35) {
    // Occasionally just play a random legal move for opening variety.
    const moves = controller.chess.moves();
    return moves[Math.floor(Math.random() * moves.length)];
  }
  const lines = await engine.evaluateLines(controller.fen, { depth: 7, lines: 3 });
  if (!lines.length) {
    const moves = controller.chess.moves();
    return moves[Math.floor(Math.random() * moves.length)];
  }
  // Weighted pick favouring the better lines, but not always the very best.
  const weights = lines.map((_, i) => 1 / (i + 1));
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  let idx = 0;
  for (; idx < weights.length; idx++) { r -= weights[idx]; if (r <= 0) break; }
  const chosen = lines[Math.min(idx, lines.length - 1)];
  const uci = chosen.pv[0];
  return uci; // UCI form, e.g. "e2e4"
}

function applyUci(controller, uci) {
  const from = uci.slice(0, 2), to = uci.slice(2, 4), promotion = uci.slice(4) || undefined;
  return controller.move({ from, to, promotion });
}

/**
 * @param {import('./stockfish-engine.js').StockfishEngine} engine - already init()'d
 * @param {{targetRating?: number, maxAttempts?: number, onProgress?: (msg:string)=>void}} opts
 */
export async function generatePuzzle(engine, opts = {}) {
  const targetRating = opts.targetRating ?? 1000;
  const maxAttempts = opts.maxAttempts ?? 18;
  const onProgress = opts.onProgress || (() => {});

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    onProgress(`Playing out position ${attempt + 1}/${maxAttempts}...`);
    const controller = new GameController();
    engine.newGame();

    const plyTarget = 10 + Math.floor(Math.random() * 22); // 10-31 plies
    let ok = true;
    for (let ply = 0; ply < plyTarget; ply++) {
      if (controller.isGameOver) { ok = false; break; }
      const uci = await weightedRandomMove(engine, controller);
      if (!uci || !applyUci(controller, uci)) { ok = false; break; }
    }
    if (!ok || controller.isGameOver) continue;

    onProgress('Analysing for a tactic...');
    const fenBefore = controller.fen;
    const lines = await engine.evaluateLines(fenBefore, { depth: 16, lines: 2 });
    if (lines.length < 1) continue;

    const best = lines[0];
    const second = lines[1];
    const bestVal = scoreValue(best);
    const secondVal = second ? scoreValue(second) : -Infinity;
    const swing = bestVal - secondVal;

    // Require a real tactic: either a forced mate the alternative doesn't
    // give, or a large, decisive centipawn swing between best and 2nd best.
    const isMateWin = best.type === 'mate' && best.value > 0 && !(second?.type === 'mate' && second.value > 0);
    if (!isMateWin && swing < SWING_THRESHOLD_CP) continue;
    // Skip if the position was already a complete blowout before this move
    // (both lines already winning huge) — not an interesting puzzle.
    if (!isMateWin && secondVal > 700) continue;

    const pv = best.pv;
    const solutionLen = Math.min(pv.length, best.type === 'mate' ? Math.abs(best.value) * 2 - 1 : 3);
    const solutionUci = pv.slice(0, Math.max(1, solutionLen));

    // Verify the whole solution replays legally (defensive — PV should
    // always be legal, but the puzzle bank must never get bad data).
    const verifyController = new GameController(fenBefore);
    let valid = true;
    for (const uci of solutionUci) {
      if (!applyUci(verifyController, uci)) { valid = false; break; }
    }
    if (!valid) continue;

    const rating = Math.max(400, Math.min(2600, Math.round(
      targetRating + (swing / 10) - 60 + (Math.random() * 120 - 60)
    )));

    return {
      fen: fenBefore,
      moves: solutionUci,
      rating,
      themes: isMateWin ? ['mate'] : swing > 500 ? ['tactic'] : ['advantage'],
      evalSwing: Math.round(swing),
    };
  }

  return null;
}
