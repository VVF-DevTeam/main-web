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

  if (parentPath.split('/').at(-1) === 'editPost') {
    // For Edit Post Page, the flow is from allPosts to editPost
    parentPath = parentPath.replace('editPost', 'allPosts')
  } 
  else if (parentPath.split('/').at(-1) === 'editEvent') {
    // For Edit Post Page, the flow is from allPosts to editPost
    parentPath = parentPath.replace('editEvent', 'allEvents')
  } 
  else if (parentPath.includes('class')) {
    // For Event Class Page, class page is is just a bridge page so we will skip it
    parentPath = parentPath.replace('/class', '')
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
