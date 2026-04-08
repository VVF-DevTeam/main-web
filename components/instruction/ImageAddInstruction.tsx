import React from 'react'

const ImageAddInstruction = () => {
  return (
    <div>
      <p>
        To upload images, please use the <span className="font-bold">&apos;Upload Image File&apos;</span> button, or you can upload the image to Google Drive and fill the image url with the format below: <br />
        <span className="text-sm">(Please note, the folder containing the images must set <span className="font-bold">Contributor access </span> to the public.)</span> <br />
        <span className="font-mono text-sm">
          https://drive.google.com/file/d/FILE_ID/view, or
          <br />
          https://drive.google.com/thumbnail?id=FILE_ID
        </span> <br />
        If you are VVF Member, please upload the images to VVF Google Drive folder{' '}
        <a
          className="text-blue-700 underline"
          href="https://drive.google.com/drive/folders/1uIa8JaopMOugtjboigiN3frZ1AzAWauB"
          target="_blank"
          rel="noreferrer"
        >
          here
        </a>{' '}
        first and get the image URL with the format above. <br />
        Check{' '}
        <a
          className="text-blue-700 underline"
          href="https://github.com/Viet-Vibe-Foundation/main-web/wiki/Media-Editors-Content-Creators-Ultimate-Guide#b-post-important-tips"
          target="_blank"
          rel="noreferrer"
        >
          here
        </a>{' '}
        for more details and images instructions on how to get image url/id. 
      </p>
    </div>
  )
}

export default ImageAddInstruction
