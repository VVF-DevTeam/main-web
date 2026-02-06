// Libraries
import CreatePostFormComponent from '../../posts/(Admin)/createNewPost/_components/CreatePostForm'

interface CreatePostFormProps {
  user: {
    id: string
    role: string[]
  }
  locale: string
}

export default function CreatePostForm({
  user,
  locale,
}: CreatePostFormProps) {
  return (
    <div className="mx-auto my-40 w-full max-w-5xl p-8 lg:p-12 xl:p-16">
      <CreatePostFormComponent
        author={user.id}
        redirectToProfile={{ locale }}
      />
    </div>
  )
}


