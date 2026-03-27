// Libraries
import { redirect } from 'next/navigation'
import { roleCheck } from '@/lib/actions/user/roleCheck'
import { getCurrentUserInfo } from '@/lib/actions/user/getCurrentUserInfo'
import { getShopForEditing } from '@/lib/actions/shop/getShop'

// Components
import EditShop from '@/app/[locale]/(Home)/shop/(Admin)/editShop/[shopId]/_components/EditShop'
import NotFound from '@/app/[locale]/(Home)/not-found'

// Main Component
const EditShopPage = async ({
  params,
}: {
  params: Promise<{ shopId: string; locale: string }>
}) => {
  // check if the current user is an admin or host to allow access to the shop control page
  if (
    !(await roleCheck({ role: 'ADMIN' })) &&
    !(await roleCheck({ role: 'HOST' })) &&
    !(await roleCheck({ role: 'SUPERADMIN' }))
  ) {
    return redirect('/shop')
  }

  const { shopId } = await params

  // Get current user info
  const user = await getCurrentUserInfo()
  if (!user) {
    return redirect('/signIn')
  }

  // Fetch shop data
  const shop = await getShopForEditing(shopId)

  if (!shop) {
    return <NotFound />
  }

  return (
    <EditShop
      shop={shop}
      showBackButton={true}
    />
  )
}

export default EditShopPage

