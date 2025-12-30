export interface UserInfoProps {
  id: string
  name: string
  email: string
  phone?: string
  address?: string
  age?: string
  image?: string
  phoneVerified: boolean | null
  emailVerified: Date | null
  role: string[]
  password: string | null
  subscribedAt: Date | null
  subscribeExpires: Date | null
  stripeSubscriptionId: string | null
}

export interface UserInfoSimpleProps {
  id: string
  name: string
  email: string
}