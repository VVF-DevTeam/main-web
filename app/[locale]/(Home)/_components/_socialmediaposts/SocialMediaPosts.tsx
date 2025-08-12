// Libraries
import initTranslation from '@/app/i18n'

// Components
import SocialPostCard from './SocialPostCard'
import { getSocialMediaPosts } from '@/lib/actions/post/getSocialPost'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface SocialMediaProps {
  locale: string
}

// Main Component
const SocialMediaPosts = async ({ locale }: SocialMediaProps) => {
  const { t } = await initTranslation(locale, ['homePage', 'common'])
  const posts = await getSocialMediaPosts(locale as 'en' | 'vi' | 'fr', 3)
  return (
    <div className="flex-col-center default-gap lg:mt-6">
      {/* Title & Separator */}
      <span className="header-font-black header-sub">
        {t('socialPostHeader')}
      </span>

      {/* Posts */}
      <div className="width-max-default mx-auto flex flex-col gap-y-12 p-6 lg:px-16 lg:gap-y-16">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 xl:grid-cols-3">
          {posts.map((post) => (
            <SocialPostCard key={post.id} post={post} />
          ))}
        </div>
      </div>

      {/* Button */}
      <Link href={'/posts'}>
        <Button className="w-36 p-3" variant={'default'}>
          {t('button-posts')}
        </Button>
      </Link>

      {/* Separator */}
      <div className="mx-auto mt-12 w-2/3 border-b border-bgColor-brand md:w-1/2"></div>
    </div>
  )
}

export default SocialMediaPosts
