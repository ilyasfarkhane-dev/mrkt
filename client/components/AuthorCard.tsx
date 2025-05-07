// components/AuthorCard.tsx
import Image from "next/image";
import Link from "next/link";

interface Author {
  imageUrl: string; // URL of the author's image
  name: string; // Name of the author
  href: string; // Link to the author's profile
  createdAt?: string; // Date when the author was created (optional)
}

export default function AuthorCard({ author }: { author: Author }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-10 w-10 flex-shrink-0">
       
      </div>
      <div>
        <p className="text-gray-800 dark:text-gray-400">
          <Link href={`/author/${author.href}`}>
            {author.name}
          </Link>
        </p>
        {author.createdAt && (
          <div className="flex items-center space-x-2 text-sm">
            <time
              className="text-gray-500 dark:text-gray-400"
              dateTime={author.imageUrl}
            >
              {author.createdAt}
            </time>
          </div>
        )}
      </div>
    </div>
  );
}