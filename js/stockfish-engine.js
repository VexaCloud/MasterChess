/**
 * Stockfish.js integration for MasterChess
 * Uses nmrugg/stockfish.js (lite single recommended for browsers)
 * Place stockfish-18-lite-single.js + .wasm in js/stockfish/ or use CDN fallback.
 * Docs: https://github.com/nmrugg/stockfish.js
 */

class StockfishEngine {
  constructor(options = {}) {
    this.worker = null;
    this.ready = false;
    this.listeners = [];
    this.skillLevel = options.skillLevel ?? 10;
    this.depth = options.depth ?? 12;
    this.movetime = options.movetime ?? null;
    this.onMessage = options.onMessage || (() => {});
    this.enginePath = options.path || 'js/stockfish/stockfish.js';
  }

  async init() {
    return new Promise((resolve, reject) => {
      try {
        // Prefer Worker. Fallback paths for different builds.
        const paths = [
          this.enginePath,
          'js/stockfish/stockfish-18-lite-single.js',
          'https://cdn.jsdelivr.net/npm/stockfish.js@10.0.2/stockfish.js'
        ];
        let loaded = false;
        const tryLoad = (i) => {
          if (i >= paths.length) {
            reject(new Error('Could not load Stockfish. Download from https://github.com/nmrugg/stockfish.js and place in js/stockfish/'));
            return;
          }
          try {
            this.worker = new Worker(paths[i]);
            this.worker.onmessage = (e) => this._handleMessage(e.data);
            this.worker.onerror = () => {
              this.worker = null;
              tryLoad(i + 1);
            };
            // UCI handshake
            this.post('uci');
            this.post('isready');
            const timeout = setTimeout(() => {
              if (!this.ready) {
                this.ready = true; // some builds respond slowly
                resolve(this);
              }
            }, 3000);
            this._readyResolve = () => {
              clearTimeout(timeout);
              this.ready = true;
              resolve(this);
            };
            loaded = true;
          } catch (err) {
            tryLoad(i + 1);
          }
        };
        tryLoad(0);
      } catch (err) {
        reject(err);
      }
    });
  }

  _handleMessage(line) {
    if (typeof line !== 'string') line = line?.data || String(line);
    this.onMessage(line);
    if (line.includes('uciok') || line.includes('readyok')) {
      if (this._readyResolve) {
        this._readyResolve();
        this._readyResolve = null;
      }
      this.ready = true;
    }
    if (line.startsWith('bestmove')) {
      const match = line.match(/bestmove\s+(\S+)/);
      const ponder = line.match(/ponder\s+(\S+)/);
      this.listeners.forEach(fn => fn({
        type: 'bestmove',
        move: match ? match[1] : null,
        ponder: ponder ? ponder[1] : null,
        raw: line
      }));
    }
    if (line.startsWith('info')) {
      const scoreMatch = line.match(/score (cp|mate) (-?\d+)/);
      const depthMatch = line.match(/depth (\d+)/);
      const pvMatch = line.match(/pv (.+)/);
      if (scoreMatch || depthMatch) {
        this.listeners.forEach(fn => fn({
          type: 'info',
          score: scoreMatch ? { type: scoreMatch[1], value: parseInt(scoreMatch[2], 10) } : null,
          depth: depthMatch ? parseInt(depthMatch[1], 10) : null,
          pv: pvMatch ? pvMatch[1].split(' ') : null,
          raw: line
        }));
      }
    }
  }

  post(cmd) {
    if (this.worker) this.worker.postMessage(cmd);
  }

  setSkillLevel(level) {
    // 0-20 for Stockfish Skill Level
    this.skillLevel = Math.max(0, Math.min(20, level));
    this.post(`setoption name Skill Level value ${this.skillLevel}`);
  }

  setDepth(d) {
    this.depth = d;
  }

  newGame() {
    this.post('ucinewgame');
    this.post('isready');
  }

  position(fen, moves = []) {
    let cmd = fen === 'startpos' ? 'position startpos' : `position fen ${fen}`;
    if (moves.length) cmd += ' moves ' + moves.join(' ');
    this.post(cmd);
  }

  go(options = {}) {
    const depth = options.depth ?? this.depth;
    const movetime = options.movetime ?? this.movetime;
    let cmd = 'go';
    if (movetime) cmd += ` movetime ${movetime}`;
    else cmd += ` depth ${depth}`;
    this.post(cmd);
  }

  stop() {
    this.post('stop');
  }

  onBestMove(fn) {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter(f => f !== fn);
    };
  }

  analyze(fen, depth = 15) {
    return new Promise((resolve) => {
      const unsub = this.onBestMove((msg) => {
        if (msg.type === 'bestmove') {
          unsub();
          resolve(msg);
        }
      });
      this.newGame();
      this.position(fen);
      this.go({ depth });
    });
  }

  getBestMove(fen, skill, depth) {
    if (skill != null) this.setSkillLevel(skill);
    if (depth != null) this.setDepth(depth);
    return this.analyze(fen, depth ?? this.depth);
  }

  terminate() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.ready = false;
  }
}

if (typeof window !== 'undefined') {
  window.StockfishEngine = StockfishEngine;
}
