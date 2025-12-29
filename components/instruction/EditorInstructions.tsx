import React from 'react'
import Image from 'next/image'

const EditorInstructions = () => {
  return (
    <div>
      <p>
        To add images
        <Image
          src="https://drive.google.com/thumbnail?id=1m3nrNZMpxDHIYQUNcsXXuIA4pHBK0CX5"
          width="30"
          height="30"
          alt="add image button"
          className="ml-2 inline-block"
        />
        , please first upload them to Google Drive{' '}
        <a
          className="text-blue-700 underline"
          href="https://drive.google.com/drive/folders/1uIa8JaopMOugtjboigiN3frZ1AzAWauB"
          target="_blank"
          rel="noreferrer"
        >
          here
        </a>
        , then get ImageAddInstruction ID use in this format:
        &quot;https://drive.google.com/thumbnail?id=FILE_ID&quot; (FILE_ID is
        the image id you got from Google Drive, check{' '}
        <a
          className="text-blue-700 underline"
          href="https://github.com/Viet-Vibe-Foundation/main-web/wiki/Media-Editors-Content-Creators-Ultimate-Guide#b-post-important-tips"
          target="_blank"
          rel="noreferrer"
        >
          here
        </a>{' '}
        for more info).
        <p className="mt-2">
          To align image, use these buttons:
          <Image
            src="https://drive.google.com/thumbnail?id=1-hAH2TAPRhGeMIayQTgzzinqMHHrlN7E"
            width="50"
            height="26"
            alt="align button"
            className="ml-2 inline-block"
          />
          <span className="font-bold">. DO NOT COPY AND PASTE </span>
          image, this will reduce the efficiency of the website.
        </p>
      </p>
    </div>
  )
}

export default EditorInstructions
