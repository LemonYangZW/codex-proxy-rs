<script setup lang="ts">
import { shallowRef } from 'vue'
import BaseCard from '@/components/base/BaseCard.vue'
import BaseConfirmModal from '@/components/base/BaseConfirmModal.vue'
import BaseSwitch from '@/components/base/BaseSwitch.vue'

const props = defineProps<{ disabled: boolean }>()
const enabled = defineModel<boolean>({ required: true })
const confirming = shallowRef(false)
function toggle() {
  if (props.disabled)
    return
  if (!enabled.value)
    confirming.value = true
  else enabled.value = false
}
function confirm() {
  enabled.value = true
  confirming.value = false
}
</script>

<template>
  <BaseCard title="被动捕获 State">
    <div class="grid gap-3">
      <BaseSwitch :model-value="enabled" label="开启被动捕获" show-label :disabled="disabled" @click.capture.prevent="toggle" />
      <p class="m-0 text-cp-sm text-cp-text-secondary">
        默认关闭，与「State 重写」互相独立、不共用开关，需要账号也单独开启。不主动发探针，只从真实业务响应里顺手观测未降智的 State，在有效期内复用给同账号同模型的后续请求；没有可用 State 时按原样放行，不会拒绝或阻塞业务请求。判定标准与「State 模型范围」清单与「State 重写」共用。
      </p>
      <p class="m-0 text-cp-sm text-cp-warning-text">
        本质仍是跨轮次复用 State，与官方约定存在已知偏离，因此同样需要单独确认风险。确认后还需保存设置才会生效。
      </p>
    </div>
  </BaseCard>
  <BaseConfirmModal v-model="confirming" title="确认开启被动捕获" confirm-text="我已了解风险，开启" @confirm="confirm">
    此功能会复用非官方合同约定的跨轮次 State，可能导致账户异常。是否确认承担风险并开启？
  </BaseConfirmModal>
</template>
