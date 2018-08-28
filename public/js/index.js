var brushColor;
var bgColor;
var drawSize;
var penStyle;
var paint;
var socket;
var input;
var analyzer;
var r, g, b;
var start;
function ticks () {
  return millis() / 10;
}

function _(id) {
  return document.getElementById(id);
}

function setup() {
  paint = createCanvas(innerWidth - 200, innerHeight);
  socket = io.connect('http://localhost:3000');
  socket.on('mouse', newDrawing);
  brushColor = '#151718';
  bgColor = '#f1ebeb';
  drawSize = 3;
  penStyle = 'pencil';
  // Create an Audio input
  input = new p5.AudioIn();
  input.start();
  r = random(255);
  g = random(255);
  b = random(255);

  _('brushColor').value = brushColor;
  _('bgColor').value = bgColor;
  _('brush').checked = false;
  _('square').checked = false;
  _('eraser').checked = false;
  document.getElementsByTagName('canvas')[0].style.cursor = "crosshair";

  _('brushColor').onchange = function() {
    brushColor = _('brushColor').value;
  };
  _('bgColor').onchange = function() {
    bgColor = _('bgColor').value;
    document.body.style.background = bgColor;
  };
  _('sizeRange').onchange = function() {
    const size = map(_('sizeRange').value, 2, 20, 4, 20);
    drawSize = size;
  }

  _('pencil').onchange = function() {
    penStyle = 'pencil';
    _('brush').checked = false;
    _('square').checked = false;
    _('eraser').checked = false;
    document.getElementsByTagName('canvas')[0].style.cursor = "crosshair";
  }
  _('brush').onchange = function() {
    penStyle = 'brush';
    _('square').checked = false;
    _('pencil').checked = false;
    _('eraser').checked = false;
    document.getElementsByTagName('canvas')[0].style.cursor = "crosshair";
  }
  _('square').onchange = function() {
    penStyle = 'square';
    _('brush').checked = false;
    _('pencil').checked = false;
    _('eraser').checked = false;
    document.getElementsByTagName('canvas')[0].style.cursor = "crosshair";
  }
  _('eraser').onchange = function() {
    penStyle = 'eraser';
    _('brush').checked = false;
    _('pencil').checked = false;
    _('square').checked = false;
    document.getElementsByTagName('canvas')[0].style.cursor = "cell";
  }
  _('clearCanvas').onclick = function(ev) {
    ev.preventDefault();
    if (confirm("Do you want to clear the canvas?")) {
      setup();
      document.body.style.background = '#f1ebeb';
    } else {
      return;
    }
  }
  _('saveCanvas').onclick = function(ev) {
    ev.preventDefault();
    saveCanvas(paint, 'sketch', 'png');
    setup();
    document.body.style.background = '#f1ebeb';
  }

  window.onresize = function() {
    document.getElementsByTagName('canvas')[0].style.width = innerWidth - 200;
    document.getElementsByTagName('canvas')[0].style.height = innerHeight;
  }
}

function newDrawing(data) {
  console.log(data);
  // debugger;
  const volume = input.getLevel();
  const threshold = 0.1;
  if (volume > threshold) {
    stroke(0);
    r = random(255);
    g = random(255);
    b = random(255);
    ellipse(data.width, height * data.height, 10 + volume * 200, 10 + volume * 200);
  }

  // Graph the overall potential volume, w/ a line at the threshold
  const y = map(volume, 0, 1, height, 0);
  const ythreshold = map(threshold, 0, 1, height, 0);

  noStroke();
  fill(175);
  ellipse(0, 0, 2, height);
  // Then draw a ellipse on the graph, sized according to volume
  fill(r, g, b, 127);
  ellipse(0, y, 20, y);
  stroke(0);
  line(0, ythreshold, 19, ythreshold);

console.log('brushColor', data.brushColor)
  fill(data.r, data.g, data.b);
  stroke(data.r, data.g, data.b);
  console.log('post-brushColor')
  // debugger;
  if (data.penStyle === 'brush') {
    ellipse(data.x, data.y, data.drawSize, data.drawSize);
  } else if (data.penStyle === 'pencil') {
    line(data.pmouseX, data.pmouseY, data.x, data.y);
  } else if (data.penStyle === 'square') {
    rect(data.x, data.y, data.drawSize / 2, data.drawSize / 2);
  } else if (data.penStyle === 'eraser') {
    stroke('#f1ebeb');
    fill('#f1ebeb');
    rect(data.x, data.y, data.drawSize / 1.2, data.drawSize / 1.2);
  }
}

function mouseDragged() {
  console.log(`Sending: ${mouseX} , ${mouseY}, ${drawSize}, ${brushColor}, ${penStyle}`)
  fill(brushColor);
  stroke(brushColor);

  const data = {
    brushColor: brushColor,
    penStyle: penStyle,
    pmouseX: pmouseX,
    pmousey: pmouseY,
    x: mouseX,
    y: mouseY,
    drawSize: drawSize,
  }
  socket.emit('mouse', data);

  if (penStyle === 'brush') {
    ellipse(mouseX, mouseY, drawSize, drawSize);
  } else if (penStyle === 'pencil') {
    line(pmouseX, pmouseY, mouseX, mouseY);
  } else if (penStyle === 'square') {
    rect(mouseX, mouseY, drawSize / 2, drawSize / 2);
  } else if (penStyle === 'eraser') {
    stroke('#f1ebeb');
    fill('#f1ebeb');
    rect(mouseX, mouseY, drawSize / 1.2, drawSize / 1.2);
  }

}


function draw() {
  if (!start) {
    start = millis();
  }
  // Get the overall volume (between 0 and 1.0)
  const volume = input.getLevel();
  const info = {
    input: input,
    analiyzer: analyzer,
    volume: volume,
    r:r,g:g,b:b,
    width: ticks(),
    height: Math.random()
  }
  socket.emit('mouse', info);
  // If the volume > 0.1,  a ellipse is drawn.
  // The louder the volume, the larger the ellipse.
  const threshold = 0.1;
  if (volume > threshold) {
    stroke(0);
    r = random(255);
    g = random(255);
    b = random(255);
    ellipse(ticks(), height * info.height, 10 + volume * 200, 10 + volume * 200);
  }

  // Graph the overall potential volume, w/ a line at the threshold
  const y = map(volume, 0, 1, height, 0);
  const ythreshold = map(threshold, 0, 1, height, 0);

  noStroke();
  fill(175);
  ellipse(0, 0, 2, height);
  // Then draw a ellipse on the graph, sized according to volume
  fill(r, g, b, 127);
  ellipse(0, y, 20, y);
  stroke(0);
  line(0, ythreshold, 19, ythreshold);
}
