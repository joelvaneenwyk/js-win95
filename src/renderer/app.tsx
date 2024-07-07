/**
 * The top-level class controlling the whole app. This is *not* a React component,
 * but it does eventually render all components.
 *
 * @class App
 */
import { createRoot } from 'react-dom/client'

// @ts-expect-error - This is implicitly used in `App.setup` below.
import { React } from 'react'

export class App {
  /**
   * Initial setup call, loading Monaco and kicking off the React
   * render process.
   */
  public async setup(): Promise<void | Element> {
    const { Emulator } = await import('./emulator.js')

    const className = `${process.platform}`
    const app = (
      <div className={className}>
        <Emulator />
      </div>
    )

    const container = document.getElementById('app')
    const root = createRoot(container!)
    return root.render(app)
  }
}

;(window as any)['win95'] = (window as any)['win95'] || {
  app: new App()
}
;(window as any)['win95'].app.setup()
