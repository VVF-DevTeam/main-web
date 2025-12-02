import React from 'react'

const ImageAddInstruction = () => {
  return (
    <div>
      <p>
        Only accept images from Google Drive with this format `&quot;`https://drive.google.com/thumbnail?id=FILE_ID`&quot;`. You can upload them to Google Drive {' '}
        <a
          className="text-blue-700 underline"
          href="https://drive.google.com/drive/folders/1uIa8JaopMOugtjboigiN3frZ1AzAWauB"
          target="_blank"
          rel="noreferrer"
        >
          here
        </a>.{' '} Please refer to this{' '}
        <a
          className="text-blue-700 underline"
          href="https://github.com/Viet-Vibe-Foundation/main-web/wiki/Media-Editors-Content-Creators-Ultimate-Guide#b-post-important-tips"
          target="_blank"
          rel="noreferrer"
        >
          link
        </a>{' '} for more information on how to find ID of the file.
      </p>
    </div>
  )
}

export default ImageAddInstruction
