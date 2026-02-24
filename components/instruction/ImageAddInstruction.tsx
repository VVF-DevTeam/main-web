import React from 'react'

const ImageAddInstruction = () => {
  return (
    <div>
      <p>
        We only accept images&apos; urls from Google Drive with this format: {' '}
        <br />
        <span className="font-mono text-sm">
          https://drive.google.com/file/d/FILE_ID/view, or
          <br />
          https://drive.google.com/thumbnail?id=FILE_ID
        </span> <br /> Please upload the images to Google Drive{' '}
        <a
          className="text-blue-700 underline"
          href="https://drive.google.com/drive/folders/1uIa8JaopMOugtjboigiN3frZ1AzAWauB"
          target="_blank"
          rel="noreferrer"
        >
          here
        </a>{' '}
        first and get the image URL with the format above.
        Check{' '}
        <a
          className="text-blue-700 underline"
          href="https://github.com/Viet-Vibe-Foundation/main-web/wiki/Media-Editors-Content-Creators-Ultimate-Guide#b-post-important-tips"
          target="_blank"
          rel="noreferrer"
        >
          here
        </a>{' '}
        on how to get image url/id. 
      </p>
    </div>
  )
}

export default ImageAddInstruction
