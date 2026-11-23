'use client'

type Listener = (data: unknown) => void

// Ces erreurs demandent d'arrêter les reconnexions automatiques.
const NO_RECONNECT = [4001, 4008, 4009]
const listeners = new Map<string, Set<Listener>>()
const openListeners = new Set<() => void>()
const authExpiredListeners = new Set<() => void>()

let socket: WebSocket | null = null
let connecting = false
let consumers = 0
let attempt = 0
let reconnectTimer: ReturnType<typeof setTimeout> | undefined
let closeTimer: ReturnType<typeof setTimeout> | undefined
let redirectingToLogin = false

// Nettoie le cookie expiré avant de retourner à la page de connexion.
async function redirectToLogin() {
  if (redirectingToLogin) return
  redirectingToLogin = true
  try {
    await fetch('/api/realtime/ticket', { method: 'DELETE' })
  } catch {
    // La red peut déjà être coupée ; la redirection reste prioritaire.
  } finally {
    authExpiredListeners.forEach(listener => listener())
  }
}

// Attend un peu plus longtemps à chaque tentative pour éviter une boucle serrée.
function scheduleReconnect() {
  if (reconnectTimer || consumers === 0) return
  attempt += 1
  reconnectTimer = setTimeout(() => {
    reconnectTimer = undefined
    void connect()
  }, Math.min(1000 * 2 ** attempt, 15000))
}

// Demande un nouveau ticket, puis ouvre la socket avec l'URL renvoyée par l'API.
async function connect() {
  if (socket || connecting || consumers === 0) return
  connecting = true

  try {
    const response = await fetch('/api/realtime/ticket', { method: 'POST' })
    if (response.status === 401) {
      await redirectToLogin()
      return
    }
    if (!response.ok) throw new Error('Ticket WebSocket indisponible')

    const { url } = await response.json() as { url: string }
    if (consumers > 0 && !socket) openSocket(url)
  } catch {
    scheduleReconnect()
  } finally {
    connecting = false
  }
}

// Partage tous les messages reçus avec les composants abonnés à leur type.
function openSocket(url: string) {
  const currentSocket = new WebSocket(url)
  socket = currentSocket

  currentSocket.onopen = () => {
    attempt = 0
    openListeners.forEach(listener => listener())
  }

  currentSocket.onmessage = event => {
    try {
      const message = JSON.parse(event.data) as { type?: string; data?: unknown }
      if (!message.type) return
      listeners.get(message.type)?.forEach(listener => listener(message.data))
    } catch {
      // Ignore une trame invalide sans arrêter la connexion.
    }
  }

  currentSocket.onclose = event => {
    if (socket === currentSocket) socket = null
    if (event.code === 4001) {
      void redirectToLogin()
      return
    }
    if (consumers === 0 || NO_RECONNECT.includes(event.code) || event.code === 1000) return
    scheduleReconnect()
  }
}

// Garde la connexion ouverte tant qu'au moins un composant l'utilise.
export function retain() {
  clearTimeout(closeTimer)
  consumers += 1
  if (!socket && !connecting && !reconnectTimer) void connect()

  let released = false
  return () => {
    if (released) return
    released = true
    consumers = Math.max(0, consumers - 1)
    if (consumers > 0) return

    closeTimer = setTimeout(() => {
      if (consumers > 0) return
      clearTimeout(reconnectTimer)
      reconnectTimer = undefined
      socket?.close(1000)
      socket = null
    }, 1000)
  }
}

// Écoute un type de message et retourne une fonction de désabonnement.
export function subscribe(type: string, listener: Listener) {
  if (!listeners.has(type)) listeners.set(type, new Set())
  listeners.get(type)!.add(listener)
  return () => listeners.get(type)?.delete(listener)
}

// Appelle le composant à chaque ouverture, y compris après une reconnexion.
export function onOpen(listener: () => void) {
  openListeners.add(listener)
  if (socket?.readyState === WebSocket.OPEN) listener()
  return () => openListeners.delete(listener)
}

// Laisse un composant Next rediriger quand l'API signale une session expirée.
export function onAuthExpired(listener: () => void) {
  authExpiredListeners.add(listener)
  return () => authExpiredListeners.delete(listener)
}

// Envoie un message seulement quand la socket est ouverte.
export function send(type: string, data: object = {}) {
  if (socket?.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ type, data }))
  }
}
