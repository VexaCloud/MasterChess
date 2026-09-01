import { Chess } from './vendor/chess.esm.js';

export class GameController {
  constructor(fen) {
    this.chess = new Chess(fen);
  }

  get fen() { return this.chess.fen(); }
  get pgn() { return this.chess.pgn(); }
  get turn() { return this.chess.turn(); } // 'w' | 'b'
  get isGameOver() { return this.chess.isGameOver(); }
  get isCheck() { return this.chess.isCheck(); }
  get isCheckmate() { return this.chess.isCheckmate(); }
  get isStalemate() { return this.chess.isStalemate(); }
  get isDraw() { return this.chess.isDraw(); }
  get history() { return this.chess.history({ verbose: true }); }

  load(fen) { this.chess.load(fen); }
  reset() { this.chess.reset(); }

  /** All legal destination squares (with capture flag) for a piece on `square`. */
  movesFrom(square) {
    return this.chess.moves({ square, verbose: true }).map((m) => ({
      to: m.to,
      isCapture: m.flags.includes('c') || m.flags.includes('e'),
      isPromotion: /=/.test(m.san),
      san: m.san,
    }));
  }

  pieceAt(square) { return this.chess.get(square); }

  board() { return this.chess.board(); } // 8x8 array, rank 8 -> rank 1

  move({ from, to, promotion }) {
    try {
      const m = this.chess.move({ from, to, promotion: promotion || 'q' });
      return m || null;
    } catch {
      return null;
    }
  }

  result() {
    if (this.chess.isCheckmate()) return this.chess.turn() === 'w' ? '0-1' : '1-0';
    if (this.chess.isDraw() || this.chess.isStalemate()) return '1/2-1/2';
    return '*';
  }

  /** Does a pending move from->to need a promotion prompt? */
  needsPromotion(from, to) {
    const piece = this.chess.get(from);
    if (!piece || piece.type !== 'p') return false;
    const targetRank = to[1];
    return (piece.color === 'w' && targetRank === '8') || (piece.color === 'b' && targetRank === '1');
  }

  squareOfKing(color) {
    const board = this.chess.board();
    for (let r = 0; r < 8; r++) {
      for (let f = 0; f < 8; f++) {
        const p = board[r][f];
        if (p && p.type === 'k' && p.color === color) return p.square;
      }
    }
    return null;
  }
}

export { Chess };
