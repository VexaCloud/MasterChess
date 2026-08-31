// Renders a GameController (js/chess-core.js) as an interactive board:
// click a piece to see legal destinations as dots (chess.com-style),
// click a destination to move, or drag-and-drop. Promotion is handled
// with an in-board picker instead of prompt()/alert().
const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['1', '2', '3', '4', '5', '6', '7', '8'];

export class BoardUI {
  /**
   * @param {Object} opts
   * @param {HTMLElement} opts.container
   * @param {import('./chess-core.js').GameController} opts.controller
   * @param {'w'|'b'} [opts.orientation]
   * @param {boolean} [opts.interactive]
   * @param {(from:string,to:string,promotion?:string)=>boolean} opts.onMove - return true if the move was accepted
   * @param {'w'|'b'|null} [opts.perspectiveColor] - if set, only this color's pieces can be picked up
   */
  constructor(opts) {
    this.container = opts.container;
    this.controller = opts.controller;
    this.orientation = opts.orientation || 'w';
    this.interactive = opts.interactive !== false;
    this.onMove = opts.onMove || (() => true);
    this.perspectiveColor = opts.perspectiveColor ?? null;
    this.piecesBase = opts.piecesBase || 'assets/pieces/';

    this.selected = null;
    this.legalTargets = [];
    this.lastMove = null; // { from, to }
    this.squareEls = new Map();

    this._buildDom();
    this._bindEvents();
    this.render();
  }

  setOrientation(o) { this.orientation = o; this._buildDom(); this._bindEvents(); this.render(); }
  flip() { this.setOrientation(this.orientation === 'w' ? 'b' : 'w'); }

  setLastMove(from, to) { this.lastMove = from && to ? { from, to } : null; }

  _orderedSquares() {
    const ranks = this.orientation === 'w' ? [...RANKS].reverse() : RANKS;
    const files = this.orientation === 'w' ? FILES : [...FILES].reverse();
    const squares = [];
    for (const r of ranks) for (const f of files) squares.push(f + r);
    return squares;
  }

  _buildDom() {
    this.container.innerHTML = '';
    this.container.classList.add('board');
    this.squareEls.clear();
    const squares = this._orderedSquares();
    const files = this.orientation === 'w' ? FILES : [...FILES].reverse();
    squares.forEach((sq, i) => {
      const file = sq[0], rank = sq[1];
      const fIdx = FILES.indexOf(file), rIdx = RANKS.indexOf(rank);
      const light = (fIdx + rIdx) % 2 === 1;
      const el = document.createElement('div');
      el.className = `sq ${light ? 'light' : 'dark'}`;
      el.dataset.square = sq;

      const col = i % 8, row = Math.floor(i / 8);
      if (col === 0) {
        const r = document.createElement('span');
        r.className = 'coord rank';
        r.textContent = rank;
        el.appendChild(r);
      }
      if (row === 7) {
        const fEl = document.createElement('span');
        fEl.className = 'coord file';
        fEl.textContent = file;
        el.appendChild(fEl);
      }
      this.container.appendChild(el);
      this.squareEls.set(sq, el);
    });
  }

  _bindEvents() {
    let dragState = null;

    const squareFromPoint = (x, y) => {
      const el = document.elementFromPoint(x, y);
      const sqEl = el?.closest('.sq');
      return sqEl?.dataset.square || null;
    };

    this.container.addEventListener('pointerdown', (e) => {
      if (!this.interactive) return;
      const sqEl = e.target.closest('.sq');
      if (!sqEl) return;
      const square = sqEl.dataset.square;
      const piece = this.controller.pieceAt(square);
      const canPick = piece && piece.color === this.controller.turn &&
        (this.perspectiveColor === null || piece.color === this.perspectiveColor);

      if (this.selected && this.legalTargets.some((t) => t.to === square)) {
        this._attemptMove(this.selected, square);
        return;
      }

      if (!canPick) {
        this._clearSelection();
        return;
      }

      this._select(square);
      const pieceEl = sqEl.querySelector('.piece');
      if (!pieceEl) return;
      dragState = { from: square, pieceEl, moved: false, startX: e.clientX, startY: e.clientY };
      pieceEl.setPointerCapture?.(e.pointerId);
    });

    this.container.addEventListener('pointermove', (e) => {
      if (!dragState) return;
      const dx = e.clientX - dragState.startX, dy = e.clientY - dragState.startY;
      if (!dragState.moved && Math.hypot(dx, dy) < 4) return;
      dragState.moved = true;
      dragState.pieceEl.classList.add('dragging');
      if (!dragState.ghost) {
        const ghost = document.createElement('div');
        ghost.className = 'drag-ghost';
        ghost.style.backgroundImage = dragState.pieceEl.style.backgroundImage;
        document.body.appendChild(ghost);
        dragState.ghost = ghost;
      }
      dragState.ghost.style.left = e.clientX + 'px';
      dragState.ghost.style.top = e.clientY + 'px';
    });

    const endDrag = (e) => {
      if (!dragState) return;
      const { from, pieceEl, moved, ghost } = dragState;
      pieceEl.classList.remove('dragging');
      if (ghost) ghost.remove();
      if (moved) {
        const target = squareFromPoint(e.clientX, e.clientY);
        if (target && target !== from) this._attemptMove(from, target);
        else this._clearSelection();
      }
      dragState = null;
    };
    this.container.addEventListener('pointerup', endDrag);
    this.container.addEventListener('pointercancel', endDrag);
  }

  _select(square) {
    this.selected = square;
    this.legalTargets = this.controller.movesFrom(square);
    this._renderHighlights();
  }

  _clearSelection() {
    this.selected = null;
    this.legalTargets = [];
    this._renderHighlights();
  }

  _attemptMove(from, to) {
    const needsPromo = this.controller.needsPromotion(from, to);
    if (needsPromo) {
      this._showPromotionPicker(from, to);
      return;
    }
    const ok = this.onMove(from, to, undefined);
    this._clearSelection();
    return ok;
  }

  _showPromotionPicker(from, to) {
    const color = this.controller.pieceAt(from).color;
    const sqEl = this.squareEls.get(to);
    const picker = document.createElement('div');
    picker.className = 'promo-picker';
    ['q', 'r', 'b', 'n'].forEach((p) => {
      const btn = document.createElement('button');
      btn.style.backgroundImage = `url('${this.piecesBase}${color}${p.toUpperCase()}.svg')`;
      btn.onclick = () => {
        picker.remove();
        this.onMove(from, to, p);
        this._clearSelection();
      };
      picker.appendChild(btn);
    });
    picker.style.top = '0';
    picker.style.right = to[0] === 'h' ? '0' : 'auto';
    picker.style.left = to[0] !== 'h' ? `calc(${FILES.indexOf(to[0])} * 12.5%)` : 'auto';
    sqEl.appendChild(picker);
    setTimeout(() => {
      document.addEventListener('click', function onDoc(ev) {
        if (!picker.contains(ev.target)) { picker.remove(); document.removeEventListener('click', onDoc); }
      });
    });
  }

  _renderHighlights() {
    for (const [sq, el] of this.squareEls) {
      el.classList.toggle('selected', sq === this.selected);
      el.classList.toggle('last-from', this.lastMove?.from === sq);
      el.classList.toggle('last-to', this.lastMove?.to === sq);
      el.classList.toggle('reachable', this.legalTargets.some((t) => t.to === sq));
      const existingDot = el.querySelector('.move-dot');
      if (existingDot) existingDot.remove();
      const target = this.legalTargets.find((t) => t.to === sq);
      if (target) {
        const dot = document.createElement('div');
        dot.className = 'move-dot' + (target.isCapture ? ' capture' : '');
        el.appendChild(dot);
      }
    }
    this._renderCheckHighlight();
  }

  _renderCheckHighlight() {
    for (const el of this.squareEls.values()) el.classList.remove('in-check');
    if (this.controller.isCheck) {
      const kingSq = this.controller.squareOfKing(this.controller.turn);
      if (kingSq) this.squareEls.get(kingSq)?.classList.add('in-check');
    }
  }

  render() {
    for (const [sq, el] of this.squareEls) {
      const existingPiece = el.querySelector('.piece');
      if (existingPiece) existingPiece.remove();
      const piece = this.controller.pieceAt(sq);
      if (piece) {
        const pEl = document.createElement('div');
        pEl.className = 'piece';
        pEl.style.backgroundImage = `url('${this.piecesBase}${piece.color}${piece.type.toUpperCase()}.svg')`;
        el.appendChild(pEl);
      }
    }
    this._renderHighlights();
  }
}
