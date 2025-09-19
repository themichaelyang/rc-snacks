import './vec2.js'
import { Angle, Vec2 } from './vec2.js'

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
 
  ctx.lineWidth = 1

  // to keep things moving forward, keep things between 3/2 pi and pi / 2
  // ideally between pi / 2and -pi / 2, so it wiggles naturally
  // TODO: double check the bounds for a natural vine, maybe automatically set using counterClockwise?
  // arcLine([100, 100], 0, [Math.PI / 2, Math.PI / 2, Math.PI / 2, Math.PI / 2], [40, 30, 20, 10, 8], ctx)

  // vine(ctx)

  let vine = new Vine(ctx, new Vec2(200, 200), 60, 15, true)
  ctx.lineWidth = 10
  // scales should not follow other scales
  // vine.arc(45)
  //   .flip()
  //   .arc(45)
  //   .arc(45)
  //   .flip()
  //   .scale(0.9)
  //   .arc(45)
  //   .arc(45)
  //   .scale(0.9)
  //   .arc(45)
  //   .scale(0.9)
  //   .flip()
  //   .arc(45)
  //   .scale(0.9)
  //   .flip()
  //   .arc(45)
  //   .scale(0.9)
  //   .arc(45)
  //   .scale(0.9)
  //   .arc(45)
  //   .scale(0.9)
  //   .arc(45)
  //   .scale(0.9)
  //   .arc(45)
  //   .scale(0.9)
  //   .arc(45)
  //   .scale(0.9)
  //   .arc(45)
  //   .scale(0.9)
  //   .arc(45)
  //   .scale(0.9)
  //   .arc(45)

    
  let iterationLength = 30
  vine.grow(iterationLength)
  console.log(vine.history)
  console.log(vine.history.length)
}

// TODO: idea for transition probabilities? for now can just interleave scales, just don't want a flip to follow another flip

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
  constructor(ctx, start, startRadius, startAngle, counterClockwise, defaultArc=45, defaultScale=0.8) {
    // start is point on first arc
    // current is then in direction of the start angle from start
    // we need to calculate the center based on those? and pick the center that matches the rotation direction
    startAngle = Angle.degreesToRadians(startAngle)
    this.ctx = ctx
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
  }

  randomOp() {
    let rand = Math.random()
    this.defaultScale -= 0.01

    if (this.cumulativeArc > 270) {
      this.probabilities[0] = 0
      // this.defaultScale = 0.25
    }
  
    if (rand < offsetSum(this.probabilities, 0)) {
      this.cumulativeArc = 0
      this.flip()
      this.arc(randomInt(60, 90))
      this.flip()

      if (this.probabilities[0] > 0) {
        this.probabilities[0] -= 0.1
        this.probabilities[1] += 0.05
      }

      if (this.probabilities[0] < 0) {
        this.probabilities[0] = 0
      }
    }
    else if (rand < offsetSum(this.probabilities, 1)) {
      // this.scale(randomFloat(0.8, 1))
      this.arc(randomInt(60, 80))
      this.scale(this.defaultScale)
    } else {
      // this.arc(this.defaultArc)
      this.arc(randomInt(50, 70))
    }

    return this
  }

  grow(iterationLength) {
    for (let i = 0; i < iterationLength; i++) {
      // this.defaultScale = i / iterationLength
      console.log(this.defaultScale)
      this.randomOp()
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
    this.cumulativeArc += angle
    this.history.push(['arc', angle])
    angle = Angle.degreesToRadians(angle)
    this.current = turnRadius(this.ctx, this.current, this.center, angle, this.counterClockwise)
    return this
  }

  scale(factor) {
    this.history.push(['scale', factor])
    this.ctx.lineWidth *= factor
    // this.ctx.lineWidth = 5 - Math.pow(Math.E, -1 * this.history.length)

    // console.log("HI")
    // console.log(1 - Math.pow(Math.E, -1 * this.history.length))
    this.center = scaleRadius(this.current, this.center, factor)
    return this
  }

  flip() {
    this.history.push(['flip'])
    ;[this.center, this.counterClockwise] = changeDirection(this.current, this.center, this.counterClockwise)
    return this
  }
}

function offsetSum(arr, lastIndex) {
  return arr.slice(0, lastIndex + 1).reduce((accumulator, currentValue) => accumulator + currentValue, 0)
}

// returns center
function startArc(start, angleToCenter, radius, counterClockwise) {
  return start.add(new Vec2(0, radius)).rotateAbout(start, angleToCenter, !counterClockwise)
}

// returns new ending point
function turnRadius(ctx, start, center, angle, counterClockwise) {
  drawPoint(center.x, center.y, ctx)
  const end = start.rotateAbout(center, angle, !counterClockwise)
  ctx.arc(center.x, center.y, start.distance(center), start.angleAbout(center), end.angleAbout(center), counterClockwise)
  ctx.stroke()

  return end
}

// returns new center -- should we instead deal with normal vectors and radiuses?
function scaleRadius(current, center, scale) {
  const radius = center.distance(current)
  const normal = center.sub(current).unit

  return normal.mult(radius * scale).add(current)
}

// returns new center
function changeDirection(current, center, counterClockwise) {
  const normal = center.sub(current)

  return [normal.mult(-1).add(current), !counterClockwise]
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

function drawPoint(x, y, ctx) {
  ctx.beginPath()
  ctx.moveTo(x, y)
  ctx.fillStyle = 'red'
  ctx.arc(x, y, 2, 0, 2 * Math.PI)
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