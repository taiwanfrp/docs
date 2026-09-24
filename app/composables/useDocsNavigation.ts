import type { ContentNavigationItem } from '@nuxt/content'
import { withoutTrailingSlash } from 'ufo'

// 靜態主機 (Cloudflare) 重新整理後網址會帶結尾斜線 (/foo/)，導致側邊欄無法標示目前頁面，
// 這裡忽略結尾斜線比對路徑，手動標記目前頁面
export function useDocsNavigation() {
  const navigation = inject<Ref<ContentNavigationItem[]>>('navigation')
  const route = useRoute()

  function markActive(items: ContentNavigationItem[], path: string): ContentNavigationItem[] {
    return items.map(item => item.children?.length
      ? { ...item, children: markActive(item.children, path) }
      : { ...item, active: item.path === path }
    )
  }

  return computed(() => markActive(navigation?.value || [], withoutTrailingSlash(route.path) || '/'))
}
