import React from 'react'
import Image from 'next/image'
import ImageAddInstruction from './ImageAddInstruction'

const EditorInstructions = () => {
  return (
    <div>
      <p>
        <p>To add images, please use this button
          <Image
            src="https://drive.google.com/thumbnail?id=1m3nrNZMpxDHIYQUNcsXXuIA4pHBK0CX5"
            width="30"
            height="30"
            alt="add image button"
            className="ml-2 inline-block"
          /> 
          and fill it with the image URL from Google Drive.
        </p>
        <ImageAddInstruction />
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
