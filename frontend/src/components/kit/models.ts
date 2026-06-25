// Demo model dataset for the kissopen dashboard demo (OpenRouter-style
// fields), ported from the kit's models-data.js. Static demo data only.

export interface KitProviderRow {
  name: string
  ctx: string
  maxOut: string
  din: string
  dout: string
  lat: string
  tp: string
  up: number
}

export interface KitModel {
  name: string
  provider: string
  providerInitial: string
  org: string
  series: string
  cat: 'frontier' | 'open' | 'reasoning'
  modalities: string[]
  categories: string[]
  description: string
  context: string
  ctxNum: number
  priceIn: string
  priceOut: string
  priceInNum: number
  tags: string[]
  status: 'operational' | 'new' | 'degraded'
  tokensWeek: string
  trend: string
  trendDir: 'up' | 'down'
  latency: string
  throughput: string
  providersCount: number
  providers: KitProviderRow[]
}

export const KIT_MODELS: KitModel[] = [
  {
    name: 'Claude Opus', provider: 'anthropic/claude-opus', providerInitial: 'A', org: 'Anthropic',
    series: 'Claude', cat: 'frontier', modalities: ['Text', 'Image'], categories: ['Programming', 'Reasoning'],
    description: 'Frontier reasoning, vision and long context. Best-in-class for hard problems, agentic coding and tool use.',
    context: '200K', ctxNum: 200000, priceIn: '$3.00', priceOut: '$15.00', priceInNum: 3,
    tags: ['Vision', 'Tools'], status: 'operational', tokensWeek: '42.1B', trend: '+18%', trendDir: 'up',
    latency: '0.8s', throughput: '62 tps', providersCount: 3,
    providers: [
      { name: 'Anthropic', ctx: '200K', maxOut: '32K', din: '$3.00', dout: '$15.00', lat: '0.82s', tp: '61 tps', up: 99.98 },
      { name: 'Amazon Bedrock', ctx: '200K', maxOut: '32K', din: '$3.00', dout: '$15.00', lat: '0.91s', tp: '58 tps', up: 99.94 },
      { name: 'Google Vertex', ctx: '200K', maxOut: '16K', din: '$3.20', dout: '$15.00', lat: '0.97s', tp: '55 tps', up: 99.90 },
    ],
  },
  {
    name: 'GPT-5', provider: 'openai/gpt-5', providerInitial: 'O', org: 'OpenAI',
    series: 'GPT', cat: 'frontier', modalities: ['Text', 'Image'], categories: ['Programming', 'Marketing'],
    description: 'Broad general intelligence with standout coding, tool calling and instruction following.',
    context: '256K', ctxNum: 256000, priceIn: '$2.50', priceOut: '$10.00', priceInNum: 2.5,
    tags: ['Vision', 'Tools'], status: 'new', tokensWeek: '60.4B', trend: '+92%', trendDir: 'up',
    latency: '0.6s', throughput: '78 tps', providersCount: 2,
    providers: [
      { name: 'OpenAI', ctx: '256K', maxOut: '64K', din: '$2.50', dout: '$10.00', lat: '0.61s', tp: '78 tps', up: 99.97 },
      { name: 'Azure', ctx: '256K', maxOut: '64K', din: '$2.50', dout: '$10.00', lat: '0.68s', tp: '72 tps', up: 99.95 },
    ],
  },
  {
    name: 'Gemini 2.5 Pro', provider: 'google/gemini-2.5-pro', providerInitial: 'G', org: 'Google',
    series: 'Gemini', cat: 'frontier', modalities: ['Text', 'Image', 'Audio'], categories: ['Technology', 'Reasoning'],
    description: 'Million-token context with fast multimodal understanding across text, image and audio.',
    context: '1M', ctxNum: 1000000, priceIn: '$1.25', priceOut: '$5.00', priceInNum: 1.25,
    tags: ['Vision', 'Audio'], status: 'operational', tokensWeek: '38.0B', trend: '-28%', trendDir: 'down',
    latency: '0.7s', throughput: '70 tps', providersCount: 2,
    providers: [
      { name: 'Google AI Studio', ctx: '1M', maxOut: '65K', din: '$1.25', dout: '$5.00', lat: '0.70s', tp: '70 tps', up: 99.96 },
      { name: 'Google Vertex', ctx: '1M', maxOut: '65K', din: '$1.25', dout: '$5.00', lat: '0.74s', tp: '67 tps', up: 99.93 },
    ],
  },
  {
    name: 'Llama 4 70B', provider: 'meta/llama-4-70b', providerInitial: 'M', org: 'Meta',
    series: 'Llama', cat: 'open', modalities: ['Text'], categories: ['Programming', 'Open'],
    description: 'Open-weight workhorse — excellent price-to-performance for scaled production workloads.',
    context: '128K', ctxNum: 128000, priceIn: '$0.30', priceOut: '$0.40', priceInNum: 0.3,
    tags: ['Open'], status: 'operational', tokensWeek: '55.2B', trend: '+12%', trendDir: 'up',
    latency: '0.4s', throughput: '120 tps', providersCount: 4,
    providers: [
      { name: 'Together', ctx: '128K', maxOut: '16K', din: '$0.30', dout: '$0.40', lat: '0.42s', tp: '120 tps', up: 99.92 },
      { name: 'DeepInfra', ctx: '128K', maxOut: '16K', din: '$0.28', dout: '$0.38', lat: '0.39s', tp: '131 tps', up: 99.88 },
      { name: 'Fireworks', ctx: '128K', maxOut: '16K', din: '$0.32', dout: '$0.42', lat: '0.45s', tp: '115 tps', up: 99.90 },
      { name: 'Groq', ctx: '128K', maxOut: '8K', din: '$0.34', dout: '$0.44', lat: '0.21s', tp: '240 tps', up: 99.85 },
    ],
  },
  {
    name: 'Mistral Large', provider: 'mistral/large', providerInitial: 'M', org: 'Mistral',
    series: 'Mistral', cat: 'open', modalities: ['Text'], categories: ['Marketing', 'Technology'],
    description: 'Efficient European model with strong multilingual support and reliable JSON modes.',
    context: '128K', ctxNum: 128000, priceIn: '$0.40', priceOut: '$1.20', priceInNum: 0.4,
    tags: ['Tools'], status: 'operational', tokensWeek: '14.8B', trend: '+6%', trendDir: 'up',
    latency: '0.5s', throughput: '95 tps', providersCount: 2,
    providers: [
      { name: 'Mistral', ctx: '128K', maxOut: '16K', din: '$0.40', dout: '$1.20', lat: '0.50s', tp: '95 tps', up: 99.94 },
      { name: 'Azure', ctx: '128K', maxOut: '16K', din: '$0.42', dout: '$1.22', lat: '0.55s', tp: '90 tps', up: 99.90 },
    ],
  },
  {
    name: 'DeepSeek R1', provider: 'deepseek/r1', providerInitial: 'D', org: 'DeepSeek',
    series: 'DeepSeek', cat: 'reasoning', modalities: ['Text'], categories: ['Reasoning', 'Open'],
    description: 'Open reasoning model with visible chain-of-thought at a fraction of frontier cost.',
    context: '64K', ctxNum: 64000, priceIn: '$0.14', priceOut: '$0.28', priceInNum: 0.14,
    tags: ['Reasoning', 'Open'], status: 'degraded', tokensWeek: '31.0B', trend: '+44%', trendDir: 'up',
    latency: '1.1s', throughput: '48 tps', providersCount: 3,
    providers: [
      { name: 'DeepSeek', ctx: '64K', maxOut: '8K', din: '$0.14', dout: '$0.28', lat: '1.10s', tp: '48 tps', up: 99.40 },
      { name: 'Together', ctx: '64K', maxOut: '8K', din: '$0.16', dout: '$0.30', lat: '1.02s', tp: '52 tps', up: 99.70 },
      { name: 'Fireworks', ctx: '64K', maxOut: '8K', din: '$0.18', dout: '$0.32', lat: '0.98s', tp: '55 tps', up: 99.75 },
    ],
  },
  {
    name: 'Grok 4 Fast', provider: 'x-ai/grok-4-fast', providerInitial: 'X', org: 'xAI',
    series: 'Grok', cat: 'frontier', modalities: ['Text', 'Image'], categories: ['Technology', 'Roleplay'],
    description: 'Frontier non-reasoning model that excels at tool calling with a huge 1.8M context window.',
    context: '1.8M', ctxNum: 1800000, priceIn: '$0.50', priceOut: '$1.50', priceInNum: 0.5,
    tags: ['Vision', 'Tools'], status: 'operational', tokensWeek: '9.4B', trend: '+8%', trendDir: 'up',
    latency: '0.5s', throughput: '88 tps', providersCount: 1,
    providers: [
      { name: 'xAI', ctx: '1.8M', maxOut: '32K', din: '$0.50', dout: '$1.50', lat: '0.52s', tp: '88 tps', up: 99.91 },
    ],
  },
  {
    name: 'Qwen 3 72B', provider: 'qwen/qwen-3-72b', providerInitial: 'Q', org: 'Qwen',
    series: 'Qwen', cat: 'open', modalities: ['Text'], categories: ['Programming', 'Open'],
    description: 'Strong open multilingual model with competitive coding and math performance.',
    context: '128K', ctxNum: 128000, priceIn: '$0.20', priceOut: '$0.30', priceInNum: 0.2,
    tags: ['Open'], status: 'operational', tokensWeek: '12.2B', trend: '+21%', trendDir: 'up',
    latency: '0.4s', throughput: '110 tps', providersCount: 2,
    providers: [
      { name: 'DeepInfra', ctx: '128K', maxOut: '16K', din: '$0.20', dout: '$0.30', lat: '0.41s', tp: '110 tps', up: 99.86 },
      { name: 'Together', ctx: '128K', maxOut: '16K', din: '$0.22', dout: '$0.32', lat: '0.44s', tp: '104 tps', up: 99.89 },
    ],
  },
]
