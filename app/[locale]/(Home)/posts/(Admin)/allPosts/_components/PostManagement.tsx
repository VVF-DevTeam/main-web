// Libraries
import { Post } from '@prisma/client'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { PlusCircle } from 'lucide-react'

// Components
import BackButton from '@/components/ui/back-button'
import AllPostsTable from './AllPostsTable'

interface PostManagementProps {
  allPosts: Post[]
  createPostLink: string
  editLinkPattern: string
  showBackButton?: boolean
}

export default function PostManagement({
  allPosts,
  createPostLink,
  editLinkPattern,
  showBackButton = false,
}: PostManagementProps) {
  return (
    <div className="width-max-default flex-col-default mx-auto my-20 w-full gap-y-2 p-6">
      {/* Back Button To Parent Page */}
      {showBackButton && <BackButton />}

      {/* Posts Table */}
      <div className="flex items-center justify-between">
        <h1 className="header-sub">All Posts</h1>
        {/* Create Post */}
        <Link href={createPostLink}>
          <Button variant={'default'} className="flex-center gap-x-2">
            <PlusCircle className="h-5 w-5" />
            <span className="text-sm font-medium">Create Post</span>
          </Button>
        </Link>
      </div>

      <p className="mb-12 text-sm text-muted-foreground">
        All published and unpublished posts appear here. Click on the
        <span className="hover:text-textColor-brand/70 font-semibold text-textColor-brand900 transition-all">
          {' '}
          &quot;Edit&quot;
        </span>{' '}
        button to edit a post.
      </p>
      <AllPostsTable data={allPosts} editLinkPattern={editLinkPattern} />
    </div>
  )
}


