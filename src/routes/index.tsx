import loadable from 'loadable-components'
import * as React from 'react'

// @ts-ignore
export const Counter: any = loadable(() => import('src/components/pages/counter'))
export const NotFoundRedirectToRoot = () => (
  <div style={{ marginLeft: 'auto' }}>
    <h1>404 Page Not Found</h1>
  </div>
)
