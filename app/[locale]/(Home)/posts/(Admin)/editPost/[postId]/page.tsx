// Libraries
import { redirect } from 'next/navigation'
import { roleCheck } from '@/lib/actions/user/roleCheck'
import { getPostForEditing } from '@/lib/actions/post/getPosts'

// Components
import EditPost from '../_components/EditPost'
import NotFound from '@/app/[locale]/(Home)/not-found'

// Interfaces
interface EditPostPageProps {
  params: Promise<{ postId: string }>
}

// Main Component
const EditPostPage = async ({ params }: EditPostPageProps) => {
  // check if the current user is an admin to allow access to the post control page
  if (!(await roleCheck({ role: 'ADMIN' }))) {
    return redirect('/posts')
  }

  const { postId } = await params

  // Fetch post by id from database
  const post = await getPostForEditing(postId)

  if (!post) {
    return <NotFound />
  }

  return (
    <EditPost
      post={post}
      showBackButton={true}
    />
  )
}

export default EditPostPage
