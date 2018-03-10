var INITIAL_LIKELIHOOD = 0.25;
var QUANTUM_FLUCTUATION = 0;

var ROWS = 100;
var COLUMNS = 150;

var INTERVAL = 50;

function createRow(cells) {
  var row = document.createElement('div');

  // Populate columns.
  for (var i = 0; i < COLUMNS; i += 1) {
    var cell = document.createElement('div');

    cell.className = cells[i] ? 'alive' : '';
    row.appendChild(cell);
  }
  row.className = 'ts-Row';

  return row;
}

function createTable(data) {
  var fragment = document.createDocumentFragment();

  // Populate rows.
  for (var i = 0; i < ROWS; i += 1) {
    fragment.appendChild(createRow(data[i]));
  }

  return fragment;
}

function random(rows, columns) {
  var data = [];

  for (var x = 0; x < rows; x += 1) {
    var row = [];
    data.push(row);
    for (var y = 0; y < columns; y += 1) {
      row[y] = Math.random() < INITIAL_LIKELIHOOD ? 1 : 0;
    }
  }

  return data;
}

function update(rows, prev, next) {
  var lastCol = COLUMNS - 1;
  var lastRow = ROWS - 1;

  for (var x = 0; x < ROWS; x += 1) {
    for (var y = 0; y < COLUMNS; y += 1) {
      var alive = prev[x][y];
      var cell = 0;
      var decX = x >= 1 ? x - 1 : lastRow;      // decrement x
      var decY = y >= 1 ? y - 1 : lastCol;      // decrement y
      var incX = x + 1 <= lastRow ? x + 1 : 0;  // increment x
      var incY = y + 1 <= lastCol ? y + 1 : 0;  // increment y
      var neighbors = prev[decX][decY] +
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
      else if (alive && (neighbors === 2 || neighbors === 3)) { cell = 1; }
      else if (alive && neighbors > 3) { cell = 0; }
      else if (!alive && neighbors === 3) { cell = 1; }

      // If there is a quantum fluctuation, flip the cell value.
      if (QUANTUM_FLUCTUATION && Math.random() < QUANTUM_FLUCTUATION) {
        cell = 1 - cell;
      }

      if (prev[x][y] !== cell) {
        rows[x][y].className = cell ? 'alive' : '';
      }

      next[x][y] = cell; // Record the tick value.
    }
  }
}

window.addEventListener('load', function () {
  var prev = random(ROWS, COLUMNS);
  var next = JSON.parse(JSON.stringify(prev));
  var main = document.querySelector('main');
  var swap = false;

  main.textContent = '';
  main.appendChild(createTable(prev));

  var rows = [];
  for (var row of main.querySelectorAll('.ts-Row')) {
    rows.push(row.querySelectorAll('div'));
  }

  window.setInterval(function () {
    if (swap) {
      update(rows, next, prev);
    } else {
      update(rows, prev, next);
    }
    swap = !swap;
  }, INTERVAL);
});
