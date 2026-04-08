import React from 'react'
import Image from 'next/image'
import ImageAddInstruction from './ImageAddInstruction'

const EditorInstructions = () => {
  return (
    <div>
      <p>
        <p>To add images, please use either:
          <p>
            <Image
              src="https://drive.google.com/thumbnail?id=1-EWGnfoaRtbEd_PpeHWU_Oj1lEo_tG87"
              width="30"
              height="30"
              alt="upload image button"
              className="ml-2 inline-block"
            />
            &nbsp;: to choose an image to upload to our Google Drive folder (you will be prompted to enter desired width).
          </p>
          <Image
            src="https://drive.google.com/thumbnail?id=1m3nrNZMpxDHIYQUNcsXXuIA4pHBK0CX5"
            width="30"
            height="30"
            alt="add image button"
            className="ml-2 inline-block"
          />
          &nbsp;: if you have an already uploaded image in Google Drive <span className="font-bold">ONLY</span>, fill it with the image URL (refer to the instruction         
          <a
            className="text-blue-700 underline"
            href="https://github.com/Viet-Vibe-Foundation/main-web/wiki/Media-Editors-Content-Creators-Ultimate-Guide#b-post-important-tips"
            target="_blank"
            rel="noreferrer"
          >
            here
          </a>). You can change the width by putting the desired width after the image URL using the format: <span className="font-mono">&sz=w[WIDTH]</span> (e.g. https://drive.google.com/thumbnail?id=...&sz=w800).
        </p>
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
