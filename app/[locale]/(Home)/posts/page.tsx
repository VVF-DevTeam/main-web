import PostList from '@/app/[locale]/(Home)/posts/_components/PostList'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import { PlusCircle, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { auth } from '@/auth'
import initTranslations from '@/app/i18n'
interface PostsProps {
  params: Promise<{ locale: string }>
}

const Posts = async ({ params }: PostsProps) => {
  const { locale } = await params
  const { t } = await initTranslations(locale, ['post', 'common'])

  // TODO: Abstract this code to a db function.
  const session = await auth()
  const publishedPosts = await prisma.post.findMany({
    where: {
      isPublished: true,
    },
    include: {
      postLikes: true,
      postVisits: true,
    },
    orderBy: {
      updatedAt: 'desc',
    },
  })
  const userEmail = session?.user?.email

  const user = await prisma.user.findUnique({
    where: {
      email: userEmail || '',
    },
  })

  let isAdmin = false
  if (user?.role === 'ADMIN') {
    isAdmin = true
  }

  return (
    <div>
      <div className="width-max-default flex-col-default mx-auto min-h-screen p-6 pt-12">
        {/* Header */}
        <div className="flex flex-col gap-y-2">
          <h1 className="header-font-black header-sub lg:text-5xl">
            {t('header')}
          </h1>
          <p className="header-font-black text-sm text-textColor">
            {t('description-header')}
          </p>
        </div>

        {/* Posts */}
        {publishedPosts.length > 0 ? (
          <PostList posts={publishedPosts} userId={session?.user?.id || null} />
        ) : (
          <p className="flex-center header-font-black header-sub">
            {t('noPost')}
          </p>
        )}

        {/* Admin Buttons */}
        {isAdmin && (
          <div className="flex-end mt-6 w-full gap-x-4 px-6">
            <Link href="/posts/allPosts" className="group mb-2 py-6">
              <Button
                variant={'ghost'}
                className="flex-center gap-x-2 bg-bgColor-gray/15 p-6 text-textColor hover:bg-bgColor-gray/25 hover:text-textColor/90"
              >
                <ArrowRight className="h-10 w-10 duration-100 ease-in group-hover:translate-y-[-1px]" />
                <span className="text-xl">{t('allPost')}</span>
              </Button>
            </Link>

            <Link href="/posts/createNewPost" className="group mb-2 py-6">
              <Button
                variant={'ghost'}
                className="flex-center gap-x-2 bg-bgColor-black p-6 text-textColor-white hover:bg-bgColor-black/90 hover:text-textColor-white/90"
              >
                <PlusCircle className="h-10 w-10 duration-100 ease-in group-hover:translate-y-[-1px]" />
                <span className="text-xl">{t('newPost')}</span>
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default Posts
