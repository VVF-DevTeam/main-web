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
    select: {
      id: true,
      title: true,
      summary: true,
      imgUrl: true,
      createdAt: true,
      postLikes: true,
      postVisits: true,
      _count: {
        select: {
          postLikes: true,
          postVisits: true,
        },
      },
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
      <div className="mx-auto flex min-h-screen w-full max-w-[1500px] flex-col p-6 py-12">
        {/* Header */}
        <div className="flex w-full flex-col gap-y-2">
          <h1 className="text-3xl font-semibold md:text-4xl lg:text-5xl">
            {t('header')}
          </h1>
          <p className="mb-12 text-sm text-muted-foreground">
            {t('description-header')}
          </p>
        </div>

        {/* Posts */}
        {publishedPosts.length > 0 ? (
          <PostList posts={publishedPosts} userId={session?.user?.id || null} />
        ) : (
          <p className="flex items-center justify-center text-2xl font-semibold">
            {t('noPost')}
          </p>
        )}

        {isAdmin && (
          <div className="mt-6 flex w-full items-center justify-end gap-x-4 px-6">
            <Link href="/posts/allPosts" className="group mb-2 py-6">
              <Button
                variant={'ghost'}
                className="flex items-center gap-x-2 bg-slate-200 p-6 text-black hover:bg-slate-300/90 hover:text-black/90"
              >
                <ArrowRight className="h-10 w-10 duration-100 ease-in group-hover:translate-y-[-1px]" />
                <span className="text-xl">{t('allPost')}</span>
              </Button>
            </Link>

            <Link href="/posts/createNewPost" className="group mb-2 py-6">
              <Button
                variant={'ghost'}
                className="flex items-center gap-x-2 bg-[#1B171A] p-6 text-slate-200 hover:bg-[#1B171A]/90 hover:text-slate-200/90"
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