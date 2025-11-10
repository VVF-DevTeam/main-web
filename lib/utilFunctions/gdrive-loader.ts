type gdriveLoaderArgs = { src: string; width: number; quality?: number }

export function extractGoogleDriveId(url: string): string {
  if (!url) return ''

  // Pattern 1: https://drive.google.com/thumbnail?id={id}
  // Pattern 2: https://drive.google.com/open?id={id}
  // Pattern 3: https://drive.google.com/file/d/{id}/view
  // Pattern 4: https://drive.google.com/file/d/{id}/edit

  // Try to extract from query parameter ?id=
  const idMatch = url.match(/[?&]id=([^&]+)/)
  if (idMatch) {
    return idMatch[1]
  }

  // Try to extract from /file/d/{id}/
  const fileIdMatch = url.match(/\/file\/d\/([^\/]+)/)
  if (fileIdMatch) {
    return fileIdMatch[1]
  }

  // If no match, return original (might already be an ID)
  return url
}

export default function gdriveLoader({ src, width }: gdriveLoaderArgs) {
  // `src` of the image should be like `https://drive.google.com/thumbnail?id=1JLCsSSkUa9T6_dIksI8L3XWu8K0H6gKz`.
  // if not return as it is

  const allowedHosts = ['drive.google.com']
  let srcUrlHost = ''
  try {
    // If src is not a valid URL, keep srcUrlHost empty
    srcUrlHost = new URL(src).host
  } catch (e) {
    console.error('Error parsing URL:', e)
  }

  if (!allowedHosts.includes(srcUrlHost) && !src.includes('id=')) {
    return src
  }

  const id = extractGoogleDriveId(src)

  return `https://drive.google.com/thumbnail?id=${id}&sz=w${width}`
}
