<script setup lang="ts">
import type { UsageDisplayRecord } from '../utils/records'
import { CornerDownRight, Minus, ShieldCheck, TriangleAlert } from '@lucide/vue'

import { computed } from 'vue'
import { usageModelDisplay } from '../utils/records'

const props = defineProps<{
  record: UsageDisplayRecord
}>()

const modelDisplay = computed(() => usageModelDisplay(props.record))

// 每条请求都标注降智检测判定：正常、疑似降智或无法判定。
const turnStateClass = computed(() => {
  if (modelDisplay.value.turnState.status === 'suspect')
    return 'text-cp-warning-text'
  if (modelDisplay.value.turnState.status === 'normal')
    return 'text-cp-success-text'
  return 'text-cp-text-quaternary'
})

const turnStateIcon = computed(() => {
  if (modelDisplay.value.turnState.status === 'suspect')
    return TriangleAlert
  if (modelDisplay.value.turnState.status === 'normal')
    return ShieldCheck
  return Minus
})
</script>

<template>
  <div class="inline-grid max-w-full gap-1">
    <code
      class="block max-w-full truncate font-mono text-cp-sm leading-none font-heavy text-cp-text"
      :title="`请求模型：${modelDisplay.primary}`"
    >
      {{ modelDisplay.primary }}
    </code>
    <div
      v-for="route in modelDisplay.routes"
      :key="route.kind"
      class="flex min-w-0 max-w-full items-center gap-1.25 text-cp-text-secondary"
      :title="route.description"
    >
      <CornerDownRight
        class="size-3.25 shrink-0"
        :class="route.kind === 'returned' ? 'text-cp-orange-text' : 'text-cp-blue-text'"
        stroke-width="2.4"
        aria-hidden="true"
      />
      <code class="block truncate font-mono text-cp-xs leading-none font-bold">
        {{ route.model }}
      </code>
    </div>
    <span
      class="inline-flex max-w-full items-center gap-1 text-cp-xs leading-none font-bold"
      :class="turnStateClass"
      :title="modelDisplay.turnState.description"
    >
      <component
        :is="turnStateIcon"
        class="size-3.25 shrink-0"
        stroke-width="2.4"
        aria-hidden="true"
      />
      <span class="truncate">{{ modelDisplay.turnState.label }}</span>
    </span>
  </div>
</template>
