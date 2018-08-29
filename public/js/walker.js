let paint;
let socket;
let input;
let analyzer;
let r, g,b;
let start;
let bgColor;
const MIN_STEPS = 3;
const MAX_STEPS = 50;
let walker;
const generateRandom = (x = 1) => round(random(x * -1000, x * 1000) / 1000);

class Walker {
  constructor() {
    this.steps = random(MIN_STEPS, MAX_STEPS);
    this.counter = 0;
    this.setRandom();
    this.x = width / 2;
    this.y = height / 2;
    this.color = [
      random(0, 255),
      random(0, 255),
      random(0, 255)
    ];

  }

  update(data) {
    console.log(data);
    this.x = data.x;
    this.y = data.y;
    this.color = data.color;
    this.steps = data.steps;
    this.counter = data.counter;
    
  }

  setRandom() {
    this.random = {
      x: generateRandom(),
      y: generateRandom(),
      color: [
        generateRandom(random(0, 100)),
        generateRandom(random(0, 100)),
        generateRandom(random(0, 100))
      ],
      steps: random(MIN_STEPS, MAX_STEPS)
    };
  }
  getColor() {
    return [
      this.color[0] + this.random.color[0],
      this.color[1] + this.random.color[1],
      this.color[2] + this.random.color[2]
    ];
  }
  render() {
    const strokeColor = color(...this.getColor());
    strokeWeight(this.volume * 10);
    stroke(strokeColor);
    point(this.x, this.y);
  }
  step(volume) {
    this.volume = volume;
    this.x = constrain(this.x + this.random.x, 0, width - 1);
    this.y = constrain(this.y + this.random.y, 0, height - 1);
    this.counter += 1;
    if (this.counter >= this.steps) {
      this.counter = 0;
      this.setRandom();
    }
  }
}

function ticks() {
  return millis() / 100;
}

function _(id) {
  return document.getElementById(id);
}

function setup() {
  paint = createCanvas(innerWidth - 200, innerHeight);
  bgColor = '#000';
  socket = io.connect('http://localhost:3000');
  socket.on('mouse', newDrawing);
  walker = new Walker();

  // Create an Audio input
  input = new p5.AudioIn();
  input.start();

  _('clearCanvas').onclick = function(ev) {
    ev.preventDefault();
    if (confirm("Do you want to clear the canvas?")) {
      setup();
      document.body.style.background = '#000';
    } else {
      return;
    }
  }
  _('saveCanvas').onclick = function(ev) {
    ev.preventDefault();
    saveCanvas(paint, 'sketch', 'png');
    setup();
    document.body.style.background = '#000';
  }

  window.onresize = function() {
    document.getElementsByTagName('canvas')[0].style.width = innerWidth - 200;
    document.getElementsByTagName('canvas')[0].style.height = innerHeight;
  }
}

function newDrawing(data) {
  console.log(data);
  // debugger;
  const volume = data.volume;
  const otherWalker = JSON.parse(data.walker);
  console.log( 'other walker', otherWalker );
  walker.update( otherWalker );
  walker.step(data.volume);
  walker.render();

}

function draw() {
  if (!start) {
    start = millis();
  }
  // Get the overall volume (between 0 and 1.0)
  const volume = input.getLevel();
  const data = {
    input: input,
    analiyzer: analyzer,
    volume: volume,
    width: ticks(),
    walker: JSON.stringify(walker)
  }

  // If the volume > 0.1, a line is drawn.

  const threshold = 0.01;
  if (volume > threshold) {
    socket.emit('mouse', data);
    walker.step(volume);
    walker.render();
  }

}
