import CreatePostForm from '@/app/[locale]/(Home)/posts/(Admin)/createNewPost/_components/CreatePostForm'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { adminCheck } from '@/lib/dbQueries/adminCheck'

const NewPost = async () => {
  // check if the current user is an admin to allow access to the post control page
  const isAdmin = await adminCheck()
  if (!isAdmin) {
    return redirect('/posts')
  }

  const session = await auth()

  return (
    <div className="mx-auto my-40 max-w-5xl p-8 lg:p-12 xl:p-16">
      <CreatePostForm author={session?.user?.id!} />
    </div>
  )
}

export default NewPost
