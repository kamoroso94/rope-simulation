import Rope from './rope.js';

function resizeCanvas(context) {
  context.canvas.width = window.innerWidth;
  context.canvas.height = window.innerHeight;
}

function handleKeyDown(event, state) {
  state.pointer.id = undefined;
  state.tracking = false;

  switch (event.key) {
    case 'ArrowDown':
    case 's':
      state.rope.move('down');
      break;

    case 'ArrowLeft':
    case 'a':
      state.rope.move('left');
      break;

    case 'ArrowRight':
    case 'd':
      state.rope.move('right');
      break;

    case 'ArrowUp':
    case 'w':
      state.rope.move('up');
      break;
  }
}

function handlePointerDown(event, state) {
  if (state.pointer.id !== undefined) return;

  state.tracking = true;
  state.pointer.id = event.pointerId;
  const gridPointer = canvasToGridPoint(state.pointer, state.context.canvas);
  const gridEvent = canvasToGridPoint(event, state.context.canvas);
  if (gridPointer.x !== gridEvent.x || gridPointer.y !== gridEvent.y) {
    state.pointer.x = event.x;
    state.pointer.y = event.y;
    state.ropeHeadOffset = {h: 0, k: 0};
  }
}

function handlePointerMove(event, state) {
  state.pointer.id ??= event.pointerId;
  if (event.pointerId !== state.pointer.id) return;

  state.tracking = true;
  const gridPointer = canvasToGridPoint(state.pointer, state.context.canvas);
  const gridEvent = canvasToGridPoint(event, state.context.canvas);
  if (gridPointer.x !== gridEvent.x || gridPointer.y !== gridEvent.y) {
    state.pointer.x = event.x;
    state.pointer.y = event.y;
    state.ropeHeadOffset = {h: 0, k: 0};
  }
}

function handlePointerUp(event, state) {
  if (event.pointerId !== state.pointer.id) return;

  state.tracking = true;
  state.pointer.id = undefined;
  const gridPointer = canvasToGridPoint(state.pointer, state.context.canvas);
  const gridEvent = canvasToGridPoint(event, state.context.canvas);
  if (gridPointer.x !== gridEvent.x || gridPointer.y !== gridEvent.y) {
    state.pointer.x = event.x;
    state.pointer.y = event.y;
    state.ropeHeadOffset = {h: 0, k: 0};
  }
}

function getCssValue(element, property) {
  return getComputedStyle(element).getPropertyValue(property);
}

const SEGMENT_SIZE = 16;
function gridToCanvasPoint({x, y}, {width, height}) {
  return {
    x: x * SEGMENT_SIZE + Math.floor(width / 2) - SEGMENT_SIZE / 2,
    y: -y * SEGMENT_SIZE + Math.floor(height / 2) - SEGMENT_SIZE / 2,
  };
}

function canvasToGridPoint({x, y}, {width, height}) {
  return {
    x: Math.floor(
      (x + SEGMENT_SIZE / 2 - Math.floor(width / 2)) / SEGMENT_SIZE
    ),
    y: -Math.floor(
      (y + SEGMENT_SIZE / 2 - Math.floor(height / 2)) / SEGMENT_SIZE
    ),
  };
}

async function drawFrame({context, rope}) {
  context.fillStyle = getCssValue(context.canvas, '--background');
  const {width, height} = context.canvas;
  context.fillRect(0, 0, width, height);

  const segmentSize = 16;
  context.fillStyle = getCssValue(context.canvas, '--foreground');
  for (const gridPoint of rope.segments) {
    const {x, y} = gridToCanvasPoint(gridPoint, context.canvas);
    context.fillRect(x, y, segmentSize, segmentSize);
  }
}

// TODO: try to carry around error to make mouse tracking more accurate
function getNextOffset(start, end, offset) {
  if (start.x === end.x && start.y === end.y) {
    return {h: 0, k: 0};
  }

  const x1 = start.x + offset.h;
  const y1 = start.y + offset.k;

  const dx = end.x - x1;
  const dy = end.y - y1;
  if (dx === 0) {
    return {h: 0, k: Math.sign(dy)};
  } else {
    const m = dy / dx;
    const b = y1 - m * x1;
    if (Math.abs(dy) <= Math.abs(dx)) {
      const h = Math.sign(dx);
      return {
        h,
        k: Math.sign(Math.round(m * (x1 + h) + b) - y1),
      };
    } else {
      const k = Math.sign(dy);
      return {
        h: Math.sign(Math.round((y1 + k - b) / m) - x1),
        k,
      };
    }
  }
}

function init() {
  const state = {
    context: document.querySelector('canvas').getContext('2d'),
    pointer: {
      id: undefined,
      x: 0,
      y: 0,
    },
    rope: new Rope(25),
    ropeHeadOffset: undefined,
    tracking: false,
  };
  state.context.canvas.focus();

  resizeCanvas(state.context);

  // TODO: add controls for growing and shrinking the rope.
  window.addEventListener('resize', () => resizeCanvas(state.context));
  window.addEventListener('keydown', (event) => {
    handleKeyDown(event, state);
  });
  window.addEventListener(
    'pointerdown',
    (event) => handlePointerDown(event, state),
    {passive: true}
  );
  window.addEventListener(
    'pointermove',
    (event) => handlePointerMove(event, state),
    {passive: true}
  );
  window.addEventListener(
    'pointerup',
    (event) => handlePointerUp(event, state),
    {passive: true}
  );

  const rafCallback = () => {
    drawFrame(state);
    requestAnimationFrame(rafCallback);
  };
  requestAnimationFrame(rafCallback);

  setInterval(() => {
    if (!state.tracking) return;

    const [head] = state.rope.segments;
    const gridPointer = canvasToGridPoint(state.pointer, state.context.canvas);
    const {h, k} = getNextOffset(head, gridPointer, state.ropeHeadOffset);

    const direction = `${k < 0 ? 'down' : k > 0 ? 'up' : ''}${
      h < 0 ? 'left' : h > 0 ? 'right' : ''
    }`;
    if (!direction) return;

    state.rope.move(direction);
  }, 100);
}

init();
