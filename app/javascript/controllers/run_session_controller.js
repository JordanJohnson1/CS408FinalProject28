import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static values = {
    createUrl: String,
    runTricksUrl: String,
    player: Object,
    tricks: Array,
    comboResetMs: Number,
    trickCooldownMs: Number
  }

  static targets = [
    "coins",
    "xp",
    "bestCombo",
    "combo",
    "runClock",
    "status",
    "queue",
    "log",
    "runTotal",
    "playerName",
    "saveStatus",
    "trickCooldown"
  ]

  connect() {
    this.runId = null
    this.startTime = null
    this.ticker = null
    this.runCoins = 0
    this.comboCount = 0
    this.comboMultiplier = 1
    this.comboTimer = null
    this.comboResetMs = this.hasComboResetMsValue ? this.comboResetMsValue : 3200
    this.trickCooldownUntil = 0
    this.trickCooldownTicker = null
    this.trickRequestInFlight = false
    this.csrfToken = document.querySelector("meta[name='csrf-token']")?.content
    this.boundHandleTrick = this.boundHandleTrick || ((event) => this.handleTrick(event))
    this.element.addEventListener("trick-input:triggered", this.boundHandleTrick)
    this.skateCanvasController = this.application.getControllerForElementAndIdentifier(this.element, "skate-canvas")
    this.renderSavedState()
    this.renderTrickCooldown()
  }

  disconnect() {
    this.element.removeEventListener("trick-input:triggered", this.boundHandleTrick)
    if (this.ticker) clearInterval(this.ticker)
    if (this.comboTimer) clearTimeout(this.comboTimer)
    if (this.trickCooldownTicker) clearInterval(this.trickCooldownTicker)
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
        this.resetCombo()
        this.startTime = Date.now()
        this.setStatus("Active")
        this.startClock()
        this.updatePlayer(data.player)
        this.persistProgress(data.player)
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
      .then(res => res.json())
      .then(data => {
        this.updatePlayer(data.player)
        this.persistProgress(data.player)
      })
      .finally(() => {
        this.setStatus("Finished")
        if (this.ticker) clearInterval(this.ticker)
        if (this.comboTimer) clearTimeout(this.comboTimer)
        this.resetCombo()
        this.runId = null
      })
  }

  handleTrick(event) {
    if (!this.runId) return
    if (this.trickRequestInFlight) return
    if (Date.now() < this.trickCooldownUntil) return

    const { trickId, input } = event.detail
    const trick = this.tricksValue.find(t => t.id === trickId)
    if (!trick) return

    const multiplier = this.comboMultiplier
    const comboCount = this.comboCount + 1
    this.trickRequestInFlight = true
    this.startTrickCooldown()

    fetch(this.runTricksUrlValue, {
      method: "POST",
      headers: this.headers(),
      body: new URLSearchParams({
        run_id: this.runId,
        trick_id: trickId,
        input_used: input,
        multiplier,
        combo_count: comboCount
      })
    })
      .then(res => res.json())
      .then(data => {
        this.runCoins = data.run.coins_earned
        this.bumpCombo()
        this.updatePlayer(data.player)
        this.persistProgress(data.player)
        this.pushLog(trick, multiplier, data.rewards)
        this.updateQueue(trick, multiplier, data.rewards)
        this.setStatus("Active")
      })
      .catch(() => this.setStatus("Error"))
      .finally(() => {
        this.trickRequestInFlight = false
      })
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
    this.playerValue = player
    this.coinsTarget.textContent = player.coins
    this.xpTarget.textContent = player.xp
    this.bestComboTarget.textContent = player.best_combo
    if (this.hasComboTarget) this.comboTarget.textContent = `x${this.comboMultiplier.toFixed(1)} (${this.comboCount})`
    this.runTotalTarget.textContent = `${this.runCoins} coins`
  }

  pushLog(trick, multiplier = 1, rewards = null) {
    if (!this.hasLogTarget) return
    const item = document.createElement("div")
    item.className = "log-entry"
    const coins = rewards?.coins ?? Math.round(trick.baseCoins * multiplier)
    const xp = rewards?.xp ?? Math.round(trick.baseXp * multiplier)
    item.innerHTML = `<div class="fw-semibold">${trick.name}</div><div class="text-muted small">${coins} coins • ${xp} XP • x${multiplier.toFixed(1)}</div>`
    this.logTarget.prepend(item)
    while (this.logTarget.children.length > 10) {
      this.logTarget.removeChild(this.logTarget.lastChild)
    }
  }

  updateQueue(trick, multiplier = 1, rewards = null) {
    if (!this.hasQueueTarget) return
    const li = document.createElement("li")
    li.className = "queue-item"
    const coins = rewards?.coins ?? Math.round(trick.baseCoins * multiplier)
    li.innerHTML = `<div><div class="fw-semibold">${trick.name}</div><small class="text-muted">Inputs: ${trick.input}</small></div><span class="badge bg-light text-dark">+${coins} coins • x${multiplier.toFixed(1)}</span>`
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

  bumpCombo() {
    this.comboCount += 1
    const nextMultiplier = 1 + (this.comboCount - 1) * 0.2
    this.comboMultiplier = Math.min(nextMultiplier, 3)
    if (this.comboTimer) clearTimeout(this.comboTimer)
    this.comboTimer = setTimeout(() => this.resetCombo(), this.comboResetMs)
  }

  resetCombo() {
    this.comboCount = 0
    this.comboMultiplier = 1
    if (this.hasComboTarget) this.comboTarget.textContent = `x${this.comboMultiplier.toFixed(1)} (${this.comboCount})`
  }

  startTrickCooldown() {
    const cooldownMs = this.hasTrickCooldownMsValue ? this.trickCooldownMsValue : 900
    this.trickCooldownUntil = Date.now() + cooldownMs
    this.renderTrickCooldown()

    if (this.trickCooldownTicker) clearInterval(this.trickCooldownTicker)
    this.trickCooldownTicker = setInterval(() => {
      this.renderTrickCooldown()
      if (Date.now() >= this.trickCooldownUntil) {
        clearInterval(this.trickCooldownTicker)
        this.trickCooldownTicker = null
      }
    }, 100)
  }

  renderTrickCooldown() {
    if (!this.hasTrickCooldownTarget) return

    const remainingMs = this.trickCooldownUntil - Date.now()
    if (remainingMs <= 0) {
      this.trickCooldownTarget.textContent = "Ready"
      this.trickCooldownTarget.className = "badge bg-skate-soft text-dark"
      return
    }

    this.trickCooldownTarget.textContent = `${(remainingMs / 1000).toFixed(1)}s cooldown`
    this.trickCooldownTarget.className = "badge bg-warning text-dark"
  }

  persistProgress(player) {
    if (!player?.id) return

    const savedAt = new Date().toISOString()
    try {
      window.localStorage.setItem(this.storageKey(player.id), JSON.stringify({ player, savedAt }))
    } catch {
      return
    }

    this.renderSaveStatus(savedAt)
  }

  renderSavedState() {
    if (!this.hasSaveStatusTarget || !this.playerValue?.id) return

    try {
      const saved = window.localStorage.getItem(this.storageKey(this.playerValue.id))
      if (!saved) return

      const payload = JSON.parse(saved)
      if (payload?.savedAt) this.renderSaveStatus(payload.savedAt)
    } catch {
      this.saveStatusTarget.textContent = "Autosave unavailable"
    }
  }

  renderSaveStatus(savedAt) {
    if (!this.hasSaveStatusTarget) return

    const timestamp = new Date(savedAt)
    if (Number.isNaN(timestamp.getTime())) {
      this.saveStatusTarget.textContent = "Progress saved"
      return
    }

    this.saveStatusTarget.textContent = `Saved ${timestamp.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", second: "2-digit" })}`
  }

  storageKey(playerId) {
    return `stick-skater-save-${playerId}`
  }

  headers() {
    return {
      "Accept": "application/json",
      "X-CSRF-Token": this.csrfToken,
      "Content-Type": "application/x-www-form-urlencoded"
    }
  }
}
