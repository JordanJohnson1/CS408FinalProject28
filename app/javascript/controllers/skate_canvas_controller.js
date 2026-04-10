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
    this.raf = requestAnimationFrame(this.animate)
  }

  disconnect() {
    cancelAnimationFrame(this.raf)
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

    // nebula glow bands
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

    // light streaks
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
    const baseAir = Math.sin(this.t / 30) * 2
    const baseTilt = Math.sin(this.t / 35) * 2
    let pose = {
      air: baseAir,
      boardTilt: baseTilt,
      flip: 0,
      spin: 0,
      bodyLean: Math.sin(this.t / 40) * 0.04,
      crouch: 0,
      grinding: false,
      arms: 0,
      knees: 0,
      shoulders: 0
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
    this.ctx.scale(Math.cos(flipRad), 1)

    this.ctx.strokeStyle = grinding ? "#22d3ee" : "#111827"
    this.ctx.lineWidth = 8
    this.ctx.lineCap = "round"
    this.ctx.beginPath()
    this.ctx.moveTo(-32, 0)
    this.ctx.lineTo(32, 0)
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
    this.ctx.translate(0, -4)
    this.ctx.rotate(pose.bodyLean)
    this.ctx.lineCap = "round"

    // base silhouette
    this.ctx.strokeStyle = "#0f172a"
    this.ctx.lineWidth = 10
    this.ctx.beginPath()
    const shoulder = pose.shoulders * 8
    this.ctx.moveTo(-6, -10 + shoulder)
    this.ctx.lineTo(0, -38 + shoulder)
    this.ctx.lineTo(-10, -70 + shoulder)
    this.ctx.stroke()

    // legs
    this.ctx.lineWidth = 11
    this.ctx.beginPath()
    const kneeDrop = pose.knees * 12
    this.ctx.moveTo(-10, 32)
    this.ctx.lineTo(-6, 10 + kneeDrop)
    this.ctx.lineTo(-14, -12 + kneeDrop)
    this.ctx.moveTo(10, 32)
    this.ctx.lineTo(4, 10 + kneeDrop)
    this.ctx.lineTo(18, -10 + kneeDrop)
    this.ctx.stroke()

    // arms
    this.ctx.lineWidth = 9
    this.ctx.beginPath()
    const armLift = pose.arms * 18
    this.ctx.moveTo(-2, -26 - armLift)
    this.ctx.lineTo(-26, -14 - armLift * 0.6)
    this.ctx.moveTo(-2, -26 - armLift)
    this.ctx.lineTo(26, -8 - armLift * 0.4)
    this.ctx.stroke()

    // head
    this.ctx.fillStyle = "#0f172a"
    this.ctx.beginPath()
    this.ctx.arc(-8, -80, 10, 0, Math.PI * 2)
    this.ctx.fill()

    // backpack
    this.ctx.strokeStyle = "#22d3ee"
    this.ctx.lineWidth = 4
    this.ctx.beginPath()
    this.ctx.moveTo(-12, -52)
    this.ctx.lineTo(-2, -20)
    this.ctx.lineTo(10, -16)
    this.ctx.stroke()

    // accent on board stance
    this.ctx.strokeStyle = "#22d3ee"
    this.ctx.lineWidth = 3
    this.ctx.beginPath()
    this.ctx.moveTo(-14, -12)
    this.ctx.lineTo(-16, -6)
    this.ctx.moveTo(18, -10)
    this.ctx.lineTo(20, -4)
    this.ctx.stroke()

    this.ctx.restore()
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
    if (name.includes("flip")) return "flip"
    if (name.includes("shuv")) return "shuv"
    if (name.includes("180") || name.includes("spin")) return "spin180"
    if (name.includes("grind") || name.includes("slide")) return "grind"
    if (name.includes("manual")) return "manual"
    return "ollie"
  }

  trickPose(type, progress, base) {
    const ease = this.easeInOutSine(progress)
    const pose = { ...base }

    switch (type) {
    case "flip":
      pose.air += 90 * ease
      pose.boardTilt -= 16 * ease
      pose.flip = this.degToRad(900 * ease)
      pose.crouch = 10 * (1 - ease)
      pose.arms = 0.8
      pose.knees = 0.8
      pose.shoulders = 0.2
      break
    case "shuv":
      pose.air += 64 * ease
      pose.spin = this.degToRad(360 * ease)
      pose.boardTilt -= 10 * ease
      pose.crouch = 8 * (1 - ease)
      pose.arms = 0.6
      pose.knees = 0.6
      break
    case "spin180":
      pose.air += 56 * ease
      pose.spin = this.degToRad(180 * ease)
      pose.bodyLean += 0.16 * Math.sin(progress * Math.PI)
      pose.crouch = 9 * (1 - ease)
      pose.arms = 0.7
      pose.knees = 0.5
      pose.shoulders = 0.12
      break
    case "manual":
      pose.air += 12
      pose.boardTilt += -18 + 30 * Math.sin(progress * Math.PI)
      pose.crouch = 6
      pose.knees = 0.5
      pose.arms = 0.2
      break
    case "grind":
      pose.air = 18
      pose.boardTilt = -8
      pose.bodyLean = 0.1 * Math.sin(progress * Math.PI)
      pose.grinding = true
      pose.crouch = 6
      pose.knees = 0.5
      pose.arms = 0.3
      break
    default: // ollie
      pose.air += 64 * ease
      pose.boardTilt -= 14 * ease
      pose.crouch = 10 * (1 - ease)
      pose.knees = 0.6
      pose.arms = 0.4
      pose.shoulders = 0.1
      break
    }

    return pose
  }

  trickDuration(type) {
    switch (type) {
    case "manual":
      return 900
    case "grind":
      return 800
    case "flip":
    case "spin180":
    case "shuv":
      return 720
    default:
      return 650
    }
  }

  easeInOutSine(t) {
    return 0.5 - 0.5 * Math.cos(Math.PI * t)
  }

  degToRad(deg) {
    return deg * Math.PI / 180
  }
}
