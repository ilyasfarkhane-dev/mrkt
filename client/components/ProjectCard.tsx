"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Calendar, User, Tag, ImageIcon } from "lucide-react"
import { format } from "date-fns"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { sanitizeHtml } from "@/lib/sanitize"

interface Project {
  id: number
  title: string
  description: string
  images: string[] // images array from backend
  created_at: string
  Category?: {
    name: string
  }
  seller?: {
    name: string
  }
}

export default function ProjectCard({ post }: { post: Project }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const formattedDate = format(new Date(post.created_at), "MMM d, yyyy")

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % post.images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + post.images.length) % post.images.length)
  }

  const getImageUrl = (filename: string): string => {
    return `http://localhost:3000/upload/${filename}`
  }

  return (
    <div >
      <div className="group relative h-full overflow-hidden rounded-xl border bg-background transition-all hover:shadow-lg">
        {/* Image section */}
        <div className="relative aspect-[16/9] overflow-hidden">
          {post.images.length > 0 ? (
            <Image
              src={getImageUrl(post.images[currentImageIndex])}
              alt={`${post.title} - image ${currentImageIndex + 1}`}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
            </div>
          )}

          {/* Category badge */}
          {post.Category && (
            <div className="absolute left-0 top-0 p-3">
              <Badge className="flex items-center gap-1 bg-[#cbac70] backdrop-blur-sm">
                <Tag className="h-3 w-3" />
                {post.Category.name}
              </Badge>
            </div>
          )}

          {/* Image navigation */}
          {post.images.length > 1 && (
            <>
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full bg-[#cbac70] opacity-0 transition-opacity group-hover:opacity-100"
                onClick={prevImage}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Previous image</span>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full bg-[#cbac70]  opacity-0 transition-opacity group-hover:opacity-100"
                onClick={nextImage}
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Next image</span>
              </Button>

              <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                {post.images.map((_, index) => (
                  <button key={index} className="group/dot" onClick={() => setCurrentImageIndex(index)}>
                    <div
                      className={cn(
                        "h-1.5 w-5 rounded-full transition-all",
                        index === currentImageIndex
                          ? "bg-[#cbac70]"
                          : "bg-white  group-hover/dot:bg-primary/50"
                      )}
                    />
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Content section */}
        <div className="p-5">
          <div className="mb-3 flex items-start justify-between">
            <h3 className="line-clamp-1 text-xl font-semibold">{post.title}</h3>
          </div>

          <p
            className="mb-4 line-clamp-2 text-sm text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.description) }}
          />

          <div className="mb-4 flex flex-wrap items-center justify-between gap-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span>{formattedDate}</span>
            </div>

            {post.seller && (
              <div className="flex items-center gap-1.5 me-2">
                <User className="h-4 w-4" />
                <span>{post.seller.name}</span>
              
              </div>
            )}
          </div>

          {/* View Details Button */}
          <Button asChild className="w-full bg-[#cbac70] hover:bg-[#042e62]" variant="default">
            <Link href={`/projects/${post.id}`} passHref>
              <span>View Details</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}