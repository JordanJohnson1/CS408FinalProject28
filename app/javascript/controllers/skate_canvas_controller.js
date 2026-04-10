import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["canvas"]

  connect() {
    this.ctx = this.canvasTarget.getContext("2d")
    this.width = this.canvasTarget.width = this.canvasTarget.clientWidth
    this.height = this.canvasTarget.height
    this.t = 0
    this.flashText = null
    this.flashUntil = null
    this.animate = this.animate.bind(this)
    requestAnimationFrame(this.animate)
  }

  disconnect() {
    cancelAnimationFrame(this.raf)
  }

  flash(text) {
    this.flashText = text
    this.flashUntil = performance.now() + 800
  }

  animate() {
    this.t += 1
    this.clear()
    this.drawGround()
    this.drawSkater()
    this.drawFlash()
    this.raf = requestAnimationFrame(this.animate)
  }

  clear() {
    this.ctx.fillStyle = "#0b1221"
    this.ctx.fillRect(0, 0, this.width, this.height)
  }

  drawGround() {
    this.ctx.fillStyle = "#0f172a"
    this.ctx.fillRect(0, this.height - 60, this.width, 60)
    this.ctx.strokeStyle = "#22d3ee33"
    this.ctx.lineWidth = 2
    this.ctx.beginPath()
    const offset = (this.t % 200) * -2
    this.ctx.moveTo(offset, this.height - 20)
    for (let x = offset; x < this.width + 200; x += 80) {
      this.ctx.lineTo(x + 40, this.height - 30)
      this.ctx.lineTo(x + 80, this.height - 20)
    }
    this.ctx.stroke()
  }

  drawSkater() {
    const y = this.height - 80 - Math.sin(this.t / 20) * 8
    const x = (this.t * 3) % (this.width + 60) - 60
    this.ctx.strokeStyle = "#e5e7eb"
    this.ctx.lineWidth = 4
    this.ctx.lineCap = "round"

    // board
    this.ctx.beginPath()
    this.ctx.moveTo(x, y + 30)
    this.ctx.lineTo(x + 50, y + 30)
    this.ctx.stroke()

    // legs
    this.ctx.beginPath()
    this.ctx.moveTo(x + 15, y + 30)
    this.ctx.lineTo(x + 20, y + 10)
    this.ctx.lineTo(x + 10, y - 10)
    this.ctx.moveTo(x + 35, y + 30)
    this.ctx.lineTo(x + 30, y + 10)
    this.ctx.lineTo(x + 40, y - 10)
    this.ctx.stroke()

    // body
    this.ctx.beginPath()
    this.ctx.moveTo(x + 20, y - 10)
    this.ctx.lineTo(x + 25, y - 35)
    this.ctx.lineTo(x + 10, y - 55)
    this.ctx.stroke()

    // arms
    this.ctx.beginPath()
    this.ctx.moveTo(x + 22, y - 30)
    this.ctx.lineTo(x - 5, y - 25)
    this.ctx.moveTo(x + 22, y - 30)
    this.ctx.lineTo(x + 55, y - 15)
    this.ctx.stroke()

    // head
    this.ctx.beginPath()
    this.ctx.arc(x + 10, y - 65, 8, 0, Math.PI * 2)
    this.ctx.stroke()
  }

  drawFlash() {
    if (!this.flashText || performance.now() > this.flashUntil) return
    this.ctx.fillStyle = "rgba(34, 211, 238, 0.85)"
    this.ctx.font = "bold 22px 'Space Grotesk', sans-serif"
    this.ctx.fillText(this.flashText, 20, 40)
  }
}
