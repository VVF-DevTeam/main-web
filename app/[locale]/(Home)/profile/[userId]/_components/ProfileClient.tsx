'use client'

import { useState } from 'react'
import Sidebar from './SideBar'
import ProfileInfo from './ProfileInfo'
import Password from './ChangePassword'
import DeleteAccount from './DeleteAccount'

interface userProps {
  name: string | null
  email: string
  phone: string | null
  address: string | null
  age: string | null
  image: string | null
  password: string | null
}

const ProfileClient = ({
  user,
  locale,
}: {
  user: userProps
  locale: string
}) => {
  const [selectedComponent, setSelectedComponent] = useState('contact-info')

  const renderComponent = () => {
    switch (selectedComponent) {
      case 'contact-info':
        return <ProfileInfo user={user} />
      case 'change-password':
        return <Password user={user} />
      case 'delete-account':
        return <DeleteAccount user={user} />
      default:
        return <ProfileInfo user={user} />
    }
  }

  if (!user) {
    return <p className="mt-10 text-center">No user data available.</p>
  }

  return (
    <div className="flex min-h-screen flex-col bg-white md:flex-row">
      {/* Sidebar */}
      <Sidebar onSelect={setSelectedComponent} />

      {/* Dynamic Content */}
      <div className="flex-1 p-4 md:p-10">{renderComponent()}</div>
    </div>
  )
}

export default ProfileClient
