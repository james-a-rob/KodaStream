import React from 'react'
import { DocsThemeConfig } from 'nextra-theme-docs'

const config: DocsThemeConfig = {
  useNextSeoProps() {
    return {
      titleTemplate: '%s – Air'
    }
  },
  logo: <div style={{ fontWeight: "700", letterSpacing: "1px", display: "flex", fontSize: "15px" }}><img style={{ width: "24px", marginRight: "4px" }} src="/logo.png" />AIR Live Streaming</div>,
  project: {
    link: 'https://github.com/james-a-rob/air',
  },
  docsRepositoryBase: 'https://github.com/james-a-rob/air/website',
  footer: {
    text: 'Air Documentation',
  },
}

export default config
