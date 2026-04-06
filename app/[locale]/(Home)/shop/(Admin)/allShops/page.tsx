// Libraries
import { redirect } from 'next/navigation'
import { roleCheck } from '@/lib/actions/user/roleCheck'
import { getAllShops, getShopsOfShopOwner } from '@/lib/actions/shop/getShop'

// Components
import ShopManagement from './_components/ShopManagement'
import ServerError from '@/components/error/ServerError'
import { ShopWithEvent } from './_components/columns'
import { getCurrentUserRoleAndId } from '@/lib/actions/user/getCurrentUserRoleAndId'

// Need to check for role, has to make dynamic
export const dynamic = 'force-dynamic'

// Main Component
const AllShops = async () => {
  const { role, id } = await getCurrentUserRoleAndId()
  // check if the current user is an admin to allow access to the shop control page
  if (
    !(await roleCheck({ role: 'ADMIN' })) &&
    !(await roleCheck({ role: 'SHOPOWNER' })) &&
    !(await roleCheck({ role: 'SUPERADMIN' }))
  ) {
    return redirect('/shop')
  }

  // Get all published and unpublished shops
  let allShops: ShopWithEvent[] = []
  if (role.includes('SHOPOWNER')) {
    allShops = await getShopsOfShopOwner(id)
  } else {
    allShops = await getAllShops()
  }

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

