// Usage 列表与详情使用独立读模型；共享展示函数只依赖两者的公共字段。

import type {
  UsageAttempt,
  UsageBilling,
  UsageCost,
  UsageCostCoverage,
  UsageLatencyDetails,
  UsageListRecord,
  UsageRecordDetail,
  UsageTokenDetails,
} from '@/api'

import { isRecord } from '@/utils/object'
import { formatDuration } from './format'

// Usage 记录的规范化 view model：组件只消费这个形状。
export interface UsageViewModel {
  id: string
  requestId: string
  clientApiKeyId: string | null
  kind: string
  provider: string | null
  authenticationKind: string | null
  accountId: string | null
  accountEmail: string | null
  accountName: string | null
  route: string
  model: string | null
  requestedModel: string | null
  upstreamModel: string | null
  upstreamResponseModel: string | null
  turnStateBytes: number | null
  serviceTier: string | null
  statusCode: number | null
  clientTransport: string
  upstreamTransport: string | null
  attemptIndex: number | null
  attemptCount: number
  responseId: string | null
  upstreamRequestId: string | null
  protocol: string
  httpVersion: string | null
  clientStatusCode: number | null
  upstreamStatusCode: number | null
  websocketPool: { kind: string } | null
  imageGenerationRequested: boolean
  imageGenerationSucceeded: boolean | null
  latencyMs: number | null
  firstTokenLatencyMs: number | null
  latencyDetails: UsageLatencyDetails | null
  inputTokens: number | null
  outputTokens: number | null
  cachedTokens: number | null
  cacheWriteTokens: number | null
  reasoningTokens: number | null
  imageInputTokens: number | null
  imageOutputTokens: number | null
  message: string
  createdAt: string
  createdAtDisplay: string
  clientIp: string | null
  userAgent: string | null
  reasoningEffort: string | null
  reasoningPreset: string | null
  compact: boolean
  requestKind: string | null
  subagentKind: string | null
  tokenDetails: UsageTokenDetails
  billing: UsageBilling | null
  costs: UsageCost[]
  costCoverage: UsageCostCoverage
  firstTokenLatencyMsDisplay: string
  latencyMsDisplay: string
  logicalOutcome: string
  providerMetadata: Record<string, unknown>
  requestBody?: unknown
  responseBody?: unknown
  attempts?: UsageAttempt[]
  attemptsComplete?: boolean
}

/** 将 Usage 详情 API 记录收口为详情组件消费的形状。 */
export function normalizeUsageRecord(record: UsageRecordDetail): UsageViewModel {
  const metadata = record.metadata

  return {
    id: record.id,
    requestId: record.requestId,
    clientApiKeyId: record.clientApiKeyId,
    kind: record.kind,
    provider: record.provider,
    authenticationKind: record.authenticationKind,
    accountId: record.accountId,
    accountEmail: record.accountEmail,
    accountName: record.accountName,
    route: record.route,
    model: record.model,
    requestedModel: record.requestedModel,
    upstreamModel: record.upstreamModel,
    upstreamResponseModel: record.upstreamResponseModel,
    turnStateBytes: record.turnStateBytes,
    serviceTier: record.serviceTier,
    statusCode: record.statusCode,
    clientTransport: record.clientTransport,
    upstreamTransport: record.upstreamTransport,
    attemptIndex: record.attemptIndex,
    attemptCount: record.attemptCount,
    responseId: record.responseId,
    upstreamRequestId: record.upstreamRequestId,
    protocol: record.protocol,
    httpVersion: record.httpVersion,
    clientStatusCode: record.clientStatusCode,
    upstreamStatusCode: record.upstreamStatusCode,
    websocketPool: record.websocketPool,
    imageGenerationRequested: record.imageGenerationRequested,
    imageGenerationSucceeded: record.imageGenerationSucceeded,
    latencyMs: record.latencyMs,
    firstTokenLatencyMs: record.firstTokenLatencyMs,
    latencyDetails: record.latencyDetails,
    inputTokens: record.inputTokens,
    outputTokens: record.outputTokens,
    cachedTokens: record.cachedTokens,
    cacheWriteTokens: record.cacheWriteTokens,
    reasoningTokens: record.reasoningTokens,
    imageInputTokens: record.imageInputTokens,
    imageOutputTokens: record.imageOutputTokens,
    message: record.message,
    createdAt: record.createdAt,
    createdAtDisplay: record.createdAtDisplay,
    clientIp: record.clientIp,
    userAgent: record.userAgent,
    reasoningEffort: record.reasoningEffort,
    reasoningPreset: record.reasoningPreset,
    compact: record.compact === true,
    requestKind: record.requestKind,
    subagentKind: record.subagentKind,
    tokenDetails: record.tokenDetails,
    billing: record.billing,
    costs: record.costs,
    costCoverage: record.costCoverage,
    firstTokenLatencyMsDisplay: record.firstTokenLatencyMsDisplay,
    latencyMsDisplay: record.latencyMsDisplay,
    logicalOutcome: record.logicalOutcome,
    providerMetadata: metadata,
    requestBody: metadata.requestBody,
    responseBody: metadata.responseBody,
    attempts: record.attempts,
    attemptsComplete: record.attemptsComplete,
  }
}

export type UsageDisplayRecord = UsageListRecord

type UsageCommonRecord = UsageDisplayRecord | UsageViewModel

export function usageTransportType(transport?: string | null) {
  if (transport === 'websocket')
    return 'WS'

  if (transport === 'http_sse')
    return 'SSE'
  if (transport === 'http' || transport === 'http_json')
    return 'HTTP'
  return transport || '—'
}

export function usageTransportTypeClass(transport?: string | null) {
  const type = usageTransportType(transport)
  if (type === 'WS')
    return 'bg-cp-blue-container text-cp-blue-on-container'
  if (type === 'SSE')
    return 'bg-cp-green-container text-cp-green-on-container'
  return 'bg-cp-fill-tertiary text-cp-text-secondary'
}

export function usageAccountText(record: UsageCommonRecord) {
  return record.accountEmail || record.accountName || record.accountId || '—'
}

export function usageAuthenticationKind(record: UsageCommonRecord) {
  return typeof record.authenticationKind === 'string' ? record.authenticationKind : null
}

export function usageClientIp(record: { clientIp?: string | null }) {
  return record.clientIp || '—'
}

export function usageUserAgent(record: { userAgent?: string | null }) {
  return record.userAgent || '—'
}

export function usageReasoningEffort(record: UsageCommonRecord) {
  const reasoningEffort = record.reasoningEffort || '—'
  if (usageIsSubagent(record))
    return reasoningEffort
  return record.reasoningPreset || reasoningEffort
}

export function usageIsSubagent(record: UsageCommonRecord) {
  return Boolean(record.subagentKind)
}

export function usageIsReview(record: UsageCommonRecord) {
  return record.subagentKind === 'review'
}

export function usageIsCompact(record: UsageCommonRecord) {
  return record.compact === true
}

export function usageModelDisplay(record: UsageCommonRecord) {
  const requestedModel = record.requestedModel || ''
  const upstreamModel = record.upstreamModel || ''
  const storedModel = record.model || ''
  const primary = requestedModel || storedModel || upstreamModel || '—'
  const secondary
    = upstreamModel && upstreamModel !== primary
      ? upstreamModel
      : requestedModel && storedModel && storedModel !== requestedModel
        ? storedModel
        : ''

  const responseModel = record.upstreamResponseModel || ''
  const returned = responseModel && responseModel !== primary ? responseModel : ''
  const routes = []
  if (secondary && secondary !== returned) {
    routes.push({
      model: secondary,
      kind: 'mapped' as const,
      description: `网关映射后发送给上游的模型：${secondary}`,
    })
  }
  if (returned) {
    routes.push({
      model: returned,
      kind: 'returned' as const,
      description: returned === secondary
        ? `上游返回模型：${returned}（与网关映射后发送的模型一致）`
        : `上游返回模型：${returned}`,
    })
  }

  return { primary, secondary, routes, turnState: usageTurnState(record) }
}

export function usageTokenDetails(record: Pick<UsageCommonRecord, 'tokenDetails'>) {
  return record.tokenDetails
}

/**
 * X-Codex-Turn-State 走标准 Fernet 封装：0x80 版本字节 + 8 字节大端秒级时间戳 + 16 字节 IV
 * + AES-CBC 密文 + 32 字节 HMAC。这里只读封装体积，不解密，也不需要密钥。
 */
const FERNET_VERSION = '0x80'
/** 版本、签发时间戳、IV 与 HMAC 的固定开销。 */
const FERNET_OVERHEAD_BYTES = 1 + 8 + 16 + 32
/** AES-CBC 分组长度；密文体积只能是它的整数倍。 */
const FERNET_BLOCK_BYTES = 16

/**
 * 实测出来的正常形态表，按账号类型分两种：个人号 10 块 / 292 字符，team 号 12 块 / 332 字符。
 * 疑似降智一律在各自基线上多出恰好一块（个人号 312 字符、team 号 356 字符），
 * 所以不能拿一个阈值切两种形态。
 *
 * 判据强度：样本不多，且 PKCS7 填充下块数只能把明文框进一个 16 字节窗口，
 * 多一块只说明明文跨过了一次边界，不等于内容正好多 16 字节。上游改结构后需重新标定。
 */
const TURN_STATE_SHAPES = [
  { key: 'individual', label: '个人号', blocks: 10, chars: 292, degradedChars: 312 },
  { key: 'team', label: 'team 号', blocks: 12, chars: 332, degradedChars: 356 },
] as const

/** 上游签发的轮次状态实测约 1 小时后失效；时长只用于展示，不参与判定。 */
const TURN_STATE_TTL_MS = 60 * 60 * 1000

/**
 * normal 命中正常形态，suspect 是块数落在表外，unknown 是读不出 Fernet 结构、
 * unavailable 是已知该传输方式下上游结构性地不下发该令牌（目前特指 WebSocket），
 * 与 unknown 区分开是为了不让「没有事实」和「读到了但读不懂」混为一谈。
 */
export type UsageTurnStateStatus = 'normal' | 'suspect' | 'unknown' | 'unavailable'

export interface UsageTurnState {
  status: UsageTurnStateStatus
  label: string
  /** 命中的正常形态名称；未命中为 null。 */
  shape: string | null
  /** 密文块数；读不出 Fernet 结构为 null。 */
  blocks: number | null
  /** 解码后的密文字节数；上游未下发令牌为 null。 */
  bytes: number | null
  /** base64 字符串长度；由字节数按填充规则推算。 */
  chars: number | null
  /** PKCS7 填充下明文长度的闭区间。 */
  plaintextMinBytes: number | null
  plaintextMaxBytes: number | null
  description: string
}

/**
 * 按 Fernet 密文块数标注单次请求的降智检测状态。
 *
 * 只使用服务端已解码的体积事实，不接触令牌本体；上游未在本次响应下发令牌、
 * 或该值不是 Fernet 结构时记无法判定，不因缺少事实推断是否为降智。
 */
export function usageTurnState(
  record: Pick<UsageCommonRecord, 'turnStateBytes' | 'upstreamTransport'>,
): UsageTurnState {
  const bytes = record.turnStateBytes
  if (typeof bytes !== 'number' || !Number.isFinite(bytes) || bytes < 1) {
    // WebSocket 复用连接下，上游不保证每个回合都重新下发 turn-state 元数据帧，
    // 实测缺失是该链路的结构性限制，不是异常，需要和真正读不出数据的 unknown 区分。
    if (record.upstreamTransport === 'websocket') {
      return turnStateUnavailable(
        '本次请求经 WebSocket 传输；上游在该链路下不保证每个回合都重新下发 turn-state 元数据，没有事实不代表异常，仅代表该场景下无法用体积判断',
      )
    }
    return turnStateUnknown('本次响应未观测到上游 turn-state 令牌，无法从体积判断是否降智')
  }

  const normalized = Math.trunc(bytes)
  const chars = Math.ceil(normalized / 3) * 4
  const cipherBytes = normalized - FERNET_OVERHEAD_BYTES
  // 空明文也要占满一个填充块，所以密文至少一块，且必然与分组对齐。
  if (cipherBytes < FERNET_BLOCK_BYTES || cipherBytes % FERNET_BLOCK_BYTES !== 0) {
    return turnStateUnknown(
      `本次 turn-state 解码后 ${normalized} 字节（base64 ${chars} 字符），不是 Fernet 结构，无法判定`,
    )
  }

  const blocks = cipherBytes / FERNET_BLOCK_BYTES
  const plaintextMinBytes = cipherBytes - FERNET_BLOCK_BYTES
  const plaintextMaxBytes = cipherBytes - 1
  const shape = TURN_STATE_SHAPES.find(candidate => candidate.blocks === blocks)
  if (!shape) {
    const normalShapes = TURN_STATE_SHAPES
      .map(candidate => `${candidate.label} ${candidate.blocks} 块 / ${candidate.chars} 字符`)
      .join('、')
    return {
      status: 'suspect',
      label: '疑似降智',
      shape: null,
      blocks,
      bytes: normalized,
      chars,
      plaintextMinBytes,
      plaintextMaxBytes,
      description: `密文 ${blocks} 块（${chars} 字符），不在已知的正常形态里（${normalShapes}）；降智的值在各自基线上恰好多一块，疑似降智请求。块数只能把明文框进 16 字节窗口，这是疑似判据而非确证`,
    }
  }

  return {
    status: 'normal',
    label: '正常',
    shape: shape.label,
    blocks,
    bytes: normalized,
    chars,
    plaintextMinBytes,
    plaintextMaxBytes,
    description: `密文 ${blocks} 块，命中正常形态：${shape.label}（${chars} 字符）`,
  }
}

function turnStateUnknown(description: string): UsageTurnState {
  return {
    status: 'unknown',
    label: '无法判定',
    shape: null,
    blocks: null,
    bytes: null,
    chars: null,
    plaintextMinBytes: null,
    plaintextMaxBytes: null,
    description,
  }
}

function turnStateUnavailable(description: string): UsageTurnState {
  return {
    status: 'unavailable',
    label: 'WS 不采集',
    shape: null,
    blocks: null,
    bytes: null,
    chars: null,
    plaintextMinBytes: null,
    plaintextMaxBytes: null,
    description,
  }
}

/**
 * 详情展示所需的 turn-state 事实：形态判定加签发与有效期。
 *
 * 版本与签发时刻取 Provider 观测 JSON；时间戳是 Fernet 自带的签发时刻，
 * 有效期按实测的约 1 小时推算，都不是上游声明的字段。
 */
export function usageTurnStateDetail(
  record: Pick<UsageCommonRecord, 'turnStateBytes' | 'upstreamTransport'> & { providerMetadata?: Record<string, unknown> },
) {
  const state = usageTurnState(record)
  const metadata = isRecord(record.providerMetadata) ? record.providerMetadata : {}
  const version = typeof metadata.turnStateVersion === 'string' ? metadata.turnStateVersion : null
  const issuedAt = typeof metadata.turnStateIssuedAt === 'string' ? metadata.turnStateIssuedAt : null
  const issuedAtMs = issuedAt === null ? null : Date.parse(issuedAt)
  // 版本字节不是 0x80 就不是 Fernet 封装，块数判定失去前提；体积事实照常保留。
  const verdict: UsageTurnState = version !== null && version !== FERNET_VERSION
    ? {
        ...state,
        status: 'unknown',
        label: '无法判定',
        shape: null,
        description: `令牌版本 ${version} 不是 Fernet 的 0x80，无法判定`,
      }
    : state

  return {
    ...verdict,
    version,
    issuedAt,
    expiresAt: issuedAtMs === null || !Number.isFinite(issuedAtMs)
      ? null
      : new Date(issuedAtMs + TURN_STATE_TTL_MS).toISOString(),
    ttlHours: TURN_STATE_TTL_MS / (60 * 60 * 1000),
    normalShapes: TURN_STATE_SHAPES.map(candidate => ({
      label: candidate.label,
      blocks: candidate.blocks,
      chars: candidate.chars,
      degradedChars: candidate.degradedChars,
    })),
  }
}

export function usageLatencyDetails(record: Pick<UsageCommonRecord, 'latencyDetails' | 'firstTokenLatencyMs' | 'latencyMs'>) {
  const latencyDetails = record.latencyDetails
  const firstTokenMs = durationValue(
    record.firstTokenLatencyMs ?? latencyDetails?.firstTokenMs,
  )
  const firstEventMs = durationValue(latencyDetails?.firstEventMs)
  const totalMs = durationValue(record.latencyMs)
  const firstReasoningMs = durationValue(latencyDetails?.firstReasoningMs)
  const firstTextMs = durationValue(latencyDetails?.firstTextMs)
  const breakdownItems = []

  if (firstTokenMs !== null && totalMs !== null && firstTokenMs <= totalMs) {
    breakdownItems.push({ label: '首字等待', value: formatDuration(firstTokenMs) })

    if (firstTextMs !== null && firstTextMs >= firstTokenMs && firstTextMs <= totalMs) {
      const beforeTextMs = firstTextMs - firstTokenMs
      if (beforeTextMs > 0) {
        breakdownItems.push({
          label: firstReasoningMs === firstTokenMs ? '推理到正文' : '首个输出到正文',
          value: formatDuration(beforeTextMs),
        })
      }
      breakdownItems.push({ label: '正文生成', value: formatDuration(totalMs - firstTextMs) })
    }
    else {
      breakdownItems.push({
        label: '首个输出后完成',
        value: formatDuration(totalMs - firstTokenMs),
      })
    }
  }

  const transportItems = [
    { label: '准入判定', value: durationValue(latencyDetails?.admissionDecisionMs) },
    { label: '账号选择等待', value: durationValue(latencyDetails?.accountSelectionWaitMs) },
    {
      label: '传输决策等待',
      value: durationValue(latencyDetails?.transportDecisionWaitMs),
    },
    { label: 'WebSocket 连接', value: durationValue(latencyDetails?.wsConnectMs) },
    { label: '上游响应头', value: durationValue(latencyDetails?.upstreamHeadersMs) },
    { label: '首个上游事件', value: firstEventMs },
    { label: '上游处理', value: durationValue(latencyDetails?.openaiProcessingMs) },
  ]
    .filter(item => item.value !== null)
    .map(item => ({ ...item, value: formatDuration(item.value) }))

  if (
    latencyDetails?.capacityUsedSlots != null
    && latencyDetails.capacityTotalSlots != null
  ) {
    transportItems.push({
      label: '账号槽位快照',
      value: `${latencyDetails.capacityUsedSlots} / ${latencyDetails.capacityTotalSlots}`,
    })
  }

  return {
    // SSE 可能先收到生命周期事件而没有文本或推理增量；这不是首字，须保留原始语义。
    firstOutputLabel: firstTokenMs === null && firstEventMs !== null ? '首事件' : '首字',
    firstOutputDisplay: formatDuration(firstTokenMs ?? firstEventMs),
    totalDisplay: formatDuration(totalMs),
    breakdownItems,
    transportItems,
  }
}

export function usageBilling(record: Pick<UsageCommonRecord, 'billing'>) {
  return record.billing
}

export function usageBillingText(record: Pick<UsageCommonRecord, 'billing'>) {
  return usageBilling(record)?.totalAmountDisplay || '—'
}

export function visibleRequestText(record: UsageViewModel) {
  const body = record.requestBody
  if (!body)
    return ''

  return extractInputText(body) || JSON.stringify(body, null, 2)
}

export function visibleResponseText(record: UsageViewModel) {
  const body = record.responseBody
  if (!body)
    return ''

  if (typeof body === 'string')
    return body

  return stringProperty(asRecord(body), 'output_text') || extractOutputText(body) || JSON.stringify(body, null, 2)
}

function durationValue(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : null
}

function extractInputText(body: unknown) {
  const input = property(asRecord(body), 'input')
  if (typeof input === 'string')
    return input

  if (!Array.isArray(input))
    return ''

  return input
    .flatMap((item) => {
      const content = property(asRecord(item), 'content')
      if (typeof content === 'string')
        return [content]

      if (!Array.isArray(content))
        return []

      return content.flatMap((part) => {
        const value = asRecord(part)
        const text = stringProperty(value, 'text')
        return value?.type === 'input_text' && text ? [text] : []
      })
    })
    .filter(Boolean)
    .join('\n')
}

function extractOutputText(body: unknown) {
  const output = property(asRecord(body), 'output')
  if (!Array.isArray(output))
    return ''

  return output
    .flatMap((item) => {
      const content = property(asRecord(item), 'content')
      if (!Array.isArray(content))
        return []
      return content.flatMap((part) => {
        const text = stringProperty(asRecord(part), 'text')
        return text ? [text] : []
      })
    })
    .filter(Boolean)
    .join('\n')
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return isRecord(value) ? value : undefined
}

function property(value: Record<string, unknown> | undefined, key: string) {
  return value?.[key]
}

function stringProperty(value: Record<string, unknown> | undefined, key: string) {
  const valueAtKey = property(value, key)
  return typeof valueAtKey === 'string' ? valueAtKey : undefined
}
