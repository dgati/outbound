// ---------------------
// Configuration — change these at the top
// ---------------------
const CONFIG = {

  // You can play with each of the following settings, and I especially recommend:
  // cellSize
  // the Color Range
  // shapesPerFrameChance
  // walkerRange
  // shapeMarginFactor
  // You can also play with removing one or several of the shapeTypes
  canvasSize: 800,
  cellSize: 800 / 70, // size of each grid cell
  numWalkers: 200,
  // initial shapes placed at startup (can be number or fraction of numWalkers)
  initialShapeCount: 2,
  shapesBlock: true, // whether shapes occupy grid cells (walkers avoid them)
  shapesPerFrameChance: 0.2, // per-frame probability to spawn shapes
  maxShapesPerFrame: 20, // max shapes to spawn in one frame
  walkerRange: 3, // spawn walkers in a small central box of +/- this range
  rectSizes: [16, 12, 8], // cell-multipliers for the concentric rects drawn
  shapeTypes: ["circle", "square", "4dots", "triangle"],
  shapeColorRange: { r: [200, 240], g: [60, 240], b: [60, 240], a: 200 },
  shapeMarginFactor: 10, // margin for where shapes are allowed (cols / factor)

  //
  walkerStroke: 200,
  walkerStrokeWeight: 10,
};

let cols, rows;
let grid = [];
let cellSize = CONFIG.cellSize;
let walkers = [];
let numWalkers = CONFIG.numWalkers;
let shapes = []; // placed shapes filling some empty spaces
let initialShapeCount = CONFIG.initialShapeCount;
let shapesBlock = CONFIG.shapesBlock; // whether shapes mark the grid as occupied (walkers avoid them)
let shapesPerFrameChance = CONFIG.shapesPerFrameChance; // chance per frame to add a few more shapes
let maxShapesPerFrame = CONFIG.maxShapesPerFrame;

function setup() {
  createCanvas(CONFIG.canvasSize, CONFIG.canvasSize);
  cols = floor(width / cellSize);
  rows = floor(height / cellSize);

  // initialize grid: false = unvisited
  for (let i = 0; i < cols; i++) {
    grid[i] = [];
    for (let j = 0; j < rows; j++) {
      grid[i][j] = false;
    }
  }

  // create walkers at random positions (small central cluster by default)
  for (let i = 0; i < numWalkers; i++) {
    let range = CONFIG.walkerRange;
    let x = floor(random(cols / 2 - range, cols / 2 + range));
    let y = floor(random(rows / 2 - range, rows / 2 + range));
    // let x = floor(random(cols / 2 - range, cols / 2 + range));
    // let y = floor(random(rows / 2 - range, rows / 2 + range));
    // const marginX = floor(cols / CONFIG.shapeMarginFactor);
    // const marginY = floor(rows / CONFIG.shapeMarginFactor);
    // let x = floor(random(cols));
    // let y = floor(random(rows));
    // x = floor(constrain(x, marginX * 2, cols - marginX * 2 - 1));
    // y = floor(constrain(y, marginY, rows - marginY - 1));
    walkers.push(new Walker(x, y, i));
  }

  background(0, 0, 20);

  // populate initial shapes into empty cells
  populateShapes(initialShapeCount, shapesBlock);
}

function draw() {
  // draw static shapes first so walker paths are drawn on top
  drawShapes();

  // occasionally add a few more shapes over time based on chance
  if (random() < shapesPerFrameChance) {
    const n = floor(random(1, maxShapesPerFrame + 1));
    populateShapes(n, shapesBlock);
  }

  let active = false;
  for (let w of walkers) {
    if (!w.stuck) {
      w.step();
      w.show();
      active = true;
    }
  }

  // if (!active) {
  //   noLoop(); // stop when all walkers are stuck
  // }
  rectMode(CENTER);
  fill(0);
  stroke(255, 255);
  strokeWeight(1);
  // draw concentric rects using the sizes in CONFIG.rectSizes
  for (let s of CONFIG.rectSizes) {
    rect(width / 2, height / 2, cellSize * (s / 4), cellSize * (s / 4));
  }
}

