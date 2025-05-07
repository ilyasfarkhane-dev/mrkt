// components/MainImage.tsx
import Image from "next/image";

interface ImageProps {
  src: string; // URL of the image
  alt?: string; // Alt text for the image (optional)
  caption?: string; // Caption for the image (optional)
}

export default function MainImage({ image }: { image: ImageProps }) {
  return (
    <div className="mb-12 mt-12">
      <Image
        src={image.src}
        alt={image.alt || "Thumbnail"} // Use a fallback alt text if not provided
        width={800} // Specify width for the image
        height={450} // Specify height for the image
        className="rounded-lg shadow-md"
      />
      <figcaption className="text-center">
        {image.caption && (
          <span className="text-sm italic text-gray-600 dark:text-gray-400">
            {image.caption}
          </span>
        )}
      </figcaption>
    </div>
  );
}