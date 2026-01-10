// Libraries
import CreateJobFormComponent from "../../../registration/_components/_jobs/_createJob/CreateJobForm"

interface CreateJobFormProps {
  user: {
    id: string
    role: string[]
  }
  locale: string
}

export default function CreateJobForm({
  user,
  locale,
}: CreateJobFormProps) {
  return (
    <div className="mx-auto my-40 w-full max-w-5xl p-8 lg:p-12 xl:p-16">
      <CreateJobFormComponent
        author={user.id}
        redirectToProfile={{ locale, userId: user.id }}
      />
    </div>
  )
}

