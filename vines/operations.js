import './vec2.js'
import { Angle, Vec2 } from './vec2.js'

window.onload = () => {
  arcExample('arc')
  flipExample('flip')
  scaleExample('scale')
}

function setupCanvas(canvasId) {
  const canvas = document.getElementById(canvasId)
  const ctx = canvas.getContext("2d")

  let dpr = window.devicePixelRatio || 1
  // Get the size of the canvas in CSS pixels.
  let rect = canvas.getBoundingClientRect()

  canvas.width = rect.width * dpr
  canvas.height = rect.height * dpr 

  ctx.scale(dpr, dpr)

  return ctx
}

function arcExample(canvasId) {
  let ctx = setupCanvas(canvasId)
  ctx.lineWidth = 10
  ctx.strokeStyle = '#139ffd'
  let radius = 100
  let center = new Vec2(500, 300)
  let start = center.add(new Vec2(0, radius))
  ctx.beginPath()
  let end = turnRadius(ctx, start, center, Angle.degreesToRadians(90), true)
  ctx.setLineDash([4, 4]);
  ctx.beginPath()
  turnRadius(ctx, start, center, Angle.degreesToRadians(359), true)
  drawDot(ctx, center, 'blue')
  drawDot(ctx, start, 'green')
  drawDot(ctx, end, 'red')
}

function flipExample(canvasId) {
  let ctx = setupCanvas(canvasId)
  ctx.lineWidth = 10
  ctx.strokeStyle = '#139ffd'
  let counterClockwise = true
  let radius = 100
  let center = new Vec2(400, 300)
  let start = center.add(new Vec2(0, radius))
  ctx.beginPath()
  let end = turnRadius(ctx, start, center, Angle.degreesToRadians(90), counterClockwise)

  // draw dotted circle 
  ctx.setLineDash([4, 4]);
  ctx.beginPath()
  turnRadius(ctx, start, center, Angle.degreesToRadians(359), counterClockwise)
  ctx.setLineDash([])

  drawDot(ctx, center, 'blue')
  drawDot(ctx, start, 'green')
  let intermediate = end

  ;[center, counterClockwise] = changeDirection(end, center, counterClockwise)
  end = turnRadius(ctx, end, center, Angle.degreesToRadians(90), counterClockwise)
  ctx.setLineDash([4, 4])
  ctx.beginPath()
  turnRadius(ctx, end, center, Angle.degreesToRadians(359), counterClockwise)
  ctx.setLineDash([])

  drawDot(ctx, center, 'blue')
  drawDot(ctx, start, 'green')
  drawDot(ctx, end, 'red')
  drawDot(ctx, intermediate, 'orange')
}

function scaleExample(canvasId) {
  let ctx = setupCanvas(canvasId)
  ctx.lineWidth = 10
  ctx.strokeStyle = '#139ffd'
  let radius = 100
  let center = new Vec2(500, 300)
  let start = center.add(new Vec2(0, radius))
  ctx.beginPath()
  let end = turnRadius(ctx, start, center, Angle.degreesToRadians(90), true)
  ctx.setLineDash([4, 4])
  ctx.moveTo(start.x, start.y)
  turnRadius(ctx, start, center, Angle.degreesToRadians(359), true)
  ctx.setLineDash([])

  let centerOriginal = center

  ctx.beginPath()
  center = scaleRadius(end, center, 0.5, 0)
  end = turnRadius(ctx, end, center, Angle.degreesToRadians(90), true)

  ctx.beginPath()
  ctx.setLineDash([4, 4])
  end = turnRadius(ctx, end, center, Angle.degreesToRadians(359), true)

  drawDot(ctx, center, 'purple')
  drawDot(ctx, start, 'green')
  drawDot(ctx, end, 'red')
  drawDot(ctx, centerOriginal, 'blue')
}

// I notice in the poptropica vine, it can preserve the direction while shrinking, so it has a more spiral like quality
// this current version always flips direction by reflecting the center point
//
// new idea:
// rule 1: draw arc for angle
// rule 2: shrink arc (reduce radius along center vector)
// rule 3: change direction (reflect center across tangent)

function puts(...args) {
  console.log(...args)
}

// all angles are expressed in degrees
// TODO: click to add points to vine?
class Vine {
  constructor(ctx, start, startRadius, startAngle, counterClockwise, startLineWidth=10, defaultArc=45, defaultScale=0.7) {
    // start is point on first arc
    // current is then in direction of the start angle from start
    // we need to calculate the center based on those? and pick the center that matches the rotation direction
    startAngle = Angle.degreesToRadians(startAngle)
    this.ctx = ctx
    this.ctx.lineWidth = startLineWidth
    this.startLineWidth = startLineWidth
    this.current = start
    this.start = start

    let toCenterClockwise = Angle.direction(startAngle).right
    let toCenterCounterClockwise = toCenterClockwise.right.right

    if (counterClockwise) {
      this.center = start.add(toCenterCounterClockwise.mult(startRadius))
    } else {
      this.center = start.add(toCenterClockwise.mult(startRadius))
    }

    this.history = [['new', start, startRadius, startAngle, counterClockwise]]

    this.defaultArc = defaultArc
    this.defaultScale = defaultScale
    // 'flip', 'scale', 'arc'
    this.probabilities = [0.6, 0.33]

    this.cumulativeArc = 0
    this.distance = 0
    this.ctx.beginPath()
    this.flip()
    this.arc(randomInt(30, 90))
    this.flip()
    this.arc(randomInt(30, 90))
  }

