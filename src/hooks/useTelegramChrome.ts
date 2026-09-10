import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getWebApp, initTelegram } from '../lib/telegram'

export function useTelegramInit(): void {
  useEffect(() => {
    initTelegram()

    const app = getWebApp()
    const root = document.documentElement
    const applyTheme = () => {
      root.setAttribute('data-theme', app?.colorScheme === 'light' ? 'light' : 'dark')
    }
    applyTheme()
    app?.onEvent('themeChanged', applyTheme)
    return () => app?.offEvent('themeChanged', applyTheme)
  }, [])
}

export function useTelegramBackButton(): void {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const app = getWebApp()
    if (!app) return

    const isHome = location.pathname === '/'
    const onBack = () => navigate(-1)

    if (isHome) {
      app.BackButton.hide()
    } else {
      app.BackButton.show()
      app.BackButton.onClick(onBack)
    }

    return () => {
      app.BackButton.offClick(onBack)
    }
  }, [location.pathname, navigate])
}
