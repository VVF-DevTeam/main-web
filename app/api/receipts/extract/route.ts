import { NextRequest, NextResponse } from 'next/server'

type GeminiGenerateResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string
      }>
    }
  }>
}

const GEMINI_MODEL = 'gemini-2.5-flash'
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`

function buildPrompt(imageUrl: string) {
  const currentYear = new Date().getFullYear()
  return `Extract receipt data from this image and return ONLY valid JSON in this exact format:
{"receipt":{"receiptNumber":"","receiptDate":"YYYY-MM-DDTHH:mm:ssZ","merchantName":"","merchantAddress":"","currency":"CAD","subtotal":0,"taxAmount":0,"tipAmount":0,"discountAmount":0,"totalAmount":0,"note":"","paymentMethod":"Other","paymentReference":"","category":"Other","receiptImageUrl":"","rawText":"","items":[{"description":"","quantity":1,"unitPrice":0,"taxAmount":0,"discount":0,"lineTotal":0}]}}

Rules:
- Match fields to Prisma schema models Receipt and ReceiptItem.
- Allowed paymentMethod: Cash, Card, BankTransfer, EWallet, Cheque, Other.
- Allowed category: Food, Transportation, Shopping, Utilities, Housing, Health, Education, Entertainment, Travel, Insurance, Salary, Tax, Office, Subscription, Gift, Other.
- If receiptDate has no year, infer year as ${currentYear} unless context clearly indicates another year.
- Use ISO 8601 for receiptDate.
- If unknown text field, use empty string.
- If unknown numeric field, use 0.
- Ensure items is always an array (use [] if no line items found).
- Set receiptImageUrl to "${imageUrl}".
- rawText should contain OCR text from the receipt (best effort).
- Do not include markdown.
- Do not include explanation.`
}

function shouldRetryWithBackup(status: number, errorText: string) {
  const normalized = errorText.toLowerCase()
  return (
    status === 429 ||
    status === 503 ||
    normalized.includes('spike') ||
    normalized.includes('high demand') ||
    normalized.includes('rate limit') ||
    normalized.includes('resource has been exhausted')
  )
}

async function callGeminiWithKey({
  apiKey,
  prompt,
  imageContentType,
  imageBase64,
}: {
  apiKey: string
  prompt: string
  imageContentType: string
  imageBase64: string
}) {
  return fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: imageContentType,
                data: imageBase64,
              },
            },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: 'application/json',
      },
    }),
  })
}

export async function POST(req: NextRequest) {
  try {
    const { imageUrl } = (await req.json()) as { imageUrl?: string }

    if (!imageUrl) {
      console.error('imageUrl is required')
      return NextResponse.json({ error: 'imageUrl is required' }, { status: 400 })
    }

    const geminiApiKey = process.env.GEMINI_API_KEY
    const backupGeminiApiKey = process.env.GEMINI_API_KEY_BACKUP
    if (!geminiApiKey) {
      console.error('GEMINI_API_KEY is missing')
      return NextResponse.json({ error: 'GEMINI_API_KEY is missing' }, { status: 500 })
    }

    const imageResponse = await fetch(imageUrl)
    if (!imageResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch image from imageUrl' },
        { status: 400 },
      )
    }

    const imageContentType = imageResponse.headers.get('content-type') || 'image/jpeg'
    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer())
    const imageBase64 = imageBuffer.toString('base64')

    const prompt = buildPrompt(imageUrl)

    let geminiResponse = await callGeminiWithKey({
      apiKey: geminiApiKey,
      prompt,
      imageContentType,
      imageBase64,
    })

    if (!geminiResponse.ok) {
      const primaryErrorText = await geminiResponse.text()

      if (
        backupGeminiApiKey &&
        shouldRetryWithBackup(geminiResponse.status, primaryErrorText)
      ) {
        geminiResponse = await callGeminiWithKey({
          apiKey: backupGeminiApiKey,
          prompt,
          imageContentType,
          imageBase64,
        })
      } else {
        console.error('Gemini request failed', primaryErrorText)
        return NextResponse.json(
          { error: 'Gemini request failed', details: primaryErrorText },
          { status: 502 },
        )
      }
    }

    if (!geminiResponse.ok) {
      const backupErrorText = await geminiResponse.text()
      console.error('Gemini request failed (including backup key)', backupErrorText)
      return NextResponse.json(
        { error: 'Gemini request failed (including backup key)', details: backupErrorText },
        { status: 502 },
      )
    }

    const geminiData = (await geminiResponse.json()) as GeminiGenerateResponse
    const modelText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text

    if (!modelText) {
      console.error('Gemini returned empty content', geminiData)
      return NextResponse.json(
        { error: 'Gemini returned empty content', raw: geminiData },
        { status: 502 },
      )
    }

    let parsed: unknown
    try {
      parsed = JSON.parse(modelText)
    } catch {
      console.error('Gemini output is not valid JSON', modelText)
      return NextResponse.json(
        { error: 'Gemini output is not valid JSON', raw: modelText },
        { status: 502 },
      )
    }

    return NextResponse.json(parsed, { status: 200 })
  } catch (error) {
    if (error instanceof Error) {
      console.error('Receipt extraction error:', error.stack)
    } else {
      console.error('Receipt extraction error:', error)
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

