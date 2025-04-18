// Libraries
import initTranslation from '@/app/i18n'

// Components
import PostCard from './PostCard'
import { Separator } from '@/components/ui/separator'
import { getSocialMediaPosts } from '@/lib/actions/post/getSocialPost'
interface SocialMediaProps {
  locale: string
}

// Main Component
const SocialMediaPosts = async ({ locale }: SocialMediaProps) => {
  const { t } = await initTranslation(locale, ['homePage', 'common'])
  const posts = await getSocialMediaPosts(locale as 'en' | 'vi' | 'fr')
  return (
    <div>
      {/* Title & Separator */}
      <div className="flex-col-center default-gap lg:mt-6">
        <span className="header-font-black header-sub mb-7 py-6 italic">
          {t('socialPostHeader')}
        </span>
      </div>
      <div className="width-max-default mx-auto flex flex-col gap-y-12 p-6 md:p-12 lg:gap-y-16 lg:p-16">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
      <Separator className="mx-auto mt-12 w-2/3 bg-bgColor-brandDark md:w-1/2" />
    </div>
  )
}

export default SocialMediaPosts
