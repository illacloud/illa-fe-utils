const HEARTBEAT_PING_TIMEOUT = 2 * 1000
const HEARTBEAT_PONG_TIMEOUT = 5 * 1000
const RECONNECT_TIMEOUT = 5 * 1000
const REPEAT_LIMIT = 5

export interface IILLAWebSocketOptions {
  repeat: number
  lockReconnect: boolean
  forbidReconnect: boolean
  pingTimeoutId: number
  pongTimeoutId: number
  isOnline: boolean
}

const DEFAULT_PING_MESSAGE = JSON.stringify({
  signal: 0,
  option: 0,
  target: 0,
  payload: [],
  broadcast: null,
})

export default abstract class ILLAWebSocket {
  ws: WebSocket | null = null
  url: string
  options: IILLAWebSocketOptions = {
    repeat: 0,
    lockReconnect: false,
    forbidReconnect: false,
    pingTimeoutId: -1,
    pongTimeoutId: -1,
    isOnline: true,
  }

  protected constructor(url: string) {
    this.url = url
  }

  abstract onMessageCallback(event: MessageEvent): void

  abstract onOpenCallback(): void

  abstract onOnlineChangeCallback(isOnline: boolean): void

  private createWebsocket() {
    try {
      this.ws = new WebSocket(this.url)
      this.initEventHandle()
    } catch (e) {
      this.reconnect()
      throw e
    }
  }

  private initEventHandle() {
    if (this.ws) {
      this.ws.onclose = () => {
        this.reconnect()
      }
      this.ws.onerror = () => {
        this.reconnect()
      }
      this.ws.onopen = () => {
        console.log(`[WS OPENED](${this.url}) connection succeeded`)
        this.options.isOnline = true
        this.options.repeat = 0
        this.heartCheck()
        this.onOpenCallback()
      }
      this.ws.onmessage = (event) => {
        this.onMessageCallback(event)
        this.heartCheck()
      }
    }
  }

  private reconnect() {
    if (this.options.forbidReconnect) return
    if (this.options.isOnline) {
      this.options.isOnline = false
      this.onOnlineChangeCallback(this.options.isOnline)
    }
    if (REPEAT_LIMIT <= this.options.repeat) return
    if (this.options.lockReconnect) return
    this.options.lockReconnect = true
    this.options.repeat++
    setTimeout(() => {
      this.createWebsocket()
      this.options.lockReconnect = false
    }, RECONNECT_TIMEOUT)
  }

  private heartCheck() {
    this.heartReset()
    this.heartStart()
  }
  private heartStart() {
    if (this.options.forbidReconnect) return
    this.options.pingTimeoutId = window.setTimeout(() => {
      this.ws?.send(DEFAULT_PING_MESSAGE)
      this.options.pongTimeoutId = window.setTimeout(() => {
        if (this.options.isOnline) {
          this.options.isOnline = false
          this.onOnlineChangeCallback(this.options.isOnline)
        }
        this.ws?.close()
      }, HEARTBEAT_PONG_TIMEOUT)
    }, HEARTBEAT_PING_TIMEOUT)
  }
  private heartReset() {
    clearTimeout(this.options.pingTimeoutId)
    clearTimeout(this.options.pongTimeoutId)
  }

  public close() {
    this.options.forbidReconnect = true
    this.heartReset()
    this.ws?.close()
  }
  public send(message: string) {
    try {
      this.ws?.send(message)
    } catch (e) {
      console.error(e)
    }
  }
}
