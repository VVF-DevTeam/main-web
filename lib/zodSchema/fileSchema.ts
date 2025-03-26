import { z } from 'zod'
const fileSizeLimit = 5 * 1024 * 1024 // 5MB

// Document Schema
export const DOCUMENT_SCHEMA = z
  .instanceof(File)
  .refine(
    (file) =>
      [
        'application/pdf', // .pdf
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
        'application/msword' //.doc
      ].includes(file.type),
    { message: 'Invalid document file type. Only .pdf, .docx, .doc are allowed' }
  )
  .refine((file) => file.size <= fileSizeLimit, {
    message: 'File size should not exceed 5MB',
  })
  .refine((file) => !file || file.size > 0, {
    message: 'Uploaded file is empty',
  })

// Image Schema
export const IMAGE_SCHEMA = z
  .instanceof(File)
  .refine(
    (file) =>
      [
        'image/png',
        'image/jpeg',
        'image/jpg',
        'image/svg+xml',
        'image/gif',
      ].includes(file.type),
    { message: 'Invalid image file type' }
  )
  .refine((file) => file.size <= fileSizeLimit, {
    message: 'File size should not exceed 5MB',
  })
