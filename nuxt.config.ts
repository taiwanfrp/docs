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

// API 文件頁不是 Nuxt Content 頁面，取頁面與規格檔中較新的 git commit 時間作為 lastmod
const apiReferenceLastmod = ['app/pages/api-reference.vue', 'public/openapi.json']
  .map(file => getGitLastmod(resolve(import.meta.dirname, file)))
  .filter((date): date is string => !!date)
  .sort((a, b) => Date.parse(b) - Date.parse(a))[0]

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
    // 部署到 Cloudflare Pages 後使用綁定名稱為 taiwanfrp_docs 的 D1 資料庫
    // 開發 (nuxi dev) 與預先渲染時一律使用本機 SQLite，不受此設定影響
    database: {
      type: 'd1',
      bindingName: 'taiwanfrp_docs'
    },
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

  runtimeConfig: {
    public: {
      // API 文件頁讀取的 OpenAPI 規格，可用 NUXT_PUBLIC_OPENAPI_URL 改成遠端網址
      openapiUrl: '/openapi.json'
    }
  },

  routeRules: {
    '/api-reference': apiReferenceLastmod ? { sitemap: { lastmod: apiReferenceLastmod } } : {}
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
      crawlLinks: true,
      // 輸出成 foo.html 而不是 foo/index.html，Cloudflare Pages 才會以不帶結尾斜線的網址直接回應，
      // 與 sitemap、站內連結一致 (foo/ 會轉址到 foo)
      autoSubfolderIndex: false
    },
    // 部署到 Cloudflare Pages 時使用原生 Node.js 相容層，需在 Pages 設定中啟用 nodejs_compat 相容性旗標
    cloudflare: {
      nodeCompat: true
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
