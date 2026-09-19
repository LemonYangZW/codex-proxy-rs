<script setup lang="ts">
import { computed } from 'vue'

import BaseCard from '@/components/base/BaseCard.vue'
import BaseSegmented from '@/components/base/BaseSegmented.vue'

defineProps<{ disabled: boolean }>()
const preferWebsocket = defineModel<boolean>({ required: true })
const mode = computed({
  get: () => preferWebsocket.value ? 'prefer_websocket' : 'follow_client',
  set: (value: string) => { preferWebsocket.value = value === 'prefer_websocket' },
})
const options = [
  { label: '跟随客户端', value: 'follow_client' },
  { label: 'WS 优先', value: 'prefer_websocket' },
]
</script>

<template>
  <BaseCard title="OpenAI 上游传输" description="选择网关连接 OpenAI 上游时的默认传输策略">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
      <div class="max-w-3xl space-y-2 text-cp-sm text-cp-text-secondary">
        <p class="m-0">
          跟随客户端：HTTP 请求使用 HTTP/SSE，WebSocket 请求优先使用 WS。
        </p>
        <p class="m-0">
          WS 优先：普通 HTTP 请求也优先尝试上游 WS，适用于上游支持 Responses WebSocket 的场景。
        </p>
      </div>
      <BaseSegmented v-model="mode" label="OpenAI 上游传输策略" :options="options" :disabled="disabled" class="shrink-0 self-end sm:self-start" />
    </div>
    <p class="mb-0 mt-3 text-cp-xs text-cp-text-tertiary">
      保存后用于后续请求。客户端显式选择、账号传输限制与续写要求仍然生效。
    </p>
  </BaseCard>
</template>
