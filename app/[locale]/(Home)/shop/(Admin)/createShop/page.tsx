// Libraries
import { roleCheck } from '@/lib/actions/user/roleCheck'
import { redirect } from 'next/navigation'
import { getCurrentUserInfo } from '@/lib/actions/user/getCurrentUserInfo'

// Components
import CreateShopForm from '../_components/CreateShop'

// Need to check for role, has to make dynamic
export const dynamic = 'force-dynamic'

// Main Component
const CreateShopPage = async () => {
  // check if the current user is an admin to allow access to the shop control page
  if (!(await roleCheck({ role: 'ADMIN' })) && !(await roleCheck({ role: 'HOST' }))) {
    return redirect('/shop')
  }

  // Get current user info for ownerId
  const user = await getCurrentUserInfo()
  
  if (!user) {
    return redirect('/shop')
  }

  return (
    <div className="mx-auto my-40 w-full max-w-5xl p-8 lg:p-12 xl:p-16">
      <CreateShopForm ownerId={user.id} />
    </div>
  )
}

export default CreateShopPage

