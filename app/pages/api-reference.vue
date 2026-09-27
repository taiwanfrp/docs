<script setup lang="ts">
import 'swagger-ui-dist/swagger-ui.css'

const title = 'API 文件'
const description = 'TaiwanFRP API 參考文件，列出各端點的參數、請求內容、回應格式與錯誤訊息。'

useSeoMeta({
  title,
  ogTitle: title,
  description,
  ogDescription: description
})

defineOgImage('DocsTakumi', { title, description, headline: 'API' })

// Swagger UI 以 html.dark-mode 切換深色樣式，跟隨網站的色彩模式
const colorMode = useColorMode()
useHead({
  htmlAttrs: {
    class: computed(() => colorMode.value === 'dark' ? 'dark-mode' : '')
  }
})

// NUXT_PUBLIC_OPENAPI_URL 設為空值時會覆蓋成空字串，退回 public/openapi.json
const openapiUrl = useRuntimeConfig().public.openapiUrl || '/openapi.json'
const swagger = useTemplateRef('swagger')

onMounted(async () => {
  const { default: SwaggerUI } = await import('swagger-ui-dist/swagger-ui-es-bundle.js')
  SwaggerUI({
    domNode: swagger.value,
    url: openapiUrl,
    deepLinking: true,
    // 後端尚未開放文件站跨來源呼叫與驗證，先停用 Try it out
    supportedSubmitMethods: []
  })
})
</script>

<template>
  <UContainer>
    <UPage>
      <UPageHeader
        :title="title"
        :description="description"
        headline="API"
      >
        <template #links>
          <UButton
            label="openapi.json"
            icon="i-lucide-download"
            color="neutral"
            variant="outline"
            :to="openapiUrl"
            target="_blank"
            external
          />
        </template>
      </UPageHeader>

      <UPageBody>
        <div
          ref="swagger"
          data-swagger
        />
      </UPageBody>
    </UPage>
  </UContainer>
</template>

<style scoped>
/* 標題與說明已由 UPageHeader 顯示，隱藏 Swagger UI 內建的資訊區塊 */
[data-swagger] :deep(.information-container) {
  display: none;
}

/* 沿用網站背景色，不使用 Swagger UI 深色模式的固定底色 */
[data-swagger] :deep(.swagger-ui) {
  background: transparent;
}
</style>

<style>
/* Swagger UI 深色模式會把 html 背景改成 #1c2022，改回網站背景色 */
html.dark-mode {
  background: var(--ui-bg);
}
</style>
