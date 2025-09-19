import { pushNotify } from '@/lib/actions/notification/pushNotify'

export const POST = async () => {
  try {
    await pushNotify()
    return Response.json({ message: 'Success' }, { status: 200 })
  } catch (e: unknown) {
    console.log(e)
    return Response.json({ message: 'Unknown Error' }, { status: 500 })
  }
}
