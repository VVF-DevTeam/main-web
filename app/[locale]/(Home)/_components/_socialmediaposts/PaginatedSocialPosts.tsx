// Libraries
import initTranslation from '@/app/i18n'

// Components
import SocialPostCard from './SocialPostCard'
import SocialPostPagination from './SocialPostPagination'
import { getCachedSocialMediaPostsPaginated, getSocialMediaPostsPaginated } from '@/lib/actions/post/getSocialPost'

interface PaginatedSocialPostsProps {
  content: string
  locale: string
  currentPage: number
  postsPerPage: number
}

// Main Component
const PaginatedSocialPosts = async ({ 
  content,
  locale, 
  currentPage, 
  postsPerPage,
}: PaginatedSocialPostsProps) => {
  const { t } = await initTranslation(locale, ['post', 'common'])
  const paginationResult = await getCachedSocialMediaPostsPaginated(
    locale as 'en' | 'vi' | 'fr', 
    currentPage, 
    postsPerPage,
    content,
  )

  return (
    <div className="items-start py-12 pr-6">      
      <div className="mx-auto flex flex-col gap-y-12">
        {/* Header */}
        <div className="flex flex-col gap-y-2">
          <h2 className="text-2xl font-bold header-font-black">{t('socialPostsHeader')}</h2>
          <p className="text-sm text-muted-foreground">{t('socialPostsDescription')}</p>
        </div>

        {/* Posts */}
        {paginationResult.posts.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 gap-y-12 lg:grid-cols-2">
          {paginationResult.posts.map((post) => (
            <SocialPostCard key={post.id} post={post} forPostPage={true} />
          ))}
        </div>
        ) : (
          <p className="flex-center header-font-black mx-auto my-auto text-2xl text-muted-foreground">
            {t('noPost')}
          </p>
        )}

        {/* Pagination */}
        {paginationResult.totalPages > 1 && (
          <div className="mt-8">
            <SocialPostPagination
              currentPage={paginationResult.currentPage}
              totalPages={paginationResult.totalPages}
              totalItems={paginationResult.totalCount}
              showPageInfo={false}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default PaginatedSocialPosts
