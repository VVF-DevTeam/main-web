import {
  FaFacebook,
  FaInstagram,
  FaHeart,
  FaComment,
  FaExpand,
} from 'react-icons/fa'
import Link from 'next/link'
import Image from 'next/image'

import { SocialMediaPost } from '@/lib/types/socialMediaPostsType'

interface PostCardProps {
  post: SocialMediaPost
}

const MAX_CONTENT_LENGTH = 50

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const truncatedContent =
    post.content.length > MAX_CONTENT_LENGTH
      ? `${post.content.substring(0, MAX_CONTENT_LENGTH)}...`
      : post.content

  const link = 'https://www.facebook.com/profile.php?id=61570910920072'

  return (
    <div className="bg-bgColor-white rounded-xl p-4 shadow-lg transition-all duration-300 hover:shadow-xl">
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
          <FaInstagram className="text-textColor-pink text-xl" />
        )}
      </div>

      {/* Post content with 'Read more' link always visible */}
      <p className="text-textColor-black mb-4">
        {truncatedContent}{' '}
        {link && (
          <Link
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-textColor-link hover:text-textColor-linkHover underline"
          >
            Read more
          </Link>
        )}
      </p>

      <Image
        src={post.image}
        alt="Post content"
        className="mb-4 h-48 w-full rounded-lg object-cover"
        width={128}
        height={128}
      />

      <div className="flex items-center justify-between text-textColor-gray">
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
  )
}

export default PostCard
