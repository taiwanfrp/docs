import { readdirSync } from 'node:fs'
import { resolve } from 'node:path'

// 依 content/ 目錄產生所有 /raw/*.md 路徑，供靜態產生 (nuxi generate) 時預先渲染
function getRawMarkdownRoutes() {
  const files = readdirSync(resolve(import.meta.dirname, 'content'), { recursive: true, encoding: 'utf8' })
  return files
    .filter(file => file.endsWith('.md'))
    .map((file) => {
      const segments = file.replace(/\\/g, '/').replace(/\.md$/, '').split('/').map(segment => segment.replace(/^\d+\./, ''))
      if (segments.at(-1) === 'index') {
        segments.pop()
      }
      return `/raw/${segments.join('/') || 'index'}.md`
    })
}

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/ui',
    '@nuxt/content',
    'nuxt-og-image',
    'nuxt-llms',
    '@nuxtjs/mcp-toolkit'
  ],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  site: {
    url: 'https://docs.taiwanfrp.me'
  },

  content: {
    build: {
      markdown: {
        toc: {
          searchDepth: 1
        }
      }
    },
    experimental: {
      sqliteConnector: 'native'
    }
  },

  experimental: {
    asyncContext: true
  },

  compatibilityDate: '2026-06-30',

  nitro: {
    prerender: {
      routes: [
        '/',
        ...getRawMarkdownRoutes()
      ],
      crawlLinks: true
    }
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },

  llms: {
    domain: 'https://docs.taiwanfrp.me/',
    title: 'TaiwanFRP 文件',
    description: 'TaiwanFRP 是在台灣、亞洲及其他地區提供免費 FRP 內網穿透服務的專案，這裡是官方文件站。',
    full: {
      title: 'TaiwanFRP 文件 - 說明文件',
      description: '這裡是 TaiwanFRP 的說明文件，涵蓋服務介紹、安裝與使用說明。'
    },
    sections: [
      {
        title: 'Getting Started',
        contentCollection: 'docs',
        contentFilters: [
          { field: 'path', operator: 'LIKE', value: '/getting-started%' }
        ]
      },
      {
        title: 'Essentials',
        contentCollection: 'docs',
        contentFilters: [
          { field: 'path', operator: 'LIKE', value: '/essentials%' }
        ]
      }
    ]
  },

  mcp: {
    name: 'TaiwanFRP Docs'
  },

  ogImage: {
    zeroRuntime: true
  }
})
