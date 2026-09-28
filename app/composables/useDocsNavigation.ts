import type { ContentNavigationItem } from '@nuxt/content'
import { withoutTrailingSlash } from 'ufo'

// 靜態主機 (Cloudflare) 重新整理後網址會帶結尾斜線 (/foo/)，導致側邊欄無法標示目前頁面，
// 這裡忽略結尾斜線比對路徑，手動標記目前頁面
export function useDocsNavigation() {
  const navigation = inject<Ref<ContentNavigationItem[]>>('navigation')
  const route = useRoute()

  function containsPath(item: ContentNavigationItem, path: string): boolean {
    return item.children?.length ? item.children.some(child => containsPath(child, path)) : item.path === path
  }

  // 第二層以下的群組只在包含目前頁面時預設展開；
  // Nuxt UI 對所有群組標題都套用 font-semibold，第二層以下改回一般字重，與同層的頁面一致
  function markActive(items: ContentNavigationItem[], path: string, level = 0): ContentNavigationItem[] {
    return items.map(item => item.children?.length
      ? {
          ...item,
          children: markActive(item.children, path, level + 1),
          ...(level > 0 && { defaultOpen: containsPath(item, path), ui: { trigger: 'font-normal' } })
        }
      : { ...item, active: item.path === path }
    )
  }

  return computed(() => markActive(navigation?.value || [], withoutTrailingSlash(route.path) || '/'))
}
