export interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
}

interface TelegramWebApp {
  ready: () => void
  expand: () => void
  disableVerticalSwipes?: () => void
  setHeaderColor?: (color: string) => void
  setBackgroundColor?: (color: string) => void
  colorScheme: 'light' | 'dark'
  themeParams: Record<string, string>
  initDataUnsafe: { user?: TelegramUser }
  onEvent: (event: string, handler: () => void) => void
  offEvent: (event: string, handler: () => void) => void
  BackButton: {
    show: () => void
    hide: () => void
    onClick: (handler: () => void) => void
    offClick: (handler: () => void) => void
  }
  MainButton: {
    show: () => void
    hide: () => void
    setText: (text: string) => void
    onClick: (handler: () => void) => void
    offClick: (handler: () => void) => void
    setParams: (params: Record<string, unknown>) => void
  }
  HapticFeedback?: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void
    selectionChanged: () => void
  }
  switchInlineQuery?: (query: string, choose_chat_types?: string[]) => void
  openTelegramLink?: (url: string) => void
  showAlert?: (message: string) => void
  showConfirm?: (message: string, cb: (confirmed: boolean) => void) => void
}

declare global {
  interface Window {
    Telegram?: { WebApp?: TelegramWebApp }
  }
}

export function getWebApp(): TelegramWebApp | undefined {
  return window.Telegram?.WebApp
}

export function isRunningInTelegram(): boolean {
  return Boolean(window.Telegram?.WebApp?.initDataUnsafe)
}

export function haptic(style: 'light' | 'medium' | 'heavy' = 'light'): void {
  getWebApp()?.HapticFeedback?.impactOccurred(style)
}

export function hapticSelection(): void {
  getWebApp()?.HapticFeedback?.selectionChanged()
}

export function hapticNotify(type: 'error' | 'success' | 'warning'): void {
  getWebApp()?.HapticFeedback?.notificationOccurred(type)
}

export function getTelegramUser(): TelegramUser | undefined {
  return getWebApp()?.initDataUnsafe.user
}

export function switchInlineQuery(query: string): void {
  const app = getWebApp()
  if (app?.switchInlineQuery) {
    app.switchInlineQuery(query, ['users', 'groups', 'bots'])
  }
}

export function initTelegram(): void {
  const app = getWebApp()
  if (!app) return
  app.ready()
  app.expand()
  app.disableVerticalSwipes?.()
  app.setHeaderColor?.('#0b0b0c')
  app.setBackgroundColor?.('#0b0b0c')
}
