let paint;
let socket;
let input;
let analyzer;
let r,g,b;
let start;
let bgColor;
let brushColor = '#16161d';
let particleStepMax;
let p;

function Particle() {
  this.x = windowWidth / 2;
  this.y = windowHeight / 2;
  this.oldX = this.x;
  this.oldY = this.y;
}

Particle.prototype.move = function(newX, newY, volume) {
  this.volume = volume;
  this.oldX = this.x;
  this.oldY = this.y;
  this.x += newX;
  this.y += newY;
  if (this.x < 0)
    this.x = 0;
  if (this.x > paint.width)
    this.x = paint.width;
  if (this.y < 0)
    this.y = 0;
  if (this.y > paint.height)
    this.y = paint.height;
  }

Particle.prototype.draw = function() {
  strokeWeight(this.volume * 10);
  line(this.oldX, this.oldY, this.x, this.y);
}

function ticks() {
  return millis() / 100;
}

function _(id) {
  return document.getElementById(id);
}

function setup() {
  paint = createCanvas(innerWidth - 200, innerHeight);
  bgColor = '#f4f5eb';
  socket = io.connect('http://localhost:3000');
  socket.on('mouse', newDrawing);
  particleStepMax = 50;
  p = new Particle();

  // Select the colour of the brush //

  _('brushColor').onchange = function() {
    brushColor = _('brushColor').value;
  };

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
  stroke(data.brushColor);
  fill(data.brushColor);
  p.move(data.x, data.y, data.volume);
  p.draw();

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
    brushColor: brushColor,
    width: ticks(),
    x: random(-particleStepMax, particleStepMax),
    y: random(-particleStepMax, particleStepMax)

  }
  // If the volume > 0.05,  a line is drawn.
  // The louder the volume, the larger the line.
  const threshold = 0.05;
  if (volume > threshold) {
    socket.emit('mouse', data);
    stroke(brushColor);
    fill(brushColor);
    p.move(data.x, data.y, volume);
    p.draw();
  }

}
