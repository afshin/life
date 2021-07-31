import {
  CellRenderer, DataGrid, DataModel, GraphicsContext, TextRenderer
} from '@lumino/datagrid';

import { Poll } from '@lumino/polling';

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
 * A namespace for `Life`.
 */
export namespace Life {
  /**
   * The `Life` style type.
   */
  export type Style = {
    alive?: string;
    empty?: string;
    size?: number;
  }

  /**
   * The minimum size of a cell in a `Life` grid.
   */
  export const MINIMUM_SIZE = 4;

  /**
   * A Lumino `DataGrid` data model for Conway's Game of Life.
   */
  export class Model extends DataModel {
    /**
     * Instantiate a new life model.
     */
    constructor(options: Model.IOptions = { }) {
      super();
      this.interval = options.interval || INTERVAL;
      this.state = options.initial || Model.random();
      this.tick = options.tick || Model.tick;
    }

    /**
     * The model's refresh interval.
     */
    get interval(): number {
      return this._ticker.frequency.interval;
    }
    set interval(interval: number) {
      if (this.interval !== interval) {
        this._ticker.frequency = { ...this._ticker.frequency, interval };
      }
    }

    /**
     * Whether the model has been disposed.
     */
    get isDisposed(): boolean {
      return this._ticker.isDisposed;
    }

    /**
     * The current state of the universe.
     */
    get state(): Model.Bit[][] {
      return this._state;
    }
    set state(state: Model.Bit[][]) {
      if (this.state !== state) {
        this._columnCount = state[0].length;
        this._rowCount = state.length;
        this._state = state;
      }
    }

    /**
     * The model's tick function.
     */
    get tick(): Model.Tick {
      return this._tick;
    }
    set tick(tick: Model.Tick) {
      if (this.tick !== tick) {
        this._tick = tick;
      }
    }

    /**
     * Get the row count for a region in the life data model.
     */
    rowCount(region: DataModel.RowRegion): number {
      return this._rowCount;
    }

    /**
     * Get the column count for a region in the life data model.
     */
    columnCount(region: DataModel.ColumnRegion): number {
      return this._columnCount;
    }

    /**
     * Get the data for a cell in the life data model.
     */
    data(region: DataModel.CellRegion, row: number, column: number): any {
      return this.state[row][column];
    }

    /**
     * Dispose the model.
     */
    dispose(): void {
      this._ticker.dispose();
    }

    /**
     * Start ticking the life widget, rendering each generation.
     */
    start(): void {
      void this._ticker.start();
    }

    /**
     * Stop ticking the life widget.
     */
    stop(): void {
      void this._ticker.stop();
    }

    private _columnCount: number;
    private _rowCount: number;
    private _state: Model.Bit[][];
    private _tick = Model.tick;
    private _ticker = new Poll({
      auto: false,
      factory: async () => {
        this.state = this.tick(this.state);
        this.emitChanged({
          type: 'cells-changed',
          rowSpan: this._rowCount,
          columnSpan: this._columnCount,
          region: 'body',
          row: 0,
          column: 0
        });
      },
    });
  }

  /**
   * A namespace for `Model` statics.
   */
  export namespace Model {
    /**
     * The basic unit of life, `1` represents life.
     */
    export
    type Bit = 1 | 0;

    /**
     * The tick function type for calculating new generations of life.
     */
    export
    type Tick = (current: Bit[][], fluctuation?: number) => Bit[][];

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
       * A function to calculate each generation, defaults to `Life.Model.tick`.
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
    export function random(rows = ROWS, columns = COLUMNS, likelihood = LIKELIHOOD): Bit[][] {
      const data = [];

      for (let i = 0; i < rows; i += 1) {
        let row: Bit[] = [];
        for (let j = 0; j < columns; j += 1) {
          row[j] = Math.random() < likelihood ? 1 : 0;
        }
        data.push(row);
      }

      return data;
    }

    /**
     * Process a generation of life following Conway's original rules.
     *
     * @param current - The current state of the world.
     *
     * @param fluctuation - An optional value between 0 and 1 that indicates the
     * likelihood that a bit will flip, contravening the rules.
     *
     * #### Notes
     * Instead of accepting a single state array, this function takes an `input`
     * and an `output` array to facilitate swapping back and forth between
     * generation arrays without needing to reallocate memory. The `input` and
     * `output` arrays must have the same dimensions.
     */
    export function tick(input: Bit[][], fluctuation = 0): Bit[][] {
      const rows = input.length;
      const columns = input[0].length;
      const lastCol = columns - 1;
      const lastRow = rows - 1;
      const output = new Array<Bit[]>(rows);

      for (let i = 0; i < rows; i += 1) {
        output[i] = new Array<Bit>(columns);
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
          // Any dead cell with exactly three live neighbors comes to life.
          if (alive && neighbors < 2) { cell = 0; }
          else if (alive && neighbors === 2 || neighbors === 3) { cell = 1; }
          else if (alive && neighbors > 3) { cell = 0; }
          else if (!alive && neighbors === 3) { cell = 1; }

          // If there is a fluctuation, flip the cell value.
          if (fluctuation && Math.random() < fluctuation) {
            cell = 1 - cell as Bit;
          }

          output[i][j] = cell;
        }
      }
      return output;
    }
  }

  /**
   * Create a `DataGrid` to render a `Life.Model`.
   *
   * @param model - The `Life` model.
   *
   * @param style - The `Life` style.
   *
   * @returns A `DataGrid` that renders the `Life` model.
   */
  export function create(model: Model, style: Style = { }): DataGrid {
    const size = Math.max(MINIMUM_SIZE, style.size || 20);
    const alive = style.alive || `rgb(0, 0, 0)`;
    const empty = style.empty || `rgb(50, 185, 25)`;
    const grid = new DataGrid({
      defaultSizes: {
        rowHeaderWidth: size,
        rowHeight: size,
        columnHeaderHeight: size,
        columnWidth: size
      },
      headerVisibility: 'none',
      minimumSizes: {
        rowHeight: MINIMUM_SIZE,
        columnWidth: MINIMUM_SIZE,
        rowHeaderWidth: MINIMUM_SIZE,
        columnHeaderHeight: MINIMUM_SIZE
      },
      style: {
        ...DataGrid.defaultStyle,
        gridLineColor: `rgba(255, 255, 255, 0.5)`,
        voidColor: 'transparent'
      }
    });
    grid.dataModel = model;
    grid.addClass('atd-Life');
    grid.disposed.connect(() => { model.dispose(); });

    class Renderer extends TextRenderer {
      paint(gc: GraphicsContext, config: CellRenderer.CellConfig): void {
        super.drawBackground(gc, { ...config, height: size, width: size });
      }
    }

    grid.cellRenderers.update({
      'body': new Renderer({
        backgroundColor: ({ value }) => value === 1 ? alive : empty
      })
    });

    return grid;
  }
}
