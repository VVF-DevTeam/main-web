import CryptoJS from 'crypto-js'

export const decodeSecretToken = (secretToken: string) =>
  CryptoJS.AES.decrypt(
    secretToken,
    process.env.SECRET_TRUST_CLIENT as string
  ).toString(CryptoJS.enc.Utf8)

export const createSecretToken = () =>
  CryptoJS.AES.encrypt(
    new Date().toString(),
    process.env.SECRET_TRUST_CLIENT as string
  ).toString()
