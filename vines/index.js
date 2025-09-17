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

  arcWalk([100, 100], 0, [25, 10, 8, 5, 3, 2], ctx)
}

// start = starting point *on* a circle
// startAngle = angle from starting point to first center
function arcWalk(start, startAngle, radii, ctx) {
  let [x, y] = start
  let [cx, cy] = moveInDirection(start, radii[0], startAngle)
  let turn = remap(Math.random(), Math.PI / 8, Math.PI)

  ctx.beginPath()
  ctx.fillStyle = 'red'
  ctx.arc(x, y, 1, 0, 2 * Math.PI)
  ctx.fill()

  for (let i = 0; i < radii.length; i++) {
    ctx.beginPath()
    ctx.fillStyle = 'red'
    ctx.arc(cx, cy, 1, 0, 2 * Math.PI)
    ctx.fill()

    ctx.beginPath()
    let arcStart = cartesianToPolar([x, y], [cx, cy])

    ;[x, y] = moveInDirection([cx, cy], radii[i], turn)
    let arcEnd = cartesianToPolar([x, y], [cx, cy])

    turn = remap(Math.random(), 0.1 * Math.PI, Math.PI)
    ctx.arc(cx, cy, radii[i], arcStart[1], arcEnd[1])
    ;[cx, cy] = moveInDirection([x, y], radii[i + 1], startAngle)

    ctx.stroke()
  }
}

// start = starting center point
function wiggleLine(start, angle, radii, ctx) {
  let [x, y] = start
  for (let i = 0; i < radii.length; i++) {
    ctx.arc(x, y, radii[i], angle, angle + Math.PI, i % 2)
    x += (radii[i] + radii[i + 1]) * Math.sin(angle)
    y += (radii[i] + radii[i + 1]) * Math.cos(angle)
    ctx.stroke()
  }
}

function circleLine(start, angle, radii, ctx) {
  let [x, y] = start
  for (let i = 0; i < radii.length; i++) {
    ctx.moveTo(x + radii[i], y)
    ctx.arc(x, y, radii[i], 0, 2 * Math.PI)
    x += (radii[i] + radii[i + 1]) * Math.sin(angle)
    y += (radii[i] + radii[i + 1]) * Math.cos(angle)
  }
  ctx.stroke()
}

function polarToCartesian(radius, angle, origin=[0, 0]) {
  return [r * Math.sin(angle) + origin[0], r * Math.cos(angle) + origin[1]]
}

function cartesianToPolar(coord, origin=[0, 0]) {
  let x = coord[0] - origin[0]
  let y = coord[1] - origin[1]
  
  // atan can only handle top right quadrant, so need to adjust with atan2
  return [Math.sqrt(x*x + y*y), Math.atan2(y, x)]
}

function moveInDirection(start, length, angle) {
  return [start[0] + length * Math.sin(angle), start[1] + length * Math.cos(angle)]
}

// normalized: between 0 and 1
function remap(normalized, max, min) {
  return (normalized * (max - min)) * max
}