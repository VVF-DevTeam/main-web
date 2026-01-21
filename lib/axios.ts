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
      const secretToken = createSecretToken()
      config.headers.set('secret', secretToken)
    }
    return config
  },
  function (error) {
    return Promise.reject(error)
  }
)
