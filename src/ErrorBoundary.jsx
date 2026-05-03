import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div
          className="min-h-screen p-8 font-body text-[var(--color-white)]"
          style={{ background: 'var(--color-canvas, #1a1528)' }}
        >
          <p className="m-0 font-headline text-lg uppercase text-[var(--color-yellow)]">Something broke</p>
          <pre className="mt-4 max-w-full overflow-auto rounded border border-[var(--color-lavender)] bg-[var(--color-black)] p-4 text-[13px] text-[var(--color-lavender)]">
            {String(this.state.error?.message ?? this.state.error)}
          </pre>
        </div>
      )
    }
    return this.props.children
  }
}
