import { execFileSync } from 'node:child_process'
import { readdirSync, statSync } from 'node:fs'
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

// 取得檔案最後一次 git commit 的時間，供 sitemap 的 lastmod 使用
// 尚未 commit 的新檔案改用檔案修改時間；無法執行 git 時回傳 undefined
function getGitLastmod(file: string) {
  try {
    const date = execFileSync('git', ['log', '-1', '--format=%cI', '--', file], { encoding: 'utf8' }).trim()
    return date || statSync(file).mtime.toISOString()
  } catch {
    return undefined
  }
}

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/ui',
    // robots / sitemap 需在 @nuxt/content 之前載入，才能掛上 content 解析 hook
    '@nuxtjs/robots',
    '@nuxtjs/sitemap',
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
    url: 'https://docs.taiwanfrp.me',
    name: 'TaiwanFRP 說明文件'
  },

  content: {
    build: {
      markdown: {
        toc: {
          searchDepth: 2
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

  hooks: {
    // 以 git 最後 commit 時間作為 sitemap lastmod，frontmatter 有設定 sitemap.lastmod 時以其為準
    'content:file:afterParse'({ file, content }) {
      if (!file.path.endsWith('.md') || content.sitemap === false) {
        return
      }
      const sitemap = (typeof content.sitemap === 'object' && content.sitemap ? content.sitemap : {}) as Record<string, unknown>
      if (sitemap.lastmod) {
        return
      }
      const lastmod = getGitLastmod(resolve(import.meta.dirname, file.path))
      if (lastmod) {
        content.sitemap = { ...sitemap, lastmod }
      }
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

  // 靜態產生 (nuxi generate) 時 IPX 預先渲染圖片會卡住，直接使用 public/ 中的原始圖片
  image: {
    provider: 'none'
  },

  llms: {
    domain: 'https://docs.taiwanfrp.me/',
    title: 'TaiwanFRP 說明文件',
    description: 'TaiwanFRP 提供免費的 FRP 內網穿透服務，服務範圍涵蓋台灣、亞洲及其他地區。即使沒有公網 IP，也能輕鬆讓外部網路存取你架設在家中或內網的服務，例如網站、遊戲伺服器或遠端桌面。',
    full: {
      title: 'TaiwanFRP 說明文件',
      description: 'TaiwanFRP 官方說明文件，提供免費 FRP 內網穿透服務的介紹、安裝與使用教學。'
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
  },

  // sitemap 由 content/ 的 docs collection 產生，/raw/*.md 僅供 LLM 使用，不列入
  sitemap: {
    exclude: ['/raw/**']
  }
})
