import { decodeSecretToken } from '../../cryptoUtil'

export const validateSecretToken = (secretToken: string) => {
  try {
    const decoded: string = decodeSecretToken(secretToken)
    const requestTimestamp: number = new Date(decoded).getTime()
    const currentTimestamp: number = Date.now()
    const diff = Math.abs(currentTimestamp - requestTimestamp)
    if (diff < 300000) return true // The diff between 2 time should be not more than 5 minutes
    return false
  } catch (error) {
    console.log(error)
    return false
  }
}
