<script setup lang="ts">
import { computed } from 'vue'
import { useNav } from '@slidev/client'
const nav = useNav()
const clock = computed(() => (nav.currentSlideRoute.value?.meta?.slide?.frontmatter as any)?.clock as string | undefined)
</script>

<template>
  <div v-if="clock" class="clock-badge">{{ clock }}</div>
</template>
