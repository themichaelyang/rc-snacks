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

  vine(ctx)
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

function vine(ctx) {
  let start = new Vec2(100, 100) 
  let counterClockwise = false 
  let center = startArc(start, Angle.degreesToRadians(0), 30, counterClockwise)
  let current = turnRadius(ctx, start, center, Angle.degreesToRadians(90), counterClockwise)
  drawPoint(center.x, center.y, ctx)
  puts(start, center)
  ;[center, counterClockwise] = changeDirection(current, center)
  drawPoint(center.x, center.y, ctx)
  puts(center)
  current = turnRadius(ctx, current, center, Angle.degreesToRadians(90), counterClockwise)
  center = scaleRadius(current, center, 0.9)
  current = turnRadius(ctx, current, center, Angle.degreesToRadians(90), counterClockwise)
  center = scaleRadius(current, center, 0.9)
  current = turnRadius(ctx, current, center, Angle.degreesToRadians(90), counterClockwise)
  center = scaleRadius(current, center, 0.9)
  current = turnRadius(ctx, current, center, Angle.degreesToRadians(90), counterClockwise)
  center = scaleRadius(current, center, 0.9)
  current = turnRadius(ctx, current, center, Angle.degreesToRadians(90), counterClockwise)
  center = scaleRadius(current, center, 0.9)
  current = turnRadius(ctx, current, center, Angle.degreesToRadians(90), counterClockwise)
  center = scaleRadius(current, center, 0.9)
  current = turnRadius(ctx, current, center, Angle.degreesToRadians(90), counterClockwise)

  // turnRadius(start, )
}

// returns center
function startArc(start, angleToCenter, radius, counterClockwise) {
  return start.add(new Vec2(0, radius)).rotateAbout(start, angleToCenter, !counterClockwise)
}

// returns new ending point
function turnRadius(ctx, start, center, angle, counterClockwise) {
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