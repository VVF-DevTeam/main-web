// Libraries
import { redirect } from 'next/navigation'
import { roleCheck } from '@/lib/actions/user/roleCheck'
import { getAllPosts } from '@/lib/actions/post/getPosts'

// Components
import PostManagement from './_components/PostManagement'

// Need to check for role, has to make dynamic
export const dynamic = 'force-dynamic'

// Main Component
const AllPosts = async () => {
  // check if the current user is an admin to allow access to the post control page
  if (!(await roleCheck({ role: 'ADMIN' }))) {
    return redirect('/posts')
  }

  // Get all published and unpublished posts
  const allPosts = await getAllPosts()

  return (
    <PostManagement
      allPosts={allPosts}
      createPostLink="/posts/createNewPost"
      editLinkPattern="/posts/editPost/{id}"
      showBackButton={true}
    />
  )
}

export default AllPosts
