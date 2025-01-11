import CreatePostForm from './_components/CreatePostForm'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
const NewPost = async () => {
  const session = await auth()
  if (!session?.user?.id) {
    return redirect('/app/signIn')
  }
 
  return (
    <div className="mx-auto my-40 w-full max-w-5xl p-8 lg:p-12 xl:p-16">
      <CreatePostForm author={session?.user?.id} />
    </div>
  )
}

export default NewPost
