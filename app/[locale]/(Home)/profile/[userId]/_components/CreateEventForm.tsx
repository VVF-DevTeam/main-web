// Components
import CreateEventFormComponent from '@/app/[locale]/(Home)/events/(Admin)/_components/CreateEvent'

interface CreateEventFormProps {
  user: {
    id: string
    role: string[]
  }
  locale: string
}

export default function CreateEventForm({
  user,
  locale,
}: CreateEventFormProps) {
  return (
    <div className="mx-auto my-40 w-full max-w-5xl p-8 lg:p-12 xl:p-16">
      <CreateEventFormComponent
        author="admin"
        redirectToProfile={{ locale, userId: user.id }}
      />
    </div>
  )
}

