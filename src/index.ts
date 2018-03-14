import {
  Widget
} from '@phosphor/widgets';

import '../style/index.css';


/**
 * The default likelihood that a random cell is alive.
 */
const LIKELIHOOD = 0.25;

/**
 * The default number of rows in a randomly generated world.
 */
const ROWS = 40;

/**
 * The default number of columns in a randomly generated world.
 */
const COLUMNS = 40;

/**
 * The default time (in ms) between generations and rendering.
 */
const INTERVAL = 250;


/**
 * A class that renders a UI for Conway's Game of Life.
 */
export
class LifeWidget extends Widget {
  /**
   * Create a Game of Life widget.
   */
  constructor(options: LifeWidget.IOptions = { }) {
    super();

    // Populate the initial state.
    this.state = options.initial || LifeWidget.random();
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

      // Use a pointer to swap lists back so their names make semantic sense.
      if (swap = !swap) {
        let prev = this._next;
        this._next = this._prev;
        this._prev = prev;
      }

      // Calculate the new state.
      this._tick(this._prev, this._next);

      // Update the UI.
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
  protected onBeforeDetach(): void {
    this.stop();
  }

  /**
   * Handle `update-request` messages.
   */
  protected onUpdateRequest(): void {
    const next = this._next;
    const prev = this._prev;
    const rows = next.length;
    const columns = next[0].length;

    for (let i = 0; i < rows; i += 1) {
      for (let j = 0; j < columns; j += 1) {
        let current = next[i][j];
        let list = this._rows[i];

        if (prev[i][j] !== current) {
          list[j].className = current ? 'ad-mod-alive' : '';
        }
      }
    }
  }

  /**
   * Render the DOM nodes for a life widget.
   */
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


/**
 * A namespace for `LifeWidget` statics.
 */
export
namespace LifeWidget {
  /**
   * The basic unit of life, `1` represents life.
   */
  export
  type Bit = 1 | 0;

  /**
   * The tick function type for calculating new generations of life.
   */
  export
  type Tick = (prev: Bit[][], next: Bit[][], fluctuation?: number) => void;

  /**
   * The instantiation options for a life widget.
   */
  export
  interface IOptions {
    /**
     * The initial state of the universe, defaults to a random world.
     */
    initial?: Bit[][];

    /**
     * The time (in ms) between generations and rendering, defaults to `250`.
     */
    interval?: number;

    /**
     * A function used to calculate generations, defaults to `LifeWidget.tick`.
     */
    tick?: Tick;
  }

  /**
   * Generates a random data set to initialize the state of the world.
   *
   * @param rows - The number of rows in the data, defaults to `40`.
   *
   * @param columns - The number of columns in the data, defaults to `40`.
   *
   * @param likelihood - The likelihood of a live cell, defaults to `0.25`.
   *
   * @returns A two-dimensional array representing the state of the world.
   */
  export
  function random(rows = ROWS, columns = COLUMNS, likelihood = LIKELIHOOD): LifeWidget.Bit[][] {
    const data = [];

    for (let i = 0; i < rows; i += 1) {
      let row: LifeWidget.Bit[] = [];

      data.push(row);

      for (let j = 0; j < columns; j += 1) {
        row[j] = Math.random() < likelihood ? 1 : 0;
      }
    }

    return data;
  }

  /**
   * Process a generation of life following Conway's original rules.
   *
   * @param input - The current state of the world.
   *
   * @param output - An array that will be populated with the next generation.
   *
   * @param fluctuation - An optional value between 0 and 1 that indicates the
   * likelihood that a bit will flip, contravening the rules.
   *
   * #### Notes
   * Instead of accepting a single state array, this function takes an `input`
   * and an `output` array to faciliate swapping back and forth between
   * generation arrays without needing to reallocate memory. The `input` and
   * `output` arrays must have the same dimensions.
   */
  export
  function tick(input: Bit[][], output: Bit[][], fluctuation = 0): void {
    const rows = input.length;
    const columns = input[0].length;
    const lastCol = columns - 1;
    const lastRow = rows - 1;

    for (let i = 0; i < rows; i += 1) {
      for (let j = 0; j < columns; j += 1) {
        let alive = input[i][j];
        let cell: Bit = 0;
        let decX = i >= 1 ? i - 1 : lastRow;      // decrement x
        let decY = j >= 1 ? j - 1 : lastCol;      // decrement y
        let incX = i + 1 <= lastRow ? i + 1 : 0;  // increment x
        let incY = j + 1 <= lastCol ? j + 1 : 0;  // increment y
        let neighbors = input[decX][decY] +
                        input[   i][decY] +
                        input[incX][decY] +
                        input[decX][   j] +
                        input[incX][   j] +
                        input[decX][incY] +
                        input[   i][incY] +
                        input[incX][incY];

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
          cell = 1 - cell as Bit;
        }

        output[i][j] = cell; // Record the tick value.
      }
    }
  }
}


/**
 * A namespace for private module data.
 */
namespace Private {
  /**
   * Create a row in the world.
   */
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

  /**
   * Create the DOM nodes representing the world.
   */
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
