import './vec2.js'
import { Angle, Vec2 } from './vec2.js'

// TODO: could set up a GUI with sliders for parameters to generate a bunch of vines all at once 
// in a grid to find optimal vines
window.onload = () => {
  const canvas = document.getElementById('visualization')
  const ctx = canvas.getContext("2d")

  let dpr = window.devicePixelRatio || 1
  // Get the size of the canvas in CSS pixels.
  let rect = canvas.getBoundingClientRect()

  canvas.width = rect.width * dpr
  canvas.height = rect.height * dpr 

  ctx.scale(dpr, dpr)
  
  const scaling = 0.75
  const steps = 10

  let center = [0, 0]
  let radius = 10

  // wiggleLine([100, 100], Math.PI, [25, 10, 8, 5, 3, 2], ctx)
 
  // ctx.lineWidth = 1
  ctx.strokeStyle = '#139ffd'

  // to keep things moving forward, keep things between 3/2 pi and pi / 2
  // ideally between pi / 2and -pi / 2, so it wiggles naturally
  // TODO: double check the bounds for a natural vine, maybe automatically set using counterClockwise?
  // arcLine([100, 100], 0, [Math.PI / 2, Math.PI / 2, Math.PI / 2, Math.PI / 2], [40, 30, 20, 10, 8], ctx)

  // vine(ctx)

  // let vine = new Vine(ctx, new Vec2(0, 0), 100, 45, true)
  // let vine = new Vine(ctx, new Vec2(200, 200), 100, randomInt(45, 90), true)
  // let vine = new Vine(ctx, new Vec2(0, 100), randomInt(50, 100), randomInt(90, 120), true)
  ctx.lineWidth = 10
  // scales should not follow other scales

  // vine.grow(8)
  // console.log(vine.history)
  // console.log(vine.history.length)

  // for (let i = 0; i < 6; i++) {
  //   ctx.lineWidth = 10
  //   let vine = new Vine(ctx, new Vec2(100 + 100 * i, randomInt(-50, 0)), randomInt(50, 120), randomInt(90, 120), true)
  //   vine.grow(6)
  // }
  for (let i = 0; i < 2; i++) {
    let vine = new Vine(ctx, new Vec2(100 + 250 * i, randomInt(-50, 0)), randomInt(40, 60), randomInt(90, 120), true)
    vine.grow(6)
  }

  for (let i = 0; i < 2; i++) {
    let vine = new Vine(ctx, new Vec2(1000 - 250 * i, randomInt(-50, 0)), randomInt(40, 60), randomInt(130, 180), true)
    vine.grow(6)
  }

  // ctx.lineWidth = 10
  let vine = new Vine(ctx, new Vec2(0, 200 + randomInt(-20, 20)), randomInt(50, 90), 90, true)
  vine.flip()
  vine.arc(randomInt(20, 60))
  vine.grow(8)

  vine = new Vine(ctx, new Vec2(1000, 200 + randomInt(-20, 20)), randomInt(50, 90), 180, true)
  vine.flip()
  vine.arc(randomInt(20, 60))
  vine.grow(8)
    // let vine = new Vine(ctx, new Vec2(400, 400), 100, 180, false)
    // vine.grow(1)
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
    this.ctx.beginPath()
    this.flip()
    this.arc(randomInt(30, 90))
    this.flip()
    this.arc(randomInt(30, 90))
  }

  // TODO: figure out how to bias the direction, so that it can grow back into the viewport
  // TODO: should it arc based on distance rather than angle? should it limit based on length?
  randomOp(remainingSteps, totalSteps) {
    // TODO: relate the angles to the radius
    let randomAngle = () => randomInt(60, 120)
    
    if (this.current.distance(this.center) < 40) {
      this.spiralScale = this.spiralScale || randomFloat(0.7, 0.9)
      this.spiralStep = this.spiralStep || randomInt(30, 100)
    //   console.log("SPIRALING")
    //   this.scale(randomFloat(0.8, 0.9), randomInt(2, 4))
    //   this.arc(randomInt(60, 80))
      // this.scale(randomFloat(0.8, 0.9), randomInt(2, 4))
      this.scale(this.spiralScale)
      this.arc(this.spiralStep)
      // for (let i = 0; i < randomInt(2, 6); i++) {
      //   this.arc(randomInt(20, 40))
      // }
      // // this.arc(randomInt(30, 60))
      // this.arc(randomInt(30, 60))
      // this.arc(randomInt(30, 60))
    }
    else {
      if (flipCoin(0.5)) {
        this.flip()
      }
      // to smooth out gradual thinning
      // TODO: thin based on distance traveled?
      for (let i = 0; i < randomInt(3, 8); i++) {
        this.arc(20)
      }
      // this.arc(randomAngle())
      // this.flip()
      // if (flipCoin(remainingSteps / (totalSteps * 3))) {
      if (flipCoin(0.5)) {
        this.flip()
      }
      for (let i = 0; i < randomInt(3, 8); i++) {
        this.arc(20)
      }
      // this.arc(randomAngle())

      if (this.current.distance(this.center) < 60) {
        this.scale(0.6)
      }
      else {
        this.scale(1, 30)
      }
    }
    
    return this
  }

  grow(steps) {
    for (let i = 0; i < steps; i++) {
      this.randomOp(steps - i, steps)
    }

    return this
  }

  get radius() {
    return this.center.distance(this.current)
  }

  get lastCommand() {
    return this.history[this.history.length - 1][0]
  }

  arc(angle) {
    if (this.ctx.lineWidth > 3) {
      this.ctx.lineWidth -= 0.25
    }
    // this.ctx.lineWidth -= 0.5
    // this.cumulativeArc += angle
    this.history.push(['arc', angle])
    angle = Angle.degreesToRadians(angle)
    this.ctx.beginPath()
    this.current = turnRadius(this.ctx, this.current, this.center, angle, this.counterClockwise)
    this.ctx.beginPath()
    return this
  }

  scale(factor, constant=0) {
    if (this.ctx.lineWidth > 3) {
      this.ctx.lineWidth -= 0.25
    }
    // this.defaultScale -= 0.01
    this.history.push(['scale', factor])
    // this.ctx.lineWidth *= factor
    this.center = scaleRadius(this.current, this.center, factor, constant)
    return this
  }

  flip() {
    this.ctx.lineWidth -= 0.5
    this.history.push(['flip'])
    // if (flipCoin(0.8)) {
      drawLeaf(this.ctx, this.current, this.center, !this.counterClockwise)
    // }
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

function drawLeaf(ctx, start, end, clockwise) {
  let originalWidth = ctx.lineWidth
  let startToEnd = end.sub(start).unit
  
  console.log("HERE")
  console.log(start, end, startToEnd, end.sub(start).unit, end.distance(start))

  // todo: should be based on rotation of the vine
  // let directionControl1 = end.sub(start).unit
  let angle = end.angleAbout(start)
  console.log("ANGLE")
  console.log(Angle.radiansToDegrees(angle))

  // let control1 = start.add(directionControl1.mult(50))
  ctx.lineWidth = 1
  let control1 = end.sub(start).unit.mult(end.distance(start) * 0.9).rotate(Angle.degreesToRadians(50)).add(start)
  let control2 = start.add(startToEnd.mult(end.distance(start) * 0.75))
  console.log(control1, control2)
  // drawPoint(control1.x, control1.y, ctx, 'red')
  // drawPoint(control2.x, control2.y, ctx, 'green')
  
  // top of leaf
  ctx.moveTo(start.x, start.y)
  ctx.bezierCurveTo(control1.x, control1.y, control2.x, control2.y, end.x, end.y)
  ctx.fillStyle = '#139ffd'

  ctx.moveTo(start.x, start.y)
  control1 = end.sub(start).unit.mult(end.distance(start) * 0.5).rotate(-Angle.degreesToRadians(45)).add(start)
  ctx.bezierCurveTo(control1.x, control1.y, control1.x, control1.y, end.x, end.y)
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
