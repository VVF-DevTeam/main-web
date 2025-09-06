import { prisma } from '@/lib/db'

export const addUserDevice = async ({
  userId,
  token,
}: {
  userId: string
  token: string
}) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  })
  if (!user) throw new Error("User's not exist")
  prisma.userDevice.create({
    data: {
      token,
      userId: user.id,
    },
  })
}
