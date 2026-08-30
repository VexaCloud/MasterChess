/**
 * Chess core using chess.js (CDN or local)
 * Board UI can use chessboard.js or custom.
 */

// Load chess.js from CDN if not present
function loadChessJS() {
  return new Promise((resolve) => {
    if (window.Chess) return resolve(window.Chess);
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/chess.js/0.10.3/chess.min.js';
    s.onload = () => resolve(window.Chess);
    s.onerror = () => {
      // fallback modern
      const s2 = document.createElement('script');
      s2.src = 'https://cdn.jsdelivr.net/npm/chess.js@1.0.0-beta.6/dist/chess.min.js';
      s2.onload = () => resolve(window.Chess || window.chess);
      document.head.appendChild(s2);
    };
    document.head.appendChild(s);
  });
}

class GameController {
  constructor(opts = {}) {
    this.game = null;
    this.boardEl = opts.boardEl || null;
    this.onUpdate = opts.onUpdate || (() => {});
    this.onGameOver = opts.onGameOver || (() => {});
    this.orientation = opts.orientation || 'white';
    this.history = [];
  }

  async init() {
    await loadChessJS();
    const Chess = window.Chess || window.chess;
    this.game = new Chess();
    this.render();
    return this;
  }

  reset() {
    this.game.reset();
    this.history = [];
    this.render();
    this.onUpdate(this.getState());
  }

  loadFen(fen) {
    this.game.load(fen);
    this.history = [];
    this.render();
    this.onUpdate(this.getState());
  }

  loadPgn(pgn) {
    this.game.load_pgn(pgn);
    this.history = this.game.history({ verbose: true });
    this.render();
    this.onUpdate(this.getState());
  }

  move(from, to, promotion = 'q') {
    const move = this.game.move({ from, to, promotion });
    if (move) {
      this.history.push(move);
      this.render();
      this.onUpdate(this.getState());
      if (this.game.game_over()) {
        this.onGameOver(this.getResult());
      }
      return move;
    }
    return null;
  }

  undo() {
    const m = this.game.undo();
    if (m) {
      this.history.pop();
      this.render();
      this.onUpdate(this.getState());
    }
    return m;
  }

  getState() {
    return {
      fen: this.game.fen(),
      turn: this.game.turn(),
      history: this.game.history(),
      verbose: this.game.history({ verbose: true }),
      inCheck: this.game.in_check(),
      isCheckmate: this.game.in_checkmate(),
      isDraw: this.game.in_draw(),
      isStalemate: this.game.in_stalemate(),
      isGameOver: this.game.game_over(),
      legalMoves: this.game.moves({ verbose: true })
    };
  }

  getResult() {
    if (this.game.in_checkmate()) {
      return this.game.turn() === 'w' ? '0-1' : '1-0';
    }
    if (this.game.in_draw() || this.game.in_stalemate()) return '1/2-1/2';
    return '*';
  }

  // Simple text board render if no chessboard.js
  render() {
    if (!this.boardEl) return;
    // If chessboard.js is present, user should init separately
    // Fallback ASCII-style for demo
    if (!window.Chessboard && this.boardEl.dataset.mode !== 'canvas') {
      const fen = this.game.fen().split(' ')[0];
      const rows = fen.split('/');
      let html = '<div class="simple-board" style="display:grid;grid-template-columns:repeat(8,1fr);aspect-ratio:1;border:2px solid #2a2f3a;border-radius:8px;overflow:hidden;font-size:clamp(16px,4vw,28px);text-align:center;">';
      const pieces = {
        K: '♔', Q: '♕', R: '♖', B: '♗', N: '♘', P: '♙',
        k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟'
      };
      let rank = 8;
      for (const row of rows) {
        let file = 0;
        for (const ch of row) {
          if (/\d/.test(ch)) {
            for (let i = 0; i < parseInt(ch, 10); i++) {
              const light = (rank + file) % 2 === 0;
              html += `<div style="background:${light ? '#eee' : '#769656'};display:flex;align-items:center;justify-content:center;aspect-ratio:1;"></div>`;
              file++;
            }
          } else {
            const light = (rank + file) % 2 === 0;
            html += `<div style="background:${light ? '#eee' : '#769656'};display:flex;align-items:center;justify-content:center;aspect-ratio:1;">${pieces[ch] || ''}</div>`;
            file++;
          }
        }
        rank--;
      }
      html += '</div>';
      this.boardEl.innerHTML = html;
    }
  }

  fen() { return this.game.fen(); }
  turn() { return this.game.turn(); }
  moves(opts) { return this.game.moves(opts); }
  pgn() { return this.game.pgn(); }
}

if (typeof window !== 'undefined') {
  window.GameController = GameController;
  window.loadChessJS = loadChessJS;
}
