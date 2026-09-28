<script setup lang="ts">
import { withoutTrailingSlash } from 'ufo'

const navigation = useDocsNavigation()
const route = useRoute()

// UContentNavigation 只在建立時決定群組的展開狀態，換頁時不會自動展開目前頁面所在的群組
// 進入不同資料夾的頁面時重新建立側邊欄，讓目前頁面所在的群組展開
const navigationKey = computed(() => withoutTrailingSlash(route.path).split('/').slice(0, -1).join('/'))
</script>

<template>
  <UContainer>
    <UPage>
      <template #left>
        <UPageAside>
          <UContentNavigation
            :key="navigationKey"
            highlight
            :navigation="navigation"
          />
        </UPageAside>
      </template>

      <slot />
    </UPage>
  </UContainer>
</template>
