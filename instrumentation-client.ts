import { initBotId } from 'botid/client/core'

initBotId({
  protect: [
    {
      path: '/api/auth/*',
      method: 'POST',
    },
  ],
})
