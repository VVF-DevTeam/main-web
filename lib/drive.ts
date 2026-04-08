import { google } from 'googleapis'
import { Readable } from 'stream'
// import mime from 'mime-types';
// import fs from 'fs/promises';

const AVATARS_FOLDER_ID = '1S2Y8zt25b47LeIsGVLhFojLMQwa2UDM6' // Avatars folder - TECH/Images/Avatars
const SHOP_IMAGES_FOLDER_ID = '1IGH8Ul877uuV4XtoS7FVEAULZQsvBLcv' // Shop images folder - TECH/Images/Shop
const REVIEWS_FOLDER_ID = '1ergVhqEl2NqcfkvX00NpLPxv7jUTQ6aU' // Reviews folder - TECH/Images/Reviews
const EVENTS_FOLDER_ID = '1eMEqan2mCChM4xtRmxCgyTeQPHi6NKDq' // Events folder - TECH/Images/Events
const POSTS_FOLDER_ID = '1oGjkFqQD4ekv21xRttlHfNtitA3jzgyJ' // Posts folder - TECH/Images/Posts
const JOBS_FOLDER_ID = '1eMEqan2mCChM4xtRmxCgyTeQPHi6NKDq' // Jobs folder - TECH/Images/Jobs
const TICKETS_FOLDER_ID = '11MxAM_oGDL4rU6lW9sfP11u2Q3sxY-Hc' // Tickets folder - TECH/Images/Tickets
const QUILLED_FOLDER_ID = '1_3vZhgxGrhofnPup0YeRGHv1AHimNacM' // Quilled folder - TECH/Images/Quilled
const EVENT_GALLERY_FOLDER_ID = '1o0DVPqiIh9LplKyz44Ouazip6M_gDCSl' // Events gallery folder - TECH/Images/Events/Gallery

const DRIVE_FOLDER_IDS = {
  avatars: AVATARS_FOLDER_ID,
  shop: SHOP_IMAGES_FOLDER_ID,
  reviews: REVIEWS_FOLDER_ID,
  events: EVENTS_FOLDER_ID,
  posts: POSTS_FOLDER_ID,
  jobs: JOBS_FOLDER_ID,
  tickets: TICKETS_FOLDER_ID,
  quills: QUILLED_FOLDER_ID,
  eventGallery: EVENT_GALLERY_FOLDER_ID,
} as const

export async function listDriveImages(type: 'avatars' | 'shop' | 'reviews' | 'events' | 'posts' | 'jobs' | 'tickets' | 'quills' | 'eventGallery') {
  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT_KEY!),
    scopes: ['https://www.googleapis.com/auth/drive'],
  })

  const drive = google.drive({ version: 'v3', auth })

  const res = await drive.files.list({
    q: `'${DRIVE_FOLDER_IDS[type]}' in parents and trashed = false`,
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
  type: 'avatars' | 'shop' | 'reviews' | 'events' | 'posts' | 'jobs' | 'tickets' | 'quills' | 'eventGallery',
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
      parents: [DRIVE_FOLDER_IDS[type]],
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
