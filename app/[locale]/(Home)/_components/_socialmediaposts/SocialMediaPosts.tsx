// Libraries
import initTranslation from '@/app/i18n'

// Components
import PostCard from './PostCard'
import { Separator } from '@/components/ui/separator'

const mockPosts = [
  {
    id: 1,
    username: 'vietvibe',
    content: 'Enjoying a beautiful sunset at the beach! 🌅',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
    likes: 1234,
    comments: 89,
    timestamp: '2h ago',
    platform: 'instagram',
  },
  {
    id: 2,
    username: 'vietvibe',
    content: 'Just got my hands on the latest gadget! What do you think? 📱',
    image: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2',
    likes: 856,
    comments: 45,
    timestamp: '4h ago',
    platform: 'facebook',
  },
  {
    id: 3,
    username: 'vietvibe',
    content: 'Made this amazing pasta from scratch! Recipe in comments 🍝',
    image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141',
    likes: 2345,
    comments: 167,
    timestamp: '6h ago',
    platform: 'instagram',
  },
  {
    id: 4,
    username: 'vietvibe',
    content:
      'Exploring hidden gems in Paris! 🗼 Exploring hidden gems in Paris! 🗼 Exploring hidden gems in Paris! 🗼 Exploring hidden gems in Paris! 🗼 Exploring hidden gems in Paris! 🗼',
    image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a',
    likes: 3456,
    comments: 234,
    timestamp: '12h ago',
    platform: 'facebook',
  },
]

interface SocialMediaProps {
  locale: string
}

// Main Component
const SocialMediaPosts = async ({ locale }: SocialMediaProps) => {
  const { t } = await initTranslation(locale, ['homePage', 'common'])
  console.log(t)
  return (
    <div>
      {/* Title & Separator */}
      <div className="flex-col-center default-gap lg:mt-6">
        <span className="header-font-black header-sub mb-7 py-6 italic">
          {'Latest Social Updates'}
        </span>
      </div>
      <div className="width-max-default mx-auto flex flex-col gap-y-12 p-6 md:p-12 lg:gap-y-16 lg:p-16">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {mockPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
      <Separator className="mx-auto mt-12 w-2/3 bg-bgColor-brandDark md:w-1/2" />
    </div>
  )
}

export default SocialMediaPosts
