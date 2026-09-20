export default defineAppConfig({
  ui: {
    colors: {
      primary: 'green',
      neutral: 'slate'
    },
    footer: {
      slots: {
        root: 'border-t border-default',
        left: 'text-sm text-muted'
      }
    }
  },
  seo: {
    siteName: 'TaiwanFRP 文件'
  },
  header: {
    title: 'TaiwanFRP',
    to: '/',
    logo: {
      alt: 'TaiwanFRP',
      light: '',
      dark: ''
    },
    search: true,
    colorMode: true,
    links: [{
      'icon': 'i-simple-icons-discord',
      'to': 'https://discord.gg/ueGFVVHp85',
      'target': '_blank',
      'aria-label': 'Discord'
    }, {
      'icon': 'i-simple-icons-github',
      'to': 'https://github.com/taiwanfrp',
      'target': '_blank',
      'aria-label': 'GitHub'
    }]
  },
  footer: {
    credits: `© ${new Date().getFullYear()} TaiwanFRP`,
    colorMode: false,
    links: [{
      'icon': 'i-lucide-globe',
      'to': 'https://taiwanfrp.me',
      'target': '_blank',
      'aria-label': 'TaiwanFRP 官方網站'
    }, {
      'icon': 'i-simple-icons-discord',
      'to': 'https://discord.gg/ueGFVVHp85',
      'target': '_blank',
      'aria-label': 'TaiwanFRP Discord'
    }, {
      'icon': 'i-simple-icons-github',
      'to': 'https://github.com/taiwanfrp',
      'target': '_blank',
      'aria-label': 'TaiwanFRP GitHub'
    }]
  },
  toc: {
    title: '目錄',
    bottom: {
      title: '社群',
      edit: 'https://github.com/taiwanfrp/docs/edit/main/content',
      links: [{
        icon: 'i-simple-icons-discord',
        label: '加入 Discord',
        to: 'https://discord.gg/ueGFVVHp85',
        target: '_blank'
      }, {
        icon: 'i-simple-icons-github',
        label: '在 GitHub 上追蹤',
        to: 'https://github.com/taiwanfrp',
        target: '_blank'
      }]
    }
  }
})