// draw stored shapes (called each frame)
function drawShapes() {
  noStroke();
  for (let s of shapes) {
    // skip shapes if that grid cell is already occupied by a walker path
    // if (grid[s.x] && grid[s.x][s.y]) continue;
    push();
    translate(s.x * cellSize + cellSize / 2, s.y * cellSize + cellSize / 2);
    fill(s.col);
    // draw a few shape types
    if (s.type === "circle") {
      let divisor = 8;
      ellipse(
        -cellSize / divisor,
        -cellSize / divisor,
        cellSize * 0.2,
        cellSize * 0.2
      );
      ellipse(
        cellSize / divisor,
        cellSize / divisor,
        cellSize * 0.2,
        cellSize * 0.2
      );
      ellipse(
        cellSize / divisor,
        -cellSize / divisor,
        cellSize * 0.2,
        cellSize * 0.2
      );
      ellipse(
        -cellSize / divisor,
        cellSize / divisor,
        cellSize * 0.2,
        cellSize * 0.2
      );
    } else if (s.type === "square") {
      rectMode(CENTER);
      rect(0, 0, cellSize * 0.9, cellSize * 0.9);
    } else if (s.type === "4dots") {
      ellipse(0, 0, cellSize * 0.4, cellSize * 0.4);
    } else if (s.type === "triangle") {
      triangle(
        -cellSize / 2 + 1,
        -cellSize / 2 + 1,
        cellSize / 2 - 1,
        cellSize / 2 - 1,
        -cellSize / 2 + 1,
        cellSize / 2 - 1
      );
    }
    pop();
  }
}

// populate `count` random empty cells with shapes; if markGrid is true, mark those cells occupied
function populateShapes(count, markGrid = true) {
  if (!cols || !rows) return;

  let empties = [];
  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      if (!grid[x][y]) empties.push({ x, y });
    }
  }

  if (empties.length === 0) return;

  empties = shuffle(empties);
  const take = min(count, empties.length);
  for (let i = 0; i < take; i++) {
    const p = empties[i];
    const types = CONFIG.shapeTypes;
    const type = random(types);
    // give shapes a visible color using the configured ranges
    const rc = CONFIG.shapeColorRange;
    const col = color(
      random(rc.r[0], rc.r[1]),
      random(rc.g[0], rc.g[1]),
      random(rc.b[0], rc.b[1]),
      rc.a
    );
    // constrain p.x and p.y to an inner area and convert to integer grid indices
    const marginX = floor(cols / CONFIG.shapeMarginFactor);
    const marginY = floor(rows / CONFIG.shapeMarginFactor);
    const px = floor(constrain(p.x, marginX, cols - marginX - 1));
    const py = floor(constrain(p.y, marginY, rows - marginY - 1));

    shapes.push({ x: px, y: py, type, col });
    // Do NOT mark the main `grid` here. `grid` tracks walker visits only.
    // If markGrid is true we might have previously marked shapes into grid which
    // prevented them from being drawn; instead we'll handle blocking in Walker.step
    // by checking shapes when `shapesBlock` is enabled.
    // markGrid = true;
  }
}

// return the index of a shape at x,y or -1 if none
function shapeAt(x, y) {
  for (let i = 0; i < shapes.length; i++) {
    if (shapes[i].x === x && shapes[i].y === y) return i;
  }
  return -1;
}

class Walker {
  constructor(x, y, id) {
    this.x = x;
    this.y = y;
    this.path = [];
    this.path.push(createVector(this.x, this.y));
    grid[this.x][this.y] = true;
    this.stuck = false;

    // assign color (cycling hues)
    // colorMode(HSB, 360, 100, 100, 100);
    // this.col = color((id * 40) % 360, 80, 100, 90);
    this.col = color(255);
  }

  step() {
    let options = [];

    let dirs = [
      createVector(1, 0),
      createVector(-1, 0),
      createVector(0, 1),
      createVector(0, -1),
    ];

    for (let d of dirs) {
      let nx = this.x + d.x;
      let ny = this.y + d.y;
      if (nx >= 0 && nx < cols && ny >= 0 && ny < rows) {
        // treat a neighbor as available only if it's not been visited by a walker
        // and (if shapesBlock) it doesn't contain a shape
        const hasVisited = grid[nx] && grid[nx][ny];
        const hasShape = shapeAt(nx, ny) !== -1;
        if (!hasVisited && !(shapesBlock && hasShape)) {
          options.push(d);
          shapesBlock = true;
        }
      }
    }

    if (options.length > 0) {
      let choice = random(options);
      this.x += choice.x;
      this.y += choice.y;
      grid[this.x][this.y] = true;
      this.path.push(createVector(this.x, this.y));
    } else {
      this.stuck = true; // no moves left
    }
  }

  show() {
    stroke(this.col);
    strokeWeight(2);
    noFill();
    beginShape();
    for (let v of this.path) {
      curveVertex(v.x * cellSize + cellSize / 2, v.y * cellSize + cellSize / 2);
    }
    endShape();
  }
}
