import { google } from 'googleapis'
import { Readable } from 'stream'
// import mime from 'mime-types';
// import fs from 'fs/promises';

const AVATARS_FOLDER_ID = '1S2Y8zt25b47LeIsGVLhFojLMQwa2UDM6' // Avatars folder - TECH/Images/Avatars
const SHOP_IMAGES_FOLDER_ID = '1IGH8Ul877uuV4XtoS7FVEAULZQsvBLcv' // Shop images folder - TECH/Images/Shop
const REVIEWS_FOLDER_ID = '1ergVhqEl2NqcfkvX00NpLPxv7jUTQ6aU' // Reviews folder - TECH/Images/Reviews

export async function listDriveImages(type: 'avatars' | 'shop' | 'reviews') {
  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT_KEY!),
    scopes: ['https://www.googleapis.com/auth/drive'],
  })

  const drive = google.drive({ version: 'v3', auth })

  const res = await drive.files.list({
    q: `'${type === 'avatars' ? AVATARS_FOLDER_ID : type === 'shop' ? SHOP_IMAGES_FOLDER_ID : REVIEWS_FOLDER_ID}' in parents and trashed = false`,
    fields: 'files(id, name)',
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  })

  return (
    res.data.files?.map((file) => ({
      id: file.id,
      name: file.name,
      url: `https://drive.google.com/thumbnail?id=${file.id}`, // change width here if needed
    })) || []
  )
}

export async function uploadDriveImage(
  type: 'avatars' | 'shop' | 'reviews',
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
      parents: [type === 'avatars' ? AVATARS_FOLDER_ID : type === 'shop' ? SHOP_IMAGES_FOLDER_ID : REVIEWS_FOLDER_ID],
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
