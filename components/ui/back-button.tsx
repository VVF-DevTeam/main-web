// Libraries
import { headers } from 'next/headers'

// Components
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowBigLeft } from 'lucide-react'

// Main Component
const BackButton = async () => {
  const header = await headers()
  // for (const [key, value] of header.entries()) { // for debugging
  //   console.log(`${key}: ${value}`)
  // }

  const currentPath = header.get('current-path')
  let parentPath = currentPath?.split('/').slice(0, -1).join('/') || '/'
  
  // For Edit Post Page only, since the parent is from allPosts to editPost
  if (parentPath.split('/').at(-1) === 'editPost') {
    parentPath = parentPath.replace('editPost', 'allPosts')
  }
  
  return (
    <Link href={parentPath as string} className="absolute left-3 top-[170px]">
      <Button variant="default" className="w-[100px]">
        <ArrowBigLeft className="h-5 w-5" />
        Previous
      </Button>
    </Link>
  )
}

export default BackButton
