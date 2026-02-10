import axios from 'axios'
import { createSecretToken } from './cryptoUtil'

export const axiosInstance = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
})

axiosInstance.interceptors.request.use(
  function (config) {
    if (config.method === 'get') {
      // For all get requests, add the secret token to the headers to prevent unauthorized access to the GET APIs
      // Axios get functions are intended for mobile apps only, not for website
      // On website, DO NOT call 'get' as it will compromise SECRET_TRUST_CLIENT
      const secretToken = createSecretToken()
      config.headers.set('secret', secretToken)
    }
    return config
  },
  function (error) {
    return Promise.reject(error)
  }
)
