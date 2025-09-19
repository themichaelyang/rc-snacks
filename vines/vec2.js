export class Vec2 {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  add(other) {
    other = this.broadcast(other);
    return new Vec2(this.x + other.x, this.y + other.y);
  }
  sub(other) {
    other = this.broadcast(other);
    return new Vec2(this.x - other.x, this.y - other.y);
  }
  mult(other) {
    other = this.broadcast(other);
    return new Vec2(this.x * other.x, this.y * other.y);
  }
  div(other) {
    other = this.broadcast(other);
    return new Vec2(this.x / other.x, this.y / other.y);
  }
  dot(other) {
    return this.x * other.x + this.y * other.y;
  }
  distance(other) {
    return this.sub(other).magnitude;
  }
  rotate(angle, clockwise = true) {
    if (!clockwise) {
      angle = Angle.TAU - angle;
    }
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return new Vec2(
      this.x * cos - this.y * sin,
      this.x * sin + this.y * cos
    );
  }
  // angle in radians
  rotateAbout(origin, angle, clockwise = true) {
    return this.sub(origin).rotate(angle, clockwise).add(origin);
  }
  angleAbout(origin) {
    return this.sub(origin).angle;
  }
  towards(angle, length) {
    return this.add(Angle.direction(angle).mult(length));
  }
  get angle() {
    return this.polar.angle;
  }
  get neg() {
    return new Vec2(-this.x, -this.y);
  }
  get abs() {
    return new Vec2(Math.abs(this.x), Math.abs(this.y));
  }
  get dup() {
    return new Vec2(this.x, this.y);
  }
  get length() {
    return this.magnitude;
  }
  get magnitude() {
    return Math.hypot(this.x, this.y);
  }
  // rotate 90 degrees clockwise
  get right() {
    return new Vec2(this.y, -this.x);
  }
  get unit() {
    return this.div(this.magnitude);
  }
  get polar() {
    return new Polar2(this.length, Math.atan2(this.y, this.x));
  }
  get toArray() {
    return [this.x, this.y];
  }
  static fromArray(arr) {
    return new Vec2(arr[0], arr[1]);
  }
  broadcast(other, requireVec = false) {
    if (typeof other == "number") {
      if (requireVec) {
        throw TypeError("Must be a Vec2!");
      } else {
        return new Vec2(other, other);
      }
    } else {
      return other;
    }
  }
  toString() {
    return `(${this.x.toFixed(4)}, ${this.y.toFixed(4)})`;
  }
}
export function vec(...params) {
  if (params.length == 2) {
    return new Vec2(params[0], params[1]);
  } else {
    throw new Error(`Invalid number of parameters! Received: ${params.length} parameters`);
  }
}
export class Polar2 {
  // angle in radians
  constructor(r, angle) {
    this.r = r;
    this.angle = angle;
  }
  rotate(rotation) {
    return new Polar2(this.r, this.angle + rotation);
  }
  get vec() {
    return new Vec2(this.r * Math.cos(this.angle), this.r * Math.sin(this.angle));
  }
}
export class Angle {
  static get TAU() {
    return 2 * Math.PI;
  }
  static radiansToTurns(radians) {
    return radians / Angle.TAU;
  }
  static turnsToRadians(turns) {
    return turns * Angle.TAU;
  }
  static radiansToDegrees(radians) {
    return Angle.radiansToTurns(radians) * 360;
  }
  static degreesToRadians(degrees) {
    return Angle.turnsToRadians(degrees / 360);
  }
  static direction(angle) {
    return new Vec2(Math.cos(angle), Math.sin(angle));
  }
}