  get radius() {
    return this.center.distance(this.current)
  }

  get lastCommand() {
    return this.history[this.history.length - 1][0]
  }

  arc(angle) {
    // draw underlying circle
    this.ctx.beginPath()
    this.ctx.strokeStyle = 'grey'
    this.ctx.arc(this.center.x, this.center.y, this.start.distance(this.center), Angle.degreesToRadians(360), counterClockwise)
    this.ctx.stroke()
    this.current = turnRadius(this.ctx, this.current, this.center, radians, this.counterClockwise)
    this.ctx.beginPath()

    return this
  }

  scale(factor, constant=0) {
    this.center = scaleRadius(this.current, this.center, factor, constant)
    return this
  }

  flip() {
    ;[this.center, this.counterClockwise] = changeDirection(this.current, this.center, this.counterClockwise)
    return this
  }
}

function offsetSum(arr, lastIndex) {
  return arr.slice(0, lastIndex + 1).reduce((accumulator, currentValue) => accumulator + currentValue, 0)
}

function sum(arr) {
  return offsetSum(arr, arr.length - 1)
}

// returns center
function startArc(start, angleToCenter, radius, counterClockwise) {
  return start.add(new Vec2(0, radius)).rotateAbout(start, angleToCenter, !counterClockwise)
}

// returns new ending point
function turnRadius(ctx, start, center, angle, counterClockwise) {
  // drawPoint(center.x, center.y, ctx)
  const end = start.rotateAbout(center, angle, !counterClockwise)
  ctx.arc(center.x, center.y, start.distance(center), start.angleAbout(center), end.angleAbout(center), counterClockwise)
  ctx.stroke()

  return end
}

// returns new center -- should we instead deal with normal vectors and radiuses?
function scaleRadius(current, center, scale, constant) {
  const radius = clamp(center.distance(current) - constant, 0)
  // console.log(radius)
  const normal = center.sub(current).unit

  return normal.mult(radius * scale).add(current)
}

// returns new center
function changeDirection(current, center, counterClockwise) {
  const normal = center.sub(current)

  return [normal.mult(-1).add(current), !counterClockwise]
}

function angleTowards(center, current, direction) {

}

function arcLine(start, startAngle, angles, radii, ctx) {
  let counterClockwise = true
  let angle = startAngle
  let edgeStart = start
  let center = moveInDirection(edgeStart, radii[0], angle)

  for (let i = 0; i < radii.length; i++) {
    // so we can always pass small angles
    if (counterClockwise) {
      angle += angles[i]
    } else {
      angle += 2 * Math.PI - angles[i]
    }
   
    drawPoint(center[0], center[1], ctx)
    drawPoint(edgeStart[0], edgeStart[1], ctx)
    
    let edgeEnd = moveInDirection(center, radii[i], angle)
    drawPoint(edgeEnd[0], edgeEnd[1], ctx)    

    let angleStart = cartesianToPolar(edgeStart, center)[1]
    let angleEnd = cartesianToPolar(edgeEnd, center)[1]

    ctx.arc(center[0], center[1], radii[i], angleStart, angleEnd, counterClockwise)    
    ctx.stroke()
    
    counterClockwise = !counterClockwise
    edgeStart = edgeEnd
    center = moveInDirection(edgeEnd, radii[i + 1], angle)
  }
}

// start = starting center point
function wiggleLine(start, angle, radii, ctx) {
  let [x, y] = start
  for (let i = 0; i < radii.length; i++) {
    ctx.beginPath()
    ctx.arc(x, y, radii[i], angle, angle + Math.PI, i % 2)
    x += (radii[i] + radii[i + 1]) * Math.cos(angle)
    y += (radii[i] + radii[i + 1]) * Math.sin(angle)
    ctx.stroke()
  }
}

function circleLine(start, angle, radii, ctx) {
  let [x, y] = start
  for (let i = 0; i < radii.length; i++) {
    ctx.moveTo(x + radii[i], y)
    ctx.arc(x, y, radii[i], 0, 2 * Math.PI)
    x += (radii[i] + radii[i + 1]) * Math.cos(angle)
    y += (radii[i] + radii[i + 1]) * Math.sin(angle)
  }
  ctx.stroke()
}

function polarToCartesian(r, angle, origin=[0, 0]) {
  return [r * Math.cos(angle) + origin[0], r * Math.sin(angle) + origin[1]]
}

