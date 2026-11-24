<script setup lang="ts">
const { footer } = useAppConfig()
</script>

<template>
  <UFooter>
    <template #left>
      {{ footer.credits }}
    </template>

    <template v-if="footer?.navigation">
      <UButton
        v-for="(link, index) of footer.navigation"
        :key="index"
        v-bind="{ color: 'neutral', variant: 'link', size: 'lg', ...link }"
      />
    </template>

    <template #right>
      <UColorModeButton v-if="footer?.colorMode" />

      <template v-if="footer?.links">
        <UButton
          v-for="(link, index) of footer?.links"
          :key="index"
          v-bind="{ color: 'neutral', variant: 'ghost', ...link }"
        />
      </template>

      <UButton
        icon="i-lucide-braces"
        to="/api-reference"
        aria-label="API 文件"
        color="neutral"
        variant="ghost"
        class="lg:hidden"
      />
    </template>
  </UFooter>
</template>
