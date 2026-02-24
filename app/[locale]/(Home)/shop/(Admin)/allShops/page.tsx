// Libraries
import { redirect } from 'next/navigation'
import { roleCheck } from '@/lib/actions/user/roleCheck'
import { getAllShops } from '@/lib/actions/shop/getShop'

// Components
import ShopManagement from './_components/ShopManagement'
import ServerError from '@/components/error/ServerError'

// Need to check for role, has to make dynamic
export const dynamic = 'force-dynamic'

// Main Component
const AllShops = async () => {
  // check if the current user is an admin to allow access to the shop control page
  if (
    !(await roleCheck({ role: 'ADMIN' })) &&
    !(await roleCheck({ role: 'HOST' }))
  ) {
    return redirect('/shop')
  }

  // Get all published and unpublished shops
  const allShops = await getAllShops()

  // Check if there was an error (shops should not be null)
  if (!allShops) {
    return <ServerError />
  }

  return (
    <ShopManagement
      allShops={allShops}
      createShopLink="/shop/createShop"
      editLinkPattern="/shop/editShop/{shopId}"
      showBackButton={true}
    />
  )
}

export default AllShops