function cartesianToPolar(coord, origin=[0, 0]) {
  let x = coord[0] - origin[0]
  let y = coord[1] - origin[1]
  
  // atan can only handle top right quadrant, so need to adjust with atan2
  return [Math.sqrt(x*x + y*y), Math.atan2(y, x)]
}

function moveInDirection(start, length, angle) {
  return [start[0] + length * Math.cos(angle), start[1] + length * Math.sin(angle)]
}

function rotate(coord, angle) {
  let polar = cartesianToPolar(coord)
  polar[1] += angle
  return polarToCartesian(polar[0], polar[1])
}

function distance(p1, p2) {
  return Math.sqrt((p1[0] * p2[0]) + (p1[1] + p2[1]))
}

// normalized: between 0 and 1
function remap(normalized, max, min) {
  return (normalized * (max - min)) * max
}

function drawPoint(x, y, ctx, color='red') {
  ctx.beginPath()
  ctx.moveTo(x, y)
  ctx.fillStyle = color
  ctx.arc(x, y, 10, 0, 2 * Math.PI)
  ctx.fill()
  ctx.beginPath()
}

// inclusive of max
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomFloat(min, max) {
  return (Math.random() * (max - min)) + min
}

function sample(array) {
  return array[random(0, array.length - 1)]
}

function weightedSample(array, weights) {
  if (array.length != weights.length) {
    throw new Error(`Array and distribution should be same length: array.length:` +
                    `${array.length} != weights.length: ${weights.length}`)
  }

  let total = sum(weights)
  let rand = randomFloat(0, total)
  let cumulative = 0
  for (let i = 0; i < weights.length; i++) {
    cumulative += weights[i]
    if (rand < cumulative) {
      return array[i]
    }
  }

  throw new Error(`Random is greater than total! Do you have a negative weight? rand: ${rand}`)
}

// inclusive of max
function clamp(value, min, max=Infinity) {
  if (value <= min) {
    return min
  } else if (value >= max) {
    return max
  } else {
    return value
  }
}

function flipCoin(trueProb) {
  return weightedSample([true, false], [trueProb, 1 - trueProb])
}

function drawLeaf(ctx, start, end, clockwise, progress=1) {
  let originalWidth = ctx.lineWidth
  let direction = end.sub(start)
  let startToEnd = direction.unit
  const clampedProgress = clamp(progress, 0, 1)
  const endScaled = start.add(direction.mult(clampedProgress))

  // todo: should be based on rotation of the vine
  // let directionControl1 = end.sub(start).unit
  let angle = endScaled.angleAbout(start)

  let sign = 1

  if (clockwise) {
    sign = -1
  }

  // let control1 = start.add(directionControl1.mult(50))
  ctx.lineWidth = 1
  let control1 = endScaled.sub(start).unit.mult(endScaled.distance(start) * 0.9).rotate(sign * Angle.degreesToRadians(50)).add(start)
  let control2 = start.add(startToEnd.mult(endScaled.distance(start) * 0.75))
  // drawPoint(control1.x, control1.y, ctx, 'red')
  // drawPoint(control2.x, control2.y, ctx, 'green')
  
  // top of leaf
  ctx.moveTo(start.x, start.y)
  ctx.bezierCurveTo(control1.x, control1.y, control2.x, control2.y, endScaled.x, endScaled.y)
  ctx.fillStyle = '#139ffd'

  ctx.moveTo(start.x, start.y)
  control1 = endScaled.sub(start).unit.mult(endScaled.distance(start) * 0.5).rotate(-sign * Angle.degreesToRadians(45)).add(start)
  ctx.bezierCurveTo(control1.x, control1.y, control1.x, control1.y, endScaled.x, endScaled.y)
  ctx.fill()
  ctx.stroke()

  // bottom of leaf
  // ctx.moveTo(start.x, start.y)
  // control1 = new Vec2(end.x, end.y).rotateAbout(start, angle + Angle.degreesToRadians(45))
  // control1 = new Vec2(start.x + 50, start.y)
  // drawPoint(control1.x, control1.y, ctx, 'magenta')
  // ctx.beginPath()
  // ctx.moveTo(start.x, start.y)
  // ctx.bezierCurveTo(control1.x, control1.y, control2.x, control2.y, end.x, end.y)
  // ctx.fillStyle = 'red'
  // ctx.fill()
  // ctx.stroke()
  ctx.lineWidth = originalWidth
}

// // Define the points as {x, y} 
// let start = { x: 50, y: 20 }; 
// let cp1 = { x: 230, y: 30 }; 
// let cp2 = { x: 150, y: 80 }; 
// let end = { x: 250, y: 100 };

function drawDot(ctx, coord, color, size=4) {
  ctx.beginPath()
  ctx.moveTo(coord.x, coord.y)
  ctx.fillStyle = color
  ctx.arc(coord.x, coord.y, size, 0, 2 * Math.PI)
  ctx.fill()
  ctx.beginPath() 
}