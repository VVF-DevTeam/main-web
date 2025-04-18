import { google } from 'googleapis'
import { Readable } from 'stream'
// import mime from 'mime-types';
// import fs from 'fs/promises';

const FOLDER_ID = '1S2Y8zt25b47LeIsGVLhFojLMQwa2UDM6' // replace with actual ID

export async function listAvatars() {
  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT_KEY!),
    scopes: ['https://www.googleapis.com/auth/drive'],
  })

  const drive = google.drive({ version: 'v3', auth })

  const res = await drive.files.list({
    q: `'${FOLDER_ID}' in parents and trashed = false`,
    fields: 'files(id, name)',
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  })

  return (
    res.data.files?.map((file) => ({
      id: file.id,
      name: file.name,
      url: `https://drive.google.com/thumbnail?id=${file.id}&sz=w500`, // change width here if needed
    })) || []
  )
}

export async function uploadAvatar(
  fileBuffer: Buffer,
  filename: string,
  mimetype: string
) {
  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT_KEY!),
    scopes: ['https://www.googleapis.com/auth/drive'],
  })

  const drive = google.drive({ version: 'v3', auth })
  const stream = Readable.from(fileBuffer)

  const fileRes = await drive.files.create({
    requestBody: {
      name: filename,
      parents: [FOLDER_ID],
    },
    media: {
      mimeType: mimetype,
      body: stream,
    },
    fields: 'id, name',
    supportsAllDrives: true,
  })

  return {
    id: fileRes.data.id,
    name: fileRes.data.name,
    url: `https://drive.google.com/uc?export=view&id=${fileRes.data.id}`,
  }
}
