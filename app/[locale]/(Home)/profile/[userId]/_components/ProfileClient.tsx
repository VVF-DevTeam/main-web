'use client'

import { useState } from 'react'
import Sidebar from './SideBar'
import ProfileInfo from './ProfileInfo'
import Password from './ChangePassword'
import DeleteAccount from './DeleteAccount'
import MyProfile from './MyProfile'

interface userProps {
  name: string | null
  email: string
  phone: string | null
  address: string | null
  age: string | null
  image: string | null
  password: string | null
}

interface Event {
  title: string
  location: string
  date: string
  price: number
  status: 'Upcoming' | 'Ongoing' | 'Finished'
}

const ProfileClient = ({ user }: { user: userProps }) => {
  const [selectedComponent, setSelectedComponent] = useState('my-profile')

  const [events] = useState<Event[]>([
    {
      title: 'ORD001',
      location: 'Vancouver',
      date: '2024-01-15',
      price: 299.99,
      status: 'Upcoming',
    },
    {
      title: 'ORD002',
      location: 'Vancouver',
      date: '2024-01-10',
      price: 149.99,
      status: 'Ongoing',
    },
    {
      title: 'ORD003',
      location: 'Vancouver',
      date: '2024-01-05',
      price: 89.99,
      status: 'Finished',
    },
    {
      title: 'ORD003',
      location: 'Vancouver',
      date: '2024-01-05',
      price: 89.99,
      status: 'Finished',
    },
    {
      title: 'ORD003',
      location: 'Vancouver',
      date: '2024-01-05',
      price: 89.99,
      status: 'Finished',
    },
    {
      title: 'ORD003',
      location: 'Vancouver',
      date: '2024-01-05',
      price: 89.99,
      status: 'Finished',
    },
  ])

  const renderComponent = () => {
    switch (selectedComponent) {
      case 'my-profile':
        return <MyProfile user={user} events={events} />
      case 'update-profile':
        return <ProfileInfo user={user} />
      case 'change-password':
        return <Password user={user} />
      case 'delete-account':
        return <DeleteAccount user={user} />
      default:
        return <MyProfile user={user} events={events} />
    }
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
