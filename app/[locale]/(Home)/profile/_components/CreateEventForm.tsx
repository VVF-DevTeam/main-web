// Components
import CreateEventFormComponent from '@/app/[locale]/(Home)/events/(Admin)/_components/CreateEvent'

interface CreateEventFormProps {
  locale: string
}

export default function CreateEventForm({
  locale,
}: CreateEventFormProps) {
  return (
    <div className="mx-auto my-40 w-full max-w-5xl p-8 lg:p-12 xl:p-16">
      <CreateEventFormComponent
        author="admin"
        redirectToProfile={{ locale }}
      />
    </div>
  )
}

