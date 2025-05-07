"use client";
import apiClient from "@/lib/apiClient";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import ProjectCard from "@/components/ProjectCard";
import { ChevronLeft, ChevronRight } from "lucide-react";
import GSAPWrapper from "@/components/GSAPWrapper";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  title: string;
  description: string;
  category_id: string; 
}

export default function Example() {
  const [currentPage, setCurrentPage] = useState(1);
  const [posts, setPosts] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoadingCategories(true);
        const response = await apiClient.get("/categories");
        const data = response.data;
        setCategories(data);
      } catch (error) {
        console.error("Error loading categories:", error);
      } finally {
        setIsLoadingCategories(false);
      }
    };
  
    fetchCategories();
  }, []);

  // Fetch products from API
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.get("/products/active-products");
        const data = response.data;
        console.log("my datat :", data);
        setPosts(data);
      } catch (error) {
        console.error("Error loading products:", error);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchPosts();
  }, []);

  const productsPerPage = 6;

  // Filter posts - works on ALL posts
  const filteredPosts = posts.filter((post) => {
    const matchesCategory =
      selectedCategory === null || post.category_id === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === "" ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Calculate pagination based on FILTERED posts
  const totalPages = Math.ceil(filteredPosts.length / productsPerPage);
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredPosts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  const goToPage = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery]);

  return (
    <div className="bg-white py-18">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header Section */}
        <GSAPWrapper animationType="fadeIn" delay={0.2} duration={1}>
          <h1 className="text-3xl font-bold tracking-tight text-[#042e62] sm:text-4xl text-center mb-18">
            All Products
          </h1>
        </GSAPWrapper>

        {/* Search Bar and Category Dropdown */}
        <GSAPWrapper animationType="slideUp" delay={0.4} duration={1}>
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
            {/* Search Bar */}
            <div className="w-full sm:w-1/2">
              <input
                type="text"
                placeholder="Search for a product..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full rounded-md border-0 py-2 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#cbac70] sm:text-sm sm:leading-6"
              />
            </div>

            {/* Category Dropdown */}
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
        </GSAPWrapper>

        {/* Rest of your component remains the same */}
        {isLoading && (
          <GSAPWrapper animationType="fadeIn" delay={0.2} duration={1}>
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#cbac70]"></div>
            </div>
          </GSAPWrapper>
        )}

        {!isLoading && (
          <>
            {currentProducts.length > 0 ? (
              <>
                <GSAPWrapper
                  animationType="slideUp"
                  delay={0.6}
                  stagger={0.3}
                  duration={1}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {currentProducts.map((post: any) => (
                      <ProjectCard key={post.id} post={post} />
                    ))}
                  </div>
                </GSAPWrapper>

                {totalPages > 1 && (
                  <GSAPWrapper animationType="slideUp" delay={0.8} duration={1}>
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
                          const pageNumber = index + 1;
                          if (
                            pageNumber === 1 ||
                            pageNumber === totalPages ||
                            (pageNumber >= currentPage - 1 &&
                              pageNumber <= currentPage + 1)
                          ) {
                            return (
                              <Button
                                key={pageNumber}
                                variant={
                                  currentPage === pageNumber
                                    ? "default"
                                    : "outline"
                                }
                                size="icon"
                                onClick={() => goToPage(pageNumber)}
                                className="w-8 h-8 bg-[#cbac70] hover:bg-[#cbac70]/90"
                              >
                                {pageNumber}
                              </Button>
                            );
                          }
                          if (
                            (pageNumber === currentPage - 2 &&
                              currentPage > 3) ||
                            (pageNumber === currentPage + 2 &&
                              currentPage < totalPages - 2)
                          ) {
                            return (
                              <span key={`ellipsis-${pageNumber}`} className="px-2">
                                ...
                              </span>
                            );
                          }
                          return null;
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
                  </GSAPWrapper>
                )}
              </>
            ) : (
              <GSAPWrapper animationType="fadeIn" delay={0.6} duration={1}>
                <div className="text-center py-12">
                  <p className="text-lg text-gray-600">
                    No products found matching your criteria.
                  </p>
                  <Button
                    variant="ghost"
                    className="mt-4 text-[#cbac70]"
                    onClick={() => {
                      setSelectedCategory(null);
                      setSearchQuery("");
                    }}
                  >
                    Clear filters
                  </Button>
                </div>
              </GSAPWrapper>
            )}
          </>
        )}
      </div>
    </div>
  );
}