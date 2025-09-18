'use strict'

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
  vine([100, 100], [Math.PI / 4, Math.PI / 4, Math.PI / 4], [40, 30, 20], ctx)
}

function vine(start, angles, radii, ctx) {
  let counterClockwise = true
  let center = start
  let angle = angles[0]
  let edgeStart = moveInDirection(center, radii[0], angle - Math.PI)
  let edgeEnd = moveInDirection(center, radii[0], angle)

  let angleStart = cartesianToPolar(edgeStart, center)[1]
  let angleEnd = cartesianToPolar(edgeEnd, center)[1]

  ctx.arc(center[0], center[1], radii[0], angleStart, angleEnd, counterClockwise)    
  ctx.stroke()
  
  counterClockwise = !counterClockwise
  edgeStart = edgeEnd

  for (let i = 1; i < radii.length; i++) {
    center = moveInDirection(edgeStart, radii[i], angle)
    drawPoint(center[0], center[1], ctx)
    drawPoint(edgeStart[0], edgeStart[1], ctx)    
    
    let turn = angles[i]
    angle += turn

    edgeEnd = moveInDirection(center, radii[i], angle)

    ctx.moveTo(edgeStart[0], edgeStart[1])
    angleStart = cartesianToPolar(edgeStart, center)[1]
    angleEnd = cartesianToPolar(edgeEnd, center)[1]

    ctx.arc(center[0], center[1], radii[i], angleStart, angleEnd, counterClockwise)    
    ctx.stroke()

    counterClockwise = !counterClockwise
    edgeStart = edgeEnd
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
  ctx.strokeWidth = 0
  ctx.arc(x, y, 1, 0, 2 * Math.PI)
  ctx.fill()
  ctx.beginPath()
}