import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static values = {
    createUrl: String,
    runTricksUrl: String,
    player: Object,
    tricks: Array
  }

  static targets = [
    "coins",
    "xp",
    "bestCombo",
    "runClock",
    "status",
    "queue",
    "log",
    "runTotal",
    "playerName"
  ]

  connect() {
    this.runId = null
    this.startTime = null
    this.ticker = null
    this.runCoins = 0
    this.csrfToken = document.querySelector("meta[name='csrf-token']")?.content
    this.element.addEventListener("trick-input:triggered", (event) => this.handleTrick(event))
    this.skateCanvasController = this.application.getControllerForElementAndIdentifier(this.element, "skate-canvas")
  }

  disconnect() {
    if (this.ticker) clearInterval(this.ticker)
  }

  start() {
    if (this.runId) return
    this.setStatus("Starting…")
    fetch(this.createUrlValue, {
      method: "POST",
      headers: this.headers(),
      body: new URLSearchParams()
    })
      .then(res => res.json())
      .then(data => {
        this.runId = data.id
        this.runCoins = 0
        this.startTime = Date.now()
        this.setStatus("Active")
        this.startClock()
      })
      .catch(() => this.setStatus("Error"))
  }

  finish() {
    if (!this.runId) return
    const duration = Date.now() - this.startTime
    fetch(`${this.createUrlValue}/${this.runId}`, {
      method: "PATCH",
      headers: this.headers(),
      body: new URLSearchParams({ status: "finished", duration_ms: duration })
    })
      .finally(() => {
        this.setStatus("Finished")
        if (this.ticker) clearInterval(this.ticker)
        this.runId = null
      })
  }

  handleTrick(event) {
    if (!this.runId) return
    const { trickId, input } = event.detail
    const trick = this.tricksValue.find(t => t.id === trickId)
    if (!trick) return

    fetch(this.runTricksUrlValue, {
      method: "POST",
      headers: this.headers(),
      body: new URLSearchParams({
        run_id: this.runId,
        trick_id: trickId,
        input_used: input
      })
    })
      .then(res => res.json())
      .then(data => {
        this.runCoins = data.run.coins_earned
        this.updatePlayer(data.player)
        this.pushLog(trick)
        this.updateQueue(trick)
        this.setStatus("Active")
        this.skateCanvasController?.flash(trick.name)
        this.skateCanvasController?.playTrick(trick)
      })
      .catch(() => this.setStatus("Error"))
  }

  startClock() {
    if (this.ticker) clearInterval(this.ticker)
    this.ticker = setInterval(() => {
      if (!this.startTime) return
      const elapsed = Date.now() - this.startTime
      const minutes = Math.floor(elapsed / 60000)
      const seconds = Math.floor((elapsed % 60000) / 1000)
      this.runClockTarget.textContent = `${this.pad(minutes)}:${this.pad(seconds)}`
    }, 500)
  }

  updatePlayer(player) {
    this.coinsTarget.textContent = player.coins
    this.xpTarget.textContent = player.xp
    this.bestComboTarget.textContent = player.best_combo
    this.runTotalTarget.textContent = `${this.runCoins} coins`
  }

  pushLog(trick) {
    if (!this.hasLogTarget) return
    const item = document.createElement("div")
    item.className = "log-entry"
    item.innerHTML = `<div class="fw-semibold">${trick.name}</div><div class="text-muted small">${trick.baseCoins} coins • ${trick.baseXp} XP</div>`
    this.logTarget.prepend(item)
    while (this.logTarget.children.length > 10) {
      this.logTarget.removeChild(this.logTarget.lastChild)
    }
  }

  updateQueue(trick) {
    if (!this.hasQueueTarget) return
    const li = document.createElement("li")
    li.className = "queue-item"
    li.innerHTML = `<div><div class="fw-semibold">${trick.name}</div><small class="text-muted">Inputs: ${trick.input}</small></div><span class="badge bg-light text-dark">+${trick.baseCoins} coins</span>`
    this.queueTarget.prepend(li)
    while (this.queueTarget.children.length > 4) {
      this.queueTarget.removeChild(this.queueTarget.lastChild)
    }
  }

  setStatus(text) {
    if (this.hasStatusTarget) this.statusTarget.textContent = text
  }

  pad(num) {
    return String(num).padStart(2, "0")
  }

  headers() {
    return {
      "Accept": "application/json",
      "X-CSRF-Token": this.csrfToken,
      "Content-Type": "application/x-www-form-urlencoded"
    }
  }
}
