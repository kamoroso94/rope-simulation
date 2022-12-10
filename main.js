const context = document.querySelector('canvas').getContext('2d');
context.canvas.focus();

function resizeCanvas() {
  context.canvas.width = window.innerWidth;
  context.canvas.width = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

window.addEventListener('keydown', (event) => {
  switch (event.key) {
    case 'ArrowDown':
    case 's':
    break;
    case 'ArrowLeft':
    case 'a':
    break;
    case 'ArrowRight':
    case 'd':
    break;
    case 'ArrowUp':
    case 'w':
    break;
  }
});
