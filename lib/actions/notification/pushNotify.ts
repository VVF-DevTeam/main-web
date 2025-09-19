import { firebaseAdmin } from '@/firebaseServer'
import { prisma } from '@/lib/db'

const makeNotifyContent = ({
  eventName,
  userName,
}: {
  eventName: string
  userName: string
}) => `Hi ${userName}, ${eventName} will be started soon`

export const pushNotify = async () => {
  try {
    const now = new Date()
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000)
    const upComingvents = await prisma.event.findMany({
      where: {
        startDate: {
          gte: now,
          lte: oneHourLater,
        },
      },
      include: {
        payments: {
          include: {
            user: {
              select: {
                name: true,
                Devices: {
                  select: { token: true },
                },
              },
            },
          },
        },
      },
    })

    const result = upComingvents.map((event) => {
      const userNameAndDevice = event.payments.map((payment) => ({
        userName: payment.user?.name,
        devices: payment.user?.Devices.map((device) => device.token ?? []),
      }))
      return {
        eventName: event.title,
        userNameAndDevice,
      }
    })

    await Promise.all(
      result.flatMap((item) =>
        item.userNameAndDevice.map((user) => {
          if (!user.userName || !user.devices?.length) return
          const message = makeNotifyContent({
            eventName: item.eventName,
            userName: user.userName,
          })
          return firebaseAdmin.messaging().sendEachForMulticast({
            tokens: user.devices,
            notification: {
              title: 'Hello there!!',
              body: message,
            },
          })
        })
      )
    )
  } catch (e: unknown) {
    console.log(e)
  }
}
