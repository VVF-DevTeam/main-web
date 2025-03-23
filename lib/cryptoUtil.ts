import CryptoJS from 'crypto-js'

export const decodeSecretToken = (secretToken: string) =>
  CryptoJS.AES.decrypt(
    secretToken,
    process.env.NEXT_PUBLIC_SECRET_TRUST_CLIENT as string
  ).toString(CryptoJS.enc.Utf8)

export const createSecretToken = () =>
  CryptoJS.AES.encrypt(
    new Date().toString(),
    process.env.NEXT_PUBLIC_SECRET_TRUST_CLIENT as string
  ).toString()
