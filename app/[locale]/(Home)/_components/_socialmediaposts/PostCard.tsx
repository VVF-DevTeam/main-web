import { FaFacebook, FaInstagram, FaHeart, FaComment } from 'react-icons/fa'
import Link from 'next/link'
import Image from 'next/image'

import { SocialMediaPost } from '@/lib/types/socialMediaPostsType'

interface PostCardProps {
  post: SocialMediaPost
}

const MAX_CONTENT_LENGTH = 150 // show more text before truncation

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const truncatedContent =
    post.content.length > MAX_CONTENT_LENGTH
      ? `${post.content.substring(0, MAX_CONTENT_LENGTH)}...`
      : post.content

  return (
    <div className="relative block min-h-[28rem] transform rounded-xl bg-white p-6 shadow-lg transition-all duration-300 hover:scale-105 hover:bg-gray-100 hover:shadow-xl">
      <div className="absolute inset-x-0 top-0 h-1.5 rounded-t-lg bg-bgColor-brandLight"></div>
      <div className="flex h-full flex-col justify-between">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center">
            <h3 className="text-textColor-black font-semibold">
              {post.username}
            </h3>
            <span className="mx-2 text-textColor-gray">•</span>
            <p className="text-sm text-textColor-gray">{post.timestamp}</p>
          </div>
          {post.platform === 'facebook' ? (
            <FaFacebook className="text-xl text-textColor-blue" />
          ) : (
            <FaInstagram className="text-xl text-textColor-pink" />
          )}
        </div>

        {/* Content */}
        <p className="text-textColor-black mb-4 text-base leading-relaxed">
          {truncatedContent} (
          <Link
            href={post.url || '/'}
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-pointer00 underline hover:text-blue-600"
          >
            Read more
          </Link>
          )
        </p>

        {/* Image */}
        {post.url && (
          <Link href={post.url} target="_blank" rel="noopener noreferrer">
            <Image
              src={post.image}
              alt="Post content"
              className="mb-4 h-64 w-full rounded-lg object-cover"
              width={640}
              height={320}
            />
          </Link>
        )}

        {/* Footer: Likes & Comments */}
        <div className="mt-auto flex items-center justify-between text-textColor-gray">
          <div className="flex items-center space-x-2">
            <FaHeart className="text-textColor-red" />
            <span>{post.likes.toLocaleString()}</span>
          </div>
          <div className="flex items-center space-x-2">
            <FaComment className="text-textColor-blue" />
            <span>{post.comments.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PostCard
