import Link from "next/link"
import { sanitizeHtml } from "@/lib/sanitize"
import { Calendar, Tag } from "lucide-react"

interface Project {
  id: number
  title: string
  description: string
  images: string[] // images array from backend
  created_at: string
  category_id?: number  // Add this
  category_name?: string // Add this
  seller?: {
    user_name: string
    role: string
  }
}

export default function ProductCard({ post }: { post: Project }) {

  const getImageUrl = (filename: string): string => {
    return `http://localhost:3000/upload/${filename}`;
  };

  console.log("post",post)
  const categoryTitle = post.category_name || "Autre"
  const formattedDate = new Date(post.created_at).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })

  return (
    <Link href={`/myProduct/${post.id}`} className="block">
      <article className="group h-full overflow-hidden rounded-lg bg-white shadow-sm transition-all duration-300 hover:shadow-md">
        {/* Image Section */}
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-gray-100">
          {post.images && post.images.length > 0 ? (
            <img
              src={getImageUrl(post.images[0])}
              alt={post.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-50">
              <p className="text-sm text-gray-400">No image available</p>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="flex flex-col p-5">
          {/* Category Badge */}
          <div className="mb-2">
            <span className="inline-flex items-center text-xs font-medium uppercase gap-1 rounded-md bg-[#cbac70]  px-2.5 py-1 text-white transition-colors ">
              <Tag size={12} />
              {categoryTitle}
            </span>
          </div>

          {/* Title */}
          <h3 className="mb-2 line-clamp-1 text-lg font-medium text-gray-900 group-hover:text-gray-700">
            {post.title}
          </h3>

          {/* Description */}
          <p
            className="mb-4 line-clamp-2 text-sm leading-relaxed text-gray-600"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.description) }}
          />

          {/* Footer: Date */}
          <div className="mt-auto flex items-center text-xs text-gray-500">
            <Calendar size={14} className="mr-1" />
            <time dateTime={post.created_at}>{formattedDate}</time>
          </div>
        </div>
      </article>
    </Link>
  )
}
