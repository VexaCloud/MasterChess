// Wraps the vendored Stockfish 18 WASM worker (js/stockfish/stockfish-18-lite-single.js)
// with a small promise-based UCI interface: best move for bot play, and
// multi-PV evaluation for puzzle generation / hints / eval bars.
export class StockfishEngine {
  constructor(options = {}) {
    this.worker = null;
    this.ready = false;
    this.skillLevel = options.skillLevel ?? 10;
    this.depth = options.depth ?? 12;
    this.path = options.path || 'js/stockfish/stockfish-18-lite-single.js';
    this._listeners = [];
  }

  init() {
    return new Promise((resolve, reject) => {
      try {
        this.worker = new Worker(this.path);
      } catch (err) {
        reject(new Error('Could not start the Stockfish worker: ' + err.message));
        return;
      }
      this.worker.onmessage = (e) => this._handle(typeof e.data === 'string' ? e.data : String(e.data));
      this.worker.onerror = (err) => reject(new Error('Stockfish worker error: ' + err.message));
      const timeout = setTimeout(() => { this.ready = true; resolve(this); }, 4000);
      this._onReady = () => { clearTimeout(timeout); this.ready = true; resolve(this); };
      this.post('uci');
      this.post('isready');
    });
  }

  post(cmd) { this.worker?.postMessage(cmd); }

  _handle(line) {
    if (line.includes('uciok') || line.includes('readyok')) this._onReady?.();
    this._listeners.forEach((fn) => fn(line));
  }

  setSkillLevel(level) {
    this.skillLevel = Math.max(0, Math.min(20, level));
    this.post(`setoption name Skill Level value ${this.skillLevel}`);
  }

  newGame() { this.post('ucinewgame'); this.post('isready'); }

  /** Best move at a given depth/skill, used for bot play & hints. */
  bestMove(fen, { depth, skillLevel, movetime } = {}) {
    if (skillLevel != null) this.setSkillLevel(skillLevel);
    return new Promise((resolve) => {
      const onLine = (line) => {
        if (line.startsWith('bestmove')) {
          this._listeners = this._listeners.filter((f) => f !== onLine);
          const m = line.match(/bestmove\s+(\S+)/);
          resolve(m ? m[1] : null);
        }
      };
      this._listeners.push(onLine);
      this.post('position fen ' + fen);
      this.post(movetime ? `go movetime ${movetime}` : `go depth ${depth ?? this.depth}`);
    });
  }

  /**
   * Multi-line evaluation: returns up to `lines` principal variations with
   * their centipawn/mate scores, sorted best-first (from White's perspective
   * is normalised by the caller if needed — these are from the side to move).
   */
  evaluateLines(fen, { depth = 14, lines = 2 } = {}) {
    return new Promise((resolve) => {
      const results = new Map();
      const onLine = (line) => {
        if (line.startsWith('info') && line.includes('score')) {
          const multipv = parseInt(line.match(/multipv (\d+)/)?.[1] || '1', 10);
          const scoreMatch = line.match(/score (cp|mate) (-?\d+)/);
          const pv = line.match(/ pv (.+)/)?.[1]?.split(' ');
          const depthMatch = line.match(/depth (\d+)/);
          if (scoreMatch && pv) {
            results.set(multipv, {
              type: scoreMatch[1],
              value: parseInt(scoreMatch[2], 10),
              pv,
              depth: depthMatch ? parseInt(depthMatch[1], 10) : 0,
            });
          }
        }
        if (line.startsWith('bestmove')) {
          this._listeners = this._listeners.filter((f) => f !== onLine);
          this.post(`setoption name MultiPV value 1`);
          const arr = [...results.entries()].sort((a, b) => a[0] - b[0]).map(([, v]) => v);
          resolve(arr);
        }
      };
      this._listeners.push(onLine);
      this.post(`setoption name MultiPV value ${lines}`);
      this.post('position fen ' + fen);
      this.post(`go depth ${depth}`);
    });
  }

  stop() { this.post('stop'); }

  terminate() {
    this.worker?.terminate();
    this.worker = null;
    this.ready = false;
  }
}
