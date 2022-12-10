export default class Rope {
  constructor(size = 1, x = 0, y = 0) {
    if (size < 1) throw new RangeError('Rope size must be at least 1');
    if (
      !Number.isInteger(size) ||
      !Number.isInteger(x) ||
      !Number.isInteger(y)
    ) {
      throw new TypeError('Arguments must be integers');
    }
    this.segments = Array.from({length: size}, () => ({x, y}));
  }

  move(direction) {
    this.#moveHead(direction);

    for (let i = 1; i < this.segments.length; i++) {
      const segment1 = this.segments[i - 1];
      const segment2 = this.segments[i];

      const dx = segment1.x - segment2.x;
      const dy = segment1.y - segment2.y;

      let h = 0;
      let k = 0;
      if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
        h = Math.sign(dx);
        k = Math.sign(dy);
      }

      segment2.x += h;
      segment2.y += k;
    }
  }

  #moveHead(direction) {
    const head = this.segments[0];

    if (direction.startsWith('down')) {
      head.y--;
    } else if (direction.startsWith('up')) {
      head.y++;
    }

    if (direction.endsWith('left')) {
      head.x--;
    } else if (direction.endsWith('right')) {
      head.x++;
    }
  }

  addNode() {
    this.segments.push({...this.segments.at(-1)});
  }

  removeNode() {
    if (this.segments.length > 1) this.segments.pop();
  }
}
