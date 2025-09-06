import { addUserDevice } from '@/lib/actions/user/addUserDevice'

export const POST = async (request: Request) => {
  try {
    const { token } = await request.json()
    const userId = request.headers.get('userId') as string
    await addUserDevice({ userId, token })
    console.log(`Add device with token:${token} to user: ${userId}`)
    return Response.json(
      { message: 'Add device successfully' },
      { status: 201 }
    )
  } catch (error) {
    return Response.json({ data: error.message }, { status: 500 })
  }
}
