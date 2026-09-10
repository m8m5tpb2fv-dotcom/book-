import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('WAVE crashed:', error, info.componentStack)
  }

  handleReload = () => {
    this.setState({ error: null })
    window.location.reload()
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children

    return (
      <div
        style={{
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          padding: 32,
          textAlign: 'center',
          background: '#0b0b0c',
          color: '#f5f4ef',
          fontFamily: 'sans-serif',
        }}
      >
        <p style={{ fontWeight: 800, fontSize: 20, margin: 0 }}>Что-то пошло не так</p>
        <p style={{ fontSize: 14, opacity: 0.7, margin: 0, maxWidth: '32ch' }}>
          Приложение не смогло запуститься в этом окружении. Попробуйте перезагрузить.
        </p>
        <p style={{ fontSize: 11, opacity: 0.4, margin: 0, maxWidth: '36ch', wordBreak: 'break-word' }}>
          {error.message}
        </p>
        <button
          onClick={this.handleReload}
          style={{
            marginTop: 8,
            padding: '10px 24px',
            borderRadius: 999,
            border: 'none',
            background: '#f5f4ef',
            color: '#0b0b0c',
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          Перезагрузить
        </button>
      </div>
    )
  }
}
