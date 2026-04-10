import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static values = { tricks: Array }
  static targets = ["keys"]

  connect() {
    this.pressed = new Set()
    this.renderKeys()
    this.handleKeyDown = this.handleKeyDown.bind(this)
    this.handleKeyUp = this.handleKeyUp.bind(this)
    window.addEventListener("keydown", this.handleKeyDown)
    window.addEventListener("keyup", this.handleKeyUp)
  }

  disconnect() {
    window.removeEventListener("keydown", this.handleKeyDown)
    window.removeEventListener("keyup", this.handleKeyUp)
  }

  handleKeyDown(event) {
    if (event.repeat) return
    const key = this.normalizeKey(event.key)
    this.pressed.add(key)
    this.renderKeys()
    this.checkForTrick()
  }

  handleKeyUp(event) {
    const key = this.normalizeKey(event.key)
    this.pressed.delete(key)
    this.renderKeys()
  }

  checkForTrick() {
    const keys = Array.from(this.pressed)
    this.tricksValue.forEach(trick => {
      const needed = trick.input.split("+").map(k => k.trim().toLowerCase())
      const matches = needed.every(key => keys.includes(key))
      if (matches) {
        this.dispatch("triggered", { detail: { trickId: trick.id, input: trick.input } })
      }
    })
  }

  renderKeys() {
    if (!this.hasKeysTarget) return
    this.keysTarget.innerHTML = ""
    const keys = Array.from(this.pressed)
    if (keys.length === 0) {
      this.keysTarget.innerHTML = '<span class="text-muted">Press arrows + space to start tricking</span>'
      return
    }

    keys.forEach(key => {
      const el = document.createElement("span")
      el.className = "key-chip"
      el.textContent = key.toUpperCase()
      this.keysTarget.appendChild(el)
    })
  }

  normalizeKey(key) {
    const lower = key.toLowerCase()
    if (lower === " ") return "space"
    if (lower === "spacebar") return "space"
    if (lower.startsWith("arrow")) return lower.replace("arrow", "")
    return lower
  }
}
