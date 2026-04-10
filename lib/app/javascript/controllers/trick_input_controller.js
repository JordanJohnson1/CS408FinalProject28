import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static values = { tricks: Array }
  static targets = ["keys"]

  connect() {
    this.pressed = new Set()
    this.lastTriggeredSignature = null
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
    if (this.isMovementKey(event.key)) event.preventDefault()

    const key = this.normalizeKey(event.key)
    if (!key) return

    this.pressed.add(key)
    this.renderKeys()
    this.checkForTrick()
  }

  handleKeyUp(event) {
    const key = this.normalizeKey(event.key)
    if (!key) return

    this.pressed.delete(key)
    this.lastTriggeredSignature = null
    this.renderKeys()
  }

  checkForTrick() {
    const keys = Array.from(this.pressed)
    const matched = this.findBestMatch(keys)
    if (!matched) return

    const signature = this.comboSignature(matched.input)
    if (this.lastTriggeredSignature === signature) return

    this.lastTriggeredSignature = signature
    this.dispatch("triggered", {
      detail: {
        trickId: matched.id,
        input: matched.input,
        name: matched.name
      }
    })
  }

  findBestMatch(keys) {
    const normalizedKeys = [...keys].sort()

    return [...this.tricksValue]
      .sort((a, b) => {
        const lenDiff = this.parseInput(b.input).length - this.parseInput(a.input).length
        if (lenDiff !== 0) return lenDiff
        return (b.difficulty || 0) - (a.difficulty || 0)
      })
      .find(trick => {
        const needed = this.parseInput(trick.input)
        return needed.length === normalizedKeys.length && needed.every((key, index) => key === normalizedKeys[index])
      })
  }

  parseInput(input) {
    return input
      .split("+")
      .map(key => key.trim().toLowerCase())
      .filter(Boolean)
      .sort()
  }

  comboSignature(input) {
    return this.parseInput(input).join("+")
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
    return ["up", "down", "left", "right", "space"].includes(lower) ? lower : null
  }

  isMovementKey(rawKey) {
    const key = rawKey.toLowerCase()
    return key === " " || key === "spacebar" || key.startsWith("arrow")
  }
}
