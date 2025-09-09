import { prisma } from '@/lib/db'

export const addUserDevice = async ({
  userId,
  token,
}: {
  userId: string
  token: string
}) => {
  let user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  })
  if (!user) throw new Error("User's not exist")
  return prisma.userDevice.create({
    data: {
      token,
      userId: user.id,
    },
  })
}
