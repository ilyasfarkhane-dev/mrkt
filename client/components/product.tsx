"use client"

import { useEffect, useState } from "react"
import apiClient from "@/lib/apiClient"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import ProjectCard from "@/components/myProductCard"
import ProductFormDialog from "@/components/product-form-dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ProductFormData {
  title: string
  description: string
  category_id: string
  category_name?: string 
  lien_web?: string
  lien_insta?: string
  lien_fb?: string
  lien_linkedin?: string
  lien_tiktok?: string
  nmr_phone?: string
  images: File[]
}
interface Category {
  id: string;
  name: string;
}
export default function ProductsList() {
  const [products, setProducts] = useState<any[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [currentPage, setCurrentPage] = useState(1)
  const [categories, setCategories] = useState<any[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  const productsPerPage = 6
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoadingCategories(true);
        const response = await apiClient.get("/categories");
        setCategories(response.data);
      } catch (error) {
        console.error("Error loading categories:", error);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // Moved fetchProducts outside so we can reuse it
  const fetchProducts = async () => {
    try {
      const res = await apiClient.get("/products/my-products");

      const data = res.data;
      console.log("my datauuuu", data);

      const formattedProducts = Array.isArray(data)
        ? data.map(product => ({
            ...product,
            images: product.images || [],
            Category: product.Category || { name: "Uncategorized" },
            created_at: product.created_at || new Date().toISOString(),
          }))
        : [];

      setProducts(formattedProducts);
    } catch (err) {
      console.error("Failed to fetch products", err);
    }
  };

  // 🟡 fetch once on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // ✅ Auto-refresh on new product
  const handleProductAdded = async () => {
    await fetchProducts();
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(products.length / productsPerPage)
  const indexOfLastProduct = currentPage * productsPerPage
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct)

  const goToPage = (pageNumber: number) => {
    setCurrentPage(pageNumber)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }
  const filteredPosts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === null || product.category_id === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === "" ||
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section className="py-12 px-4 md:px-6 lg:px-8">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">My Products</h2>
          <ProductFormDialog onProductAdded={handleProductAdded} />
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
          <div className="w-full sm:w-1/2 mb-4 sm:mb-0">
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full rounded-md border-0 py-2 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#cbac70] sm:text-sm sm:leading-6"
            />
          </div>

          <div className="w-full sm:w-auto">
          

          <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-auto">
                    {selectedCategory 
                      ? categories.find(c => c.id === selectedCategory)?.name || "Select category"
                      : "All Categories"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup
                    value={selectedCategory || "all"}
                    onValueChange={(value) => 
                      setSelectedCategory(value === "all" ? null : value)
                    }
                  >
                    <DropdownMenuRadioItem value="all">
                      All Categories
                    </DropdownMenuRadioItem>
                    {isLoadingCategories ? (
                      <DropdownMenuRadioItem disabled value="loading">
                        Loading categories...
                      </DropdownMenuRadioItem>
                    ) : (
                      categories.map((category) => (
                        <DropdownMenuRadioItem key={category.id} value={category.id}>
                          {category.name}
                        </DropdownMenuRadioItem>
                      ))
                    )}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
          </div>
        </div>

        {/* Products Grid */}
        {filteredPosts.length === 0 ? (
          <div className="text-center text-gray-500 text-lg mt-10">Aucun projet trouvé.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.slice(indexOfFirstProduct, indexOfLastProduct).map((post: any) => (
              <ProjectCard key={post.id} post={post} />
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="flex justify-center mt-10">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {Array.from({ length: totalPages }).map((_, index) => {
              const pageNumber = index + 1
              return (
                <Button
                  key={pageNumber}
                  variant={currentPage === pageNumber ? "default" : "outline"}
                  size="icon"
                  onClick={() => goToPage(pageNumber)}
                  className="w-8 h-8 bg-[#cbac70] hover:cursor-pointer"
                >
                  {pageNumber}
                </Button>
              )
            })}

            <Button
              variant="outline"
              size="icon"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
