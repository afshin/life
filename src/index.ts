import {
  Message
} from '@phosphor/messaging';

import {
  Widget
} from '@phosphor/widgets';

import '../style/index.css';


const LIKELIHOOD = 0.25;

const ROWS = 40;
const COLUMNS = 40;

const INTERVAL = 250;


export
class LifeWidget extends Widget {
  /**
   * Create a Game of Life widget.
   */
  constructor(options: LifeWidget.IOptions = { }) {
    super();

    // Populate the initial state.
    this.state = options.initial || LifeWidget.random(ROWS, COLUMNS);
    this._interval = options.interval || INTERVAL;
    this._tick = options.tick || LifeWidget.tick;

    this.addClass('ad-LifeWidget');
  }

  /**
   * The current state of the universe.
   */
  get state(): LifeWidget.Bit[][] {
    return this._next;
  }
  set state(state: LifeWidget.Bit[][]) {
    if (this._started) {
      this.stop();
    }

    // Populate the data.
    this._prev = state;
    this._next = JSON.parse(JSON.stringify(state));

    // Populate the node.
    this._render();
  }

  /**
   * Start ticking the life widget, rendering each generation.
   */
  start(): void {
    let swap = false;

    if (this._started) {
      this.stop();
    }

    this._started = window.setInterval(() => {
      if (!this.isAttached) {
        return;
      }

      if (swap = !swap) {
        // Use a pointer to swap them back so their names make semantic sense.
        let prev = this._next;
        this._next = this._prev;
        this._prev = prev;
      }

      this._tick(this._prev, this._next);
      this.update();
    }, this._interval);
  }

  /**
   * Stop ticking the life widget.
   */
  stop(): void {
    if (this._started) {
      window.clearInterval(this._started);
      this._started = 0;
    }
  }

  /**
   * Handle `before-detach` messages.
   */
  protected onBeforeDetach(msg: Message): void {
    this.stop();
  }

  /**
   * Handle `update-request` messages.
   */
  protected onUpdateRequest(msg: Message): void {
    const next = this._next;
    const prev = this._prev;
    const rows = next.length;
    const columns = next[0].length;

    for (let x = 0; x < rows; x += 1) {
      for (let y = 0; y < columns; y += 1) {
        let current = next[x][y];

        if (prev[x][y] !== current) {
          this._rows[x][y].className = current ? 'ad-mod-alive' : '';
        }
      }
    }
  }

  private _render(): void {
    const { node, state } = this;

    // Empty the node and populate its HTML.
    node.textContent = '';
    node.appendChild(Private.createTable(state));

    // Populate a cached handle to each row and cell.
    const rows = node.querySelectorAll('.ad-LifeWidget-row');

    this._rows = [];

    for (let i = 0; i < rows.length; i += 1) {
      this._rows.push(rows[i].querySelectorAll('div'));
    }
  }

  private _interval: number;
  private _next: LifeWidget.Bit[][];
  private _prev: LifeWidget.Bit[][];
  private _rows: NodeListOf<HTMLElement>[];
  private _started: number;
  private _tick: LifeWidget.Tick;
}


export
namespace LifeWidget {
  export
  type Bit = 1 | 0;

  export
  type Tick = (prev: Bit[][], next: Bit[][], fluctuation?: number) => void;

  export
  interface IOptions {
    initial?: Bit[][];

    interval?: number;

    tick?: Tick;
  }

  export
  function random(rows: number, columns: number, likelihood = LIKELIHOOD): LifeWidget.Bit[][] {
    const data = [];

    for (let x = 0; x < rows; x += 1) {
      let row: LifeWidget.Bit[] = [];

      data.push(row);

      for (let y = 0; y < columns; y += 1) {
        row[y] = Math.random() < likelihood ? 1 : 0;
      }
    }

    return data;
  }

  /**
   * Process and render a generation of life following Conway's original rules.
   *
   * @param prev - The previous state of the world.
   *
   * @param next - An array that will be populated with the next generation.
   *
   * @param fluctuation - An optional value between 0 and 1 that indicates the
   * likelihood that a bit will flip, contravening the rules.
   *
   * #### Notes
   * Instead of accepting a single state array, this function takes a `prev` and
   * `next` array to faciliate swapping back and forth between generation arrays
   * without needing to reallocate memory. The `prev` and `next` arrays must
   * have the same dimensions.
   */
  export
  function tick(prev: Bit[][], next: Bit[][], fluctuation = 0): void {
    const rows = prev.length;
    const columns = prev[0].length;
    const lastCol = columns - 1;
    const lastRow = rows - 1;

    for (let x = 0; x < rows; x += 1) {
      for (let y = 0; y < columns; y += 1) {
        let alive = prev[x][y];
        let cell: Bit = 0;
        let decX = x >= 1 ? x - 1 : lastRow;      // decrement x
        let decY = y >= 1 ? y - 1 : lastCol;      // decrement y
        let incX = x + 1 <= lastRow ? x + 1 : 0;  // increment x
        let incY = y + 1 <= lastCol ? y + 1 : 0;  // increment y
        let neighbors = prev[decX][decY] +
                        prev[   x][decY] +
                        prev[incX][decY] +
                        prev[decX][   y] +
                        prev[incX][   y] +
                        prev[decX][incY] +
                        prev[   x][incY] +
                        prev[incX][incY];

        // Any live cell with fewer than two live neighbors dies.
        // Any live cell with two or three live neighbors lives.
        // Any live cell with more than three live neighbors dies.
        // Any dead cell with exactly three live neighbors becomes a live cell.
        if (alive && neighbors < 2) { cell = 0; }
        else if (alive && neighbors === 2 || neighbors === 3) { cell = 1; }
        else if (alive && neighbors > 3) { cell = 0; }
        else if (!alive && neighbors === 3) { cell = 1; }

        // If there is a fluctuation, flip the cell value.
        if (fluctuation && Math.random() < fluctuation) {
          cell = 1 - cell as 1 | 0;
        }

        next[x][y] = cell; // Record the tick value.
      }
    }
  }
}


namespace Private {
  export
  function createRow(cells: LifeWidget.Bit[]): HTMLElement {
    const row = document.createElement('div');
    const columns = cells.length;

    // Populate columns.
    for (let i = 0; i < columns; i += 1) {
      const cell = document.createElement('div');

      cell.className = cells[i] ? 'ad-mod-alive' : '';
      row.appendChild(cell);
    }
    row.className = 'ad-LifeWidget-row';

    return row;
  }

  export
  function createTable(data: LifeWidget.Bit[][]): DocumentFragment {
    const fragment = document.createDocumentFragment();
    const rows = data.length;

    // Populate rows.
    for (let i = 0; i < rows; i += 1) {
      fragment.appendChild(createRow(data[i]));
    }

    return fragment;
  }
}