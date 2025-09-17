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

  circleChain([100, 100], -Math.PI / 4, [25, 10, 5, 3, 2], ctx)

  // for (let i = 0; i < steps; i++) {
  //   const turn = Math.PI
  //   ctx.arc(center[0], center[1], radius, 0, turn)
  //   const polarCenter = polarToCartesian(radius, turn, origin=center)
  //   // cartesianToPolar([polarCenter[0], polarCenter[1] + turn] 
  // }
}

function circleChain(start, angle, radii, ctx) {
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