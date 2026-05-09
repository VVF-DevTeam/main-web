'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import { getClosestFutureEvent } from '@/lib/actions/event/getEvent'
import { ArrowRight, MessagesSquare } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const BOT_AVATAR_URL =
  'https://drive.google.com/thumbnail?id=1nnJYG54Twfxv6vi1HmjZnO9zIDJHyEdq'

type UiMessage = {
  id: string
  role: 'user' | 'assistant'
  text: string
}

const renderInlineMarkdown = (text: string) => {
  const segments = text.split(/(\*\*[^*]+\*\*)/g)
  return segments.map((segment, index) => {
    if (segment.startsWith('**') && segment.endsWith('**') && segment.length > 4) {
      return <strong key={`${segment}-${index}`}>{segment.slice(2, -2)}</strong>
    }
    return <span key={`${segment}-${index}`}>{segment}</span>
  })
}

const renderMarkdownText = (text: string) => {
  const lines = text.split('\n')
  return lines.map((line, index) => (
    <span key={`${line}-${index}`}>
      {renderInlineMarkdown(line)}
      {index < lines.length - 1 ? <br /> : null}
    </span>
  ))
}

const INITIAL_MESSAGES: UiMessage[] = [
  {
    id: 'welcome',
    role: 'assistant',
    text: 'Hi! I’m VVF Penguin Helper — Viet Vibe Foundation’s support and knowledge assistant. My role is to help answer questions about VVF’s community activities, music programs, sports events, volunteering, and how to get involved. \nPlease ask me any questions about VVF, I’m ready to help (-⌔-)っ. \nMình cũng có thể nói tiếng Việt nhé!',
  },
]

const ChatWidget = () => {
  const { t } = (useTranslation as unknown as () => { t: (key: string) => string })()
  const chatClearConversationLabel = t('event:chat-clear-conversation') || 'Clear conversation'
  const chatInputPlaceholder = t('event:chat-input-placeholder') || 'Ask a question'
  const suggestedQuestionsLabel = t('event:chat-suggested-questions') || 'Suggested questions'
  const suggestedQuestionUpcomingEvents =
    t('event:chat-suggested-question-upcoming-events') || 'What are the upcoming events?'
  const suggestedQuestionUpcomingEventTemplate =
    t('event:chat-suggested-question-upcoming-event-detail') || 'Tell me about {{eventTitle}}'
  const suggestedQuestionVvfMission =
    t('event:chat-suggested-question-vvf-mission') || 'What is VVF and its missions?'
  const defaultUpcomingEventName =
    t('event:chat-suggested-question-default-upcoming-event-name') || 'the upcoming event'
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isClearing, setIsClearing] = useState(false)
  const [isInitialTyping, setIsInitialTyping] = useState(true)
  const [messages, setMessages] = useState<UiMessage[]>([])
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([
    suggestedQuestionUpcomingEvents,
    suggestedQuestionUpcomingEventTemplate.replace('{{eventTitle}}', defaultUpcomingEventName),
    suggestedQuestionVvfMission,
  ])
  const { data: session } = useSession()
  const chatContainerRef = useRef<HTMLDivElement | null>(null)

  const userMeta = useMemo(
    () => ({
      email: session?.user?.email || 'guest',
      name: session?.user?.name || 'Guest User',
    }),
    [session?.user?.email, session?.user?.name]
  )

  useEffect(() => {
    if (!isOpen) return
    if (!chatContainerRef.current) return
    chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
  }, [messages, isSending, isInitialTyping, isOpen])

  useEffect(() => {
    const timer = setTimeout(() => {
      setMessages(INITIAL_MESSAGES)
      setIsInitialTyping(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    let isMounted = true

    const loadSuggestedQuestions = async () => {
      try {
        if (!isMounted) return

        const closestFutureEvent = await getClosestFutureEvent()
        const eventTitle = closestFutureEvent?.title?.trim() || defaultUpcomingEventName
        setSuggestedQuestions([
          suggestedQuestionUpcomingEvents,
          suggestedQuestionUpcomingEventTemplate.replace('{{eventTitle}}', eventTitle),
          suggestedQuestionVvfMission,
        ])
      } catch (error) {
        console.log('[CHAT BOT SUGGESTED QUESTIONS ERROR]', error)
      }
    }

    loadSuggestedQuestions()
    return () => {
      isMounted = false
    }
  }, [
    defaultUpcomingEventName,
    suggestedQuestionUpcomingEventTemplate,
    suggestedQuestionUpcomingEvents,
    suggestedQuestionVvfMission,
  ])

  const handleClearConversation = async () => {
    if (isClearing || isSending) return
    setIsClearing(true)
    try {
      const response = await fetch('/api/chat-bot/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userMeta.email,
          name: userMeta.name,
          clearConversation: true,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to clear conversation')
      }

      setInput('')
      setMessages([])
      setIsInitialTyping(true)
      setTimeout(() => {
        setMessages(INITIAL_MESSAGES)
        setIsInitialTyping(false)
      }, 2000)
    } catch (error) {
      console.log(error)
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-clear-error-${Date.now()}`,
          role: 'assistant',
          text: 'Unable to clear conversation right now. Please try again.',
        },
      ])
    } finally {
      setIsClearing(false)
    }
  }

  const handleSend = async (overrideMessage?: string) => {
    const message = (overrideMessage ?? input).trim()
    if (!message || isSending) return

    setInput('')
    setIsSending(true)
    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        role: 'user',
        text: message,
      },
    ])

    try {
      const sentAt = Date.now()

      const requestFallbackResponse = async () => {
        const fallbackResult = await fetch('/api/chat-bot/fallback-response', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userQuestion: message,
          }),
        })

        // One final check after fallback request in case a late response just arrived.
        const lastResponsesResult = await fetch('/api/chat-bot/get-responses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: userMeta.email,
            name: userMeta.name,
            sinceTimestamp: sentAt,
          }),
        })

        if (lastResponsesResult.ok) {
          const lastResponsesPayload = await lastResponsesResult.json()
          const lastNewMessages = Array.isArray(lastResponsesPayload?.newResponses)
            ? lastResponsesPayload.newResponses
            : []

          if (lastNewMessages.length > 0) {
            setMessages((prev) => {
              const existingIds = new Set(prev.map((item) => item.id))
              const additions: UiMessage[] = []
              for (const item of lastNewMessages) {
                if (!item?.id || !item?.text || existingIds.has(item.id)) continue
                additions.push({
                  id: item.id,
                  role: 'assistant',
                  text: item.text,
                })
              }
              return additions.length > 0 ? [...prev, ...additions] : prev
            })
            return
          }
        }

        if (!fallbackResult.ok) {
          throw new Error('Failed to get fallback answer')
        }

        const fallbackPayload = await fallbackResult.json()
        if (!fallbackPayload?.answer || typeof fallbackPayload.answer !== 'string') {
          throw new Error('Fallback answer is invalid')
        }

        setMessages((prev) => [
          ...prev,
          {
            id: `assistant-fallback-${Date.now()}`,
            role: 'assistant',
            text: fallbackPayload.answer,
          },
        ])
      }

      const sendResponse = await fetch('/api/chat-bot/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          email: userMeta.email,
          name: userMeta.name,
        }),
      })

      if (!sendResponse.ok) {
        throw new Error('Failed to send message to chatbot')
      }

      let hasAddedResponse = false

      await new Promise((resolve) => setTimeout(resolve, 6000))

      for (let i = 0; i < 15; i += 1) {
        if (i > 0) {
          await new Promise((resolve) => setTimeout(resolve, 2000))
        }

        const responsesResult = await fetch('/api/chat-bot/get-responses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: userMeta.email,
            name: userMeta.name,
            sinceTimestamp: sentAt,
          }),
        })

        if (!responsesResult.ok) continue

        const responsesPayload = await responsesResult.json()
        if (responsesPayload?.timeout) {
          if (i === 4) {
            await requestFallbackResponse()
            hasAddedResponse = true
            break
          }
          continue
        }
        console.log('[CHAT BOT GET RESPONSES][responsesPayload]', responsesPayload)
        const newMessages = Array.isArray(responsesPayload?.newResponses)
          ? responsesPayload.newResponses
          : []

        if (newMessages.length > 0) {
          setMessages((prev) => {
            const existingIds = new Set(prev.map((item) => item.id))
            const additions: UiMessage[] = []
            for (const item of newMessages) {
              if (!item?.id || !item?.text || existingIds.has(item.id)) continue
              additions.push({
                id: item.id,
                role: 'assistant',
                text: item.text,
              })
            }
            return additions.length > 0 ? [...prev, ...additions] : prev
          })
          hasAddedResponse = true
          break
        }
      }

      if (!hasAddedResponse) {
        await requestFallbackResponse()
      }
    } catch (error) {
      console.log(error)
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-error-${Date.now()}`,
          role: 'assistant',
          text: 'Unable to reach chatbot right now. Please try again.',
        },
      ])
    } finally {
      setIsSending(false)
    }
  }

  const handleSuggestedQuestionClick = async (question: string) => {
    if (isSending) return
    await handleSend(question)
  }

  const shouldShowSuggestedQuestions =
    !isInitialTyping && !isSending && messages.length > 0 && !messages.some((item) => item.role === 'user')

  return (
    <>
      {isOpen ? (
        <div className="fixed md:bottom-24 bottom-[84px] right-6 z-50 md:h-[76vh] h-[70vh] w-[380px] max-w-[calc(100vw-3rem)] overflow-hidden rounded-2xl border border-[#cfd5dd] bg-white shadow-2xl">
          <div className="flex items-center justify-between bg-white px-4 py-3">
            <h2 className="text-2xl font-bold text-[hsl(var(--brand-color-900))]">VVF Penguin Helper</h2>
            <div className="flex items-center gap-2">
              <div className="group relative">
                <button
                  type="button"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-[#1f2937] transition-colors hover:bg-[#e5e7eb]"
                  aria-label="Chat options"
                >
                  <svg viewBox="0 0 16 16" focusable="false" aria-hidden="true" className="h-4 w-4 fill-current">
                    <circle cx="8" cy="2.5" r="1.5" />
                    <circle cx="8" cy="13.5" r="1.5" />
                    <circle cx="8" cy="8" r="1.5" />
                  </svg>
                </button>
                <div className="invisible absolute right-0 top-10 z-10 w-52 rounded-xl border border-[#cfd5dd] bg-white p-2 opacity-0 shadow-xl transition-all duration-150 group-hover:visible group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={handleClearConversation}
                    disabled={isClearing || isSending}
                    className="w-full rounded-lg px-3 py-2 text-left text-base font-semibold text-red-600 transition-colors hover:bg-[#f5f7fa] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {chatClearConversationLabel}
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-2xl font-semibold leading-none text-[#3f4753] transition-colors hover:text-[#111827]"
                aria-label="Close chat helper"
              >
                -
              </button>
            </div>
          </div>
          <div className="h-[2px] w-full bg-gradient-to-r from-[hsl(var(--brand-color-400))] via-[hsl(var(--secondary-color-400))] to-[hsl(var(--secondary-color-900))]" />

          <div className="flex h-[calc(100%-63px)] flex-col justify-between bg-white p-4">
            <div
              ref={chatContainerRef}
              className="space-y-4 overflow-y-auto pr-1 text-sm leading-8 text-[#1f2937]"
            >
              {messages.map((message) =>
                message.role === 'user' ? (
                  <div className="flex justify-end" key={message.id}>
                    <div className="max-w-[84%] rounded-2xl bg-[#f3f3f6] px-4 py-3 text-base leading-8">
                      {message.text}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3" key={message.id}>
                    <img
                      src={BOT_AVATAR_URL}
                      alt="VVF Penguin Helper"
                      className="mt-1 h-8 w-8 rounded-full object-cover"
                    />
                    <div className="max-w-[84%] whitespace-pre-wrap text-base leading-8">
                      {renderMarkdownText(message.text)}
                    </div>
                  </div>
                )
              )}
              {isSending || isInitialTyping ? (
                <div className="flex items-start gap-3">
                  <img
                    src={BOT_AVATAR_URL}
                    alt="VVF Penguin Helper"
                    className="mt-1 h-8 w-8 rounded-full object-cover"
                  />
                  <div className="flex h-10 items-center gap-1 rounded-2xl bg-[#f3f3f6] px-4 py-2">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-[#9aa3af] [animation-delay:-0.3s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-[#9aa3af] [animation-delay:-0.15s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-[#9aa3af]" />
                  </div>
                </div>
              ) : null}
              {shouldShowSuggestedQuestions ? (
                <div className="rounded-xl border border-[#cfd5dd] bg-[#f8fafc] p-3">
                  <p className="mb-2 text-sm font-semibold leading-6 text-[#334155]">
                    {suggestedQuestionsLabel}
                  </p>
                  <div className="flex flex-col gap-2">
                    {suggestedQuestions.map((question, index) => (
                      <button
                        key={`${question}-${index}`}
                        type="button"
                        onClick={() => handleSuggestedQuestionClick(question)}
                        className="rounded-lg border border-[#d9dee7] bg-white px-3 py-2 text-left text-sm leading-6 text-[#1f2937] transition-colors hover:bg-[#f1f5f9]"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="mt-4 flex items-center gap-2">
              <input
                type="text"
                placeholder={chatInputPlaceholder}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    handleSend()
                  }
                }}
                className="h-11 w-full rounded-xl border border-[#9aa3af] bg-white px-3 text-base text-[#111827] outline-none transition placeholder:text-[#6b7280] focus:border-[hsl(var(--brand-color-600))]"
              />
              <button
                type="button"
                onClick={() => handleSend()}
                disabled={isSending}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#9aa3af] text-white transition-colors hover:bg-[hsl(var(--brand-color-600))]"
                aria-label="Send message"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Toggle chat helper"
        className={`
    fixed bottom-6 right-6 z-50
    flex h-14 w-14 items-center justify-center
    rounded-2xl
    text-white
    transition-all duration-300
    ${isOpen ? 'shadow-[0_10px_30px_rgba(193,18,51,0.35)]' : 'shadow-[0_10px_30px_rgba(15,23,42,0.35)]'}
    hover:scale-105
    ${isOpen ? 'hover:shadow-[0_14px_36px_rgba(193,18,51,0.45)]' : 'hover:shadow-[0_14px_36px_rgba(15,23,42,0.45)]'}
    active:scale-95
    overflow-hidden
  `}
        style={{
          background: isOpen
            ? `
      radial-gradient(
        circle at 30% 25%,
        hsla(var(--secondary-color-600) / 0.95) 0%,
        hsla(var(--secondary-color-900) / 0.92) 22%,
        transparent 42%
      ),
      linear-gradient(
        145deg,
        hsl(var(--brand-color-900)) 0%,
        hsl(var(--brand-color-600)) 55%,
        hsl(var(--secondary-color-900)) 100%
      )
    `
            : `
      linear-gradient(
        145deg,
        #2f2f33 0%,
        #1f1f22 100%
      )
    `,
        }}
      >
        {/* glossy overlay */}
        <div
          className="
      pointer-events-none absolute inset-0
      bg-[linear-gradient(to_bottom,rgba(255,255,255,0.28),transparent_42%)]
    "
        />

        {/* subtle inner glow */}
        <div
          className="
      pointer-events-none absolute inset-[1px]
      rounded-[15px]
      border border-white/15
    "
        />

        <MessagesSquare className="relative z-10 h-7 w-7 drop-shadow-md" />
      </button>
    </>
  )
}

export default ChatWidget
