import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["canvas"]

  connect() {
    this.ctx = this.canvasTarget.getContext("2d")
    this.width = this.canvasTarget.width = this.canvasTarget.clientWidth
    this.height = this.canvasTarget.height
    this.groundHeight = 68
    this.groundY = this.height - this.groundHeight
    this.t = 0
    this.worldOffset = 0
    this.scrollSpeed = 3.4
    this.flashText = null
    this.flashUntil = null
    this.trickState = null
    this.railSpacing = 520
    this.parallaxLayers = [
      { color: "#132349", height: 140, speed: 0.35, amplitude: 12 },
      { color: "#123456", height: 90, speed: 0.6, amplitude: 18 },
      { color: "#0d9488", height: 60, speed: 0.9, amplitude: 10 }
    ]
    this.skaterX = this.width * 0.5
    this.animate = this.animate.bind(this)
    this.handleTriggeredTrick = this.handleTriggeredTrick.bind(this)
    this.element.addEventListener("trick-input:triggered", this.handleTriggeredTrick)
    this.raf = requestAnimationFrame(this.animate)
  }

  disconnect() {
    this.element.removeEventListener("trick-input:triggered", this.handleTriggeredTrick)
    cancelAnimationFrame(this.raf)
  }

  handleTriggeredTrick(event) {
    const { name, input } = event.detail || {}
    const trick = { name: name || input || "Trick" }
    this.flash(trick.name)
    this.playTrick(trick)
  }

  flash(text) {
    this.flashText = text
    this.flashUntil = performance.now() + 800
  }

  playTrick(trick) {
    const type = this.trickType(trick)
    this.trickState = {
      type,
      startedAt: performance.now(),
      duration: this.trickDuration(type),
      landed: false
    }
  }

  animate() {
    this.t += 1
    this.worldOffset += this.scrollSpeed
    this.clear()
    this.drawSky()
    this.drawParallax()
    this.drawGround()
    this.drawRails()
    this.drawSkater()
    this.drawFlash()
    this.raf = requestAnimationFrame(this.animate)
  }

  clear() {
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height)
    gradient.addColorStop(0, "#0ea5e9")
    gradient.addColorStop(0.4, "#1e1b4b")
    gradient.addColorStop(1, "#0b1024")
    this.ctx.fillStyle = gradient
    this.ctx.fillRect(0, 0, this.width, this.height)

    this.ctx.fillStyle = "rgba(236, 72, 153, 0.12)"
    this.ctx.beginPath()
    this.ctx.ellipse(this.width * 0.6, this.height * 0.25, 220, 80, 0.4, 0, Math.PI * 2)
    this.ctx.fill()
    this.ctx.fillStyle = "rgba(34, 211, 238, 0.14)"
    this.ctx.beginPath()
    this.ctx.ellipse(this.width * 0.3, this.height * 0.18, 200, 70, -0.3, 0, Math.PI * 2)
    this.ctx.fill()
  }

  drawSky() {
    const glowHeight = 140
    const gradient = this.ctx.createLinearGradient(0, this.groundY - glowHeight, 0, this.groundY)
    gradient.addColorStop(0, "rgba(94, 234, 212, 0.16)")
    gradient.addColorStop(1, "rgba(94, 234, 212, 0)")
    this.ctx.fillStyle = gradient
    this.ctx.fillRect(0, this.groundY - glowHeight, this.width, glowHeight)

    const offset = (this.worldOffset * 0.2) % 90
    this.ctx.fillStyle = "rgba(236, 72, 153, 0.45)"
    for (let x = -offset; x < this.width + 90; x += 90) {
      this.ctx.fillRect(x, this.groundY - 24, 28, 3)
    }
  }

  drawParallax() {
    this.parallaxLayers.forEach(layer => {
      const offset = (this.worldOffset * layer.speed) % 220
      const baseY = this.groundY - layer.height
      this.ctx.fillStyle = layer.color
      for (let x = -offset - 220; x < this.width + 220; x += 220) {
        this.ctx.beginPath()
        this.ctx.moveTo(x, this.groundY)
        const peak = baseY + Math.sin((x + this.worldOffset * 0.2) / 40) * layer.amplitude
        this.ctx.quadraticCurveTo(x + 55, peak, x + 110, this.groundY)
        this.ctx.lineTo(x + 220, this.groundY)
        this.ctx.closePath()
        this.ctx.fill()
      }
    })

    const streakOffset = (this.worldOffset * 1.2) % 260
    this.ctx.strokeStyle = "rgba(244, 114, 182, 0.35)"
    this.ctx.lineWidth = 3
    for (let x = -streakOffset; x < this.width + 260; x += 260) {
      this.ctx.beginPath()
      this.ctx.moveTo(x, this.groundY - 110)
      this.ctx.lineTo(x + 120, this.groundY - 80)
      this.ctx.stroke()
    }
  }

  drawGround() {
    this.ctx.fillStyle = "#0b1229"
    this.ctx.fillRect(0, this.groundY, this.width, this.groundHeight)

    this.ctx.strokeStyle = "#22d3ee99"
    this.ctx.lineWidth = 3
    this.ctx.beginPath()
    const offset = this.worldOffset % 110
    for (let x = -offset - 110; x < this.width + 110; x += 110) {
      this.ctx.moveTo(x, this.groundY + this.groundHeight / 2)
      this.ctx.lineTo(x + 40, this.groundY + this.groundHeight / 2 - 10)
      this.ctx.lineTo(x + 80, this.groundY + this.groundHeight / 2)
    }
    this.ctx.stroke()
  }

  drawRails() {
    const spacing = this.railSpacing
    const offset = this.worldOffset % spacing
    for (let x = -offset - spacing; x < this.width + spacing; x += spacing) {
      const startX = x + 120
      const endX = startX + 160
      const railY = this.groundY - 18

      this.ctx.strokeStyle = "#9ca3af"
      this.ctx.lineWidth = 6
      this.ctx.lineCap = "round"
      this.ctx.beginPath()
      this.ctx.moveTo(startX, railY)
      this.ctx.lineTo(endX, railY)
      this.ctx.stroke()

      this.ctx.lineWidth = 3
      this.ctx.strokeStyle = "#64748b"
      this.ctx.beginPath()
      this.ctx.moveTo(startX + 20, railY)
      this.ctx.lineTo(startX + 20, railY + 22)
      this.ctx.moveTo(endX - 20, railY)
      this.ctx.lineTo(endX - 20, railY + 22)
      this.ctx.stroke()
    }
  }

  drawSkater() {
    const now = performance.now()
    const cycle = this.t / 22
    const baseAir = Math.sin(this.t / 30) * 2
    const baseTilt = Math.sin(this.t / 35) * 2

    let pose = {
      air: baseAir,
      boardTilt: baseTilt,
      flip: 0,
      spin: 0,
      bodyLean: Math.sin(this.t / 42) * 0.05,
      crouch: 0,
      grinding: false,
      backArm: -0.3 + Math.sin(cycle) * 0.18,
      frontArm: 0.22 + Math.sin(cycle + 0.9) * 0.18,
      frontLeg: 0.12 + Math.sin(cycle) * 0.1,
      backLeg: -0.08 + Math.sin(cycle + 1.2) * 0.08,
      torsoTwist: Math.sin(cycle) * 0.03,
      headTilt: Math.sin(cycle + 0.5) * 0.05
    }

    if (this.trickState) {
      const { type, startedAt, duration } = this.trickState
      const progress = Math.min((now - startedAt) / duration, 1)
      pose = this.trickPose(type, progress, pose)
      if (progress >= 1) this.trickState = null
    }

    const x = this.skaterX
    const y = this.groundY - 32 - pose.air

    this.drawShadow(x, this.groundY - 6, pose.air)
    this.ctx.save()
    this.ctx.translate(x, y + pose.crouch)
    this.ctx.rotate(pose.spin)
    this.drawBoard(pose.boardTilt, pose.flip, pose.grinding)
    this.drawBody(pose)
    this.ctx.restore()
  }

  drawBoard(angleDeg, flipRad, grinding) {
    this.ctx.save()
    this.ctx.translate(0, 26)
    this.ctx.rotate(this.degToRad(angleDeg))

    const flipScale = Math.cos(flipRad)
    const deckScale = Math.max(Math.abs(flipScale), 0.18)
    this.ctx.scale(deckScale, 1)

    this.ctx.strokeStyle = grinding ? "#22d3ee" : "#111827"
    this.ctx.lineWidth = 9
    this.ctx.lineCap = "round"
    this.ctx.beginPath()
    this.ctx.moveTo(-30, 0)
    this.ctx.quadraticCurveTo(-18, -4, 0, -4)
    this.ctx.quadraticCurveTo(18, -4, 30, 0)
    this.ctx.stroke()

    this.ctx.lineWidth = 3
    this.ctx.strokeStyle = "#e5e7ebaa"
    this.ctx.beginPath()
    this.ctx.moveTo(-18, 6)
    this.ctx.lineTo(-12, 6)
    this.ctx.moveTo(12, 6)
    this.ctx.lineTo(18, 6)
    this.ctx.stroke()

    this.ctx.restore()
  }

  drawBody(pose) {
    this.ctx.save()
    this.ctx.translate(0, -2)
    this.ctx.rotate(pose.bodyLean + pose.torsoTwist)
    this.ctx.lineCap = "round"
    this.ctx.lineJoin = "round"

    const hip = { x: 0, y: -2 }
    const shoulder = { x: -2, y: -44 }
    const neck = { x: -4, y: -58 }
    const head = { x: -5, y: -74 }

    const frontKnee = { x: 14, y: -10 + pose.frontLeg * 20 }
    const frontFoot = { x: 18, y: 22 }
    const backKnee = { x: -14, y: -8 + pose.backLeg * 18 }
    const backFoot = { x: -20, y: 22 }

    const frontElbow = { x: 16, y: -38 + pose.frontArm * 18 }
    const frontHand = { x: 28, y: -18 + pose.frontArm * 20 }
    const backElbow = { x: -18, y: -40 + pose.backArm * 18 }
    const backHand = { x: -28, y: -18 + pose.backArm * 20 }

    this.ctx.strokeStyle = "#0f172a"

    this.ctx.lineWidth = 8
    this.drawLimb(shoulder, neck)
    this.drawLimb(neck, hip)

    this.ctx.lineWidth = 7
    this.drawLimb(shoulder, frontElbow)
    this.drawLimb(frontElbow, frontHand)
    this.drawLimb(shoulder, backElbow)
    this.drawLimb(backElbow, backHand)

    this.ctx.lineWidth = 8
    this.drawLimb(hip, frontKnee)
    this.drawLimb(frontKnee, frontFoot)
    this.drawLimb(hip, backKnee)
    this.drawLimb(backKnee, backFoot)

    this.ctx.fillStyle = "#0f172a"
    ;[shoulder, hip, frontKnee, backKnee, frontElbow, backElbow].forEach(joint => {
      this.ctx.beginPath()
      this.ctx.arc(joint.x, joint.y, 3.2, 0, Math.PI * 2)
      this.ctx.fill()
    })

    this.ctx.save()
    this.ctx.translate(head.x, head.y)
    this.ctx.rotate(pose.headTilt)
    this.ctx.beginPath()
    this.ctx.arc(0, 0, 11, 0, Math.PI * 2)
    this.ctx.fill()

    this.ctx.strokeStyle = "#22d3ee"
    this.ctx.lineWidth = 3
    this.ctx.beginPath()
    this.ctx.moveTo(-4, 10)
    this.ctx.lineTo(2, 16)
    this.ctx.lineTo(10, 13)
    this.ctx.stroke()
    this.ctx.restore()

    this.ctx.strokeStyle = "#22d3ee"
    this.ctx.lineWidth = 3
    this.ctx.beginPath()
    this.ctx.moveTo(-10, -48)
    this.ctx.lineTo(4, -30)
    this.ctx.lineTo(14, -28)
    this.ctx.stroke()

    this.ctx.restore()
  }

  drawLimb(start, end) {
    this.ctx.beginPath()
    this.ctx.moveTo(start.x, start.y)
    this.ctx.lineTo(end.x, end.y)
    this.ctx.stroke()
  }

  drawShadow(x, y, air) {
    const radius = 26 + air * 0.12
    this.ctx.save()
    this.ctx.fillStyle = `rgba(0, 0, 0, ${0.18 - Math.min(air, 40) * 0.002})`
    this.ctx.beginPath()
    this.ctx.ellipse(x, y, radius, radius * 0.3, 0, 0, Math.PI * 2)
    this.ctx.fill()
    this.ctx.restore()
  }

  drawFlash() {
    if (!this.flashText || performance.now() > this.flashUntil) return
    this.ctx.fillStyle = "rgba(34, 211, 238, 0.85)"
    this.ctx.font = "bold 22px 'Space Grotesk', sans-serif"
    this.ctx.fillText(this.flashText, 20, 40)
  }

  trickType(trick) {
    const name = trick.name.toLowerCase()
    if (name.includes("heel")) return "heel"
    if (name.includes("flip")) return "flip"
    if (name.includes("shuv")) return "shuv"
    if (name.includes("180") || name.includes("spin")) return "spin180"
    if (name.includes("grind") || name.includes("slide")) return "grind"
    if (name.includes("manual")) return name.includes("nose") ? "noseManual" : "manual"
    return "ollie"
  }

  trickPose(type, progress, base) {
    const arc = Math.sin(progress * Math.PI)
    const pose = { ...base }

    switch (type) {
    case "flip":
      pose.air += 78 * arc
      pose.boardTilt -= 18 * Math.sin(progress * Math.PI * 0.9)
      pose.flip = this.degToRad(360 * progress)
      pose.crouch = 12 * (1 - arc)
      pose.frontArm = 0.85
      pose.backArm = -0.8
      pose.frontLeg = 0.38
      pose.backLeg = -0.35
      pose.bodyLean = -0.08
      break
    case "heel":
      pose.air += 74 * arc
      pose.boardTilt += 16 * Math.sin(progress * Math.PI * 0.9)
      pose.flip = this.degToRad(-360 * progress)
      pose.crouch = 11 * (1 - arc)
      pose.frontArm = 0.78
      pose.backArm = -0.65
      pose.frontLeg = 0.28
      pose.backLeg = -0.28
      pose.bodyLean = 0.06
      break
    case "shuv":
      pose.air += 62 * arc
      pose.spin = this.degToRad(90 * Math.sin(progress * Math.PI))
      pose.boardTilt -= 10 * arc
      pose.crouch = 10 * (1 - arc)
      pose.frontArm = 0.55
      pose.backArm = -0.55
      pose.frontLeg = 0.24
      pose.backLeg = -0.18
      break
    case "spin180":
      pose.air += 60 * arc
      pose.spin = this.degToRad(180 * progress)
      pose.crouch = 8 * (1 - arc)
      pose.frontArm = 0.62
      pose.backArm = -0.42
      pose.frontLeg = 0.18
      pose.backLeg = -0.16
      pose.bodyLean = 0.12 * Math.sin(progress * Math.PI)
      break
    case "noseManual":
      pose.air += 10
      pose.boardTilt = -18 + 8 * Math.sin(progress * Math.PI)
      pose.crouch = 7
      pose.frontArm = 0.16
      pose.backArm = -0.1
      pose.frontLeg = 0.24
      pose.backLeg = -0.32
      pose.bodyLean = 0.1
      break
    case "manual":
      pose.air += 8
      pose.boardTilt = 16 - 8 * Math.sin(progress * Math.PI)
      pose.crouch = 7
      pose.frontArm = 0.12
      pose.backArm = -0.14
      pose.frontLeg = -0.16
      pose.backLeg = 0.28
      pose.bodyLean = -0.08
      break
    case "grind":
      pose.air = 18
      pose.boardTilt = -6
      pose.grinding = true
      pose.crouch = 5
      pose.frontArm = 0.25
      pose.backArm = -0.22
      pose.frontLeg = 0.1
      pose.backLeg = 0.04
      pose.bodyLean = 0.08 * Math.sin(progress * Math.PI)
      break
    default:
      pose.air += 64 * arc
      pose.boardTilt -= 12 * arc
      pose.crouch = 10 * (1 - arc)
      pose.frontArm = 0.34
      pose.backArm = -0.26
      pose.frontLeg = 0.18
      pose.backLeg = -0.18
      break
    }

    return pose
  }

  trickDuration(type) {
    switch (type) {
    case "manual":
    case "noseManual":
      return 900
    case "grind":
      return 800
    case "flip":
    case "heel":
    case "spin180":
    case "shuv":
      return 720
    default:
      return 650
    }
  }

  degToRad(deg) {
    return deg * Math.PI / 180
  }
}
