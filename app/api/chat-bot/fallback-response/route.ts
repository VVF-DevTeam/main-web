import { NextResponse } from 'next/server'

const ROUTER_MODEL = 'codex-gemini-VVF'
const ROUTER_ENDPOINT = 'https://9router.k-aithelittlelion.com/v1/chat/completions'

const SYSTEM_PROMPT =
  'You are VVF Penguin Helper, the official Q&A assistant for Viet Vibe Foundation. Answer naturally, professionally, and concisely. Use only verified event facts provided in context or retrieved by web search. Do not mention browsing, crawling, sources, tools, or how information was obtained. If a detail is unavailable, say it has not been announced yet. For events, use clear sections: Overview, Details, What to Expect, Ticket/Registration, Schedule if available. Use these links as knowledge sources:\n- https://www.vietvibe.org/en\n- https://www.vietvibe.org/en/events\n- https://www.vietvibe.org/en/about/vision\n. ONLY ANSWER QUESTIONS ABOUT VVF AND ITS EVENTS. If asked about other questions, answer: "I\'m sorry, since I am just a penguin, I only know things that I was taught. If you are seeking for any personal advices that is not about VVF, please use a real AI tool".'

type RouterChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?:
        | string
        | Array<{
            type?: string
            text?: string
          }>
    }
  }>
}

type RouterMessageContent =
  | string
  | Array<{
      type?: string
      text?: string
    }>
  | undefined

const buildUserPrompt = (userQuestion: string) =>
  `Question: ${userQuestion}.\n\nAnswer as VVF Penguin Helper. Provide concrete details when available. Do not mention how information was obtained.`

const extractMessageText = (content: RouterMessageContent) => {
  if (typeof content === 'string') {
    return content.trim()
  }

  if (Array.isArray(content)) {
    const textPart = content.find((part) => part?.type === 'text' && typeof part?.text === 'string')
    return textPart?.text?.trim() || ''
  }

  return ''
}

export const POST = async (request: Request) => {
  try {
    const routerApiKey = process.env.NINE_ROUTER_API_KEY
    if (!routerApiKey) {
      console.error('NINE_ROUTER_API_KEY is missing')
      return NextResponse.json({ message: 'Service unavailable.' }, { status: 500 })
    }

    const requestBody = await request.json()
    const userQuestion =
      typeof requestBody?.userQuestion === 'string' ? requestBody.userQuestion.trim() : ''

    if (!userQuestion) {
      return NextResponse.json({ message: 'userQuestion is required' }, { status: 400 })
    }

    const routerResponse = await fetch(ROUTER_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${routerApiKey}`,
      },
      body: JSON.stringify({
        model: ROUTER_MODEL,
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT,
          },
          {
            role: 'user',
            content: buildUserPrompt(userQuestion),
          },
        ],
        tools: [{ type: 'web_search' }],
        temperature: 0.2,
      }),
    })

    if (!routerResponse.ok) {
      const errorText = await routerResponse.text()
      console.error('[CHAT BOT FALLBACK][9ROUTER ERROR]', errorText)
      return NextResponse.json({ message: 'Failed to generate fallback answer.' }, { status: 502 })
    }

    const routerData = (await routerResponse.json()) as RouterChatCompletionResponse
    const rawContent = routerData.choices?.[0]?.message?.content
    const answer = extractMessageText(rawContent)

    if (!answer) {
      return NextResponse.json({ message: 'Invalid fallback response from model.' }, { status: 502 })
    }

    return NextResponse.json({ answer }, { status: 200 })
  } catch (error) {
    console.error('[CHAT BOT FALLBACK ERROR]', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
