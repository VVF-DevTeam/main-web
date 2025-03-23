import axios from 'axios'
import { createSecretToken } from './cryptoUtil'

export const axiosInstance = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
})

axiosInstance.interceptors.request.use(
  function (config) {
    const secrectToken = createSecretToken()
    config.headers.set('secret', secrectToken)
    return config
  },
  function (error) {
    return Promise.reject(error)
  }
)
