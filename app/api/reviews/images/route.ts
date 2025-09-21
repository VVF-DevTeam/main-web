import { NextRequest, NextResponse } from 'next/server'
import { listDriveImages, uploadDriveImage } from '@/lib/drive'

// Disable Next.js body parser for file upload
export const config = {
  api: {
    bodyParser: false,
  },
}

export async function GET() {
  const avatars = await listDriveImages("reviews")
  return NextResponse.json({ avatars })
}

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('file') as File

  if (!file) {
    return NextResponse.json({ error: 'Missing file' }, { status: 400 })
  }

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const mimetype = file.type || 'image/jpeg'

  const uploaded = await uploadDriveImage("reviews", buffer, file.name, mimetype)
  return NextResponse.json(uploaded, { status: 200 })
}
