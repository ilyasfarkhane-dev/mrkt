// components/CategoryLabel.tsx
import { useRouter } from "next/router";

interface CategoryLabelProps {
  categories: string[]; // Define the type of categories as an array of strings
}

export default function CategoryLabel({ categories }: CategoryLabelProps) {
  return (
    <div className="flex items-center gap-2">
      {categories.map((category) => (
        <span
          key={category}
          className="rounded-full bg-[#cbac70] px-3 py-1.5 font-medium text-white hover:bg-[#042e62]"
        >
          {category}
        </span>
      ))}
    </div>
  );
}