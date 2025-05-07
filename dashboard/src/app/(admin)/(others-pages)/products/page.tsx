"use client"

import { useState, useEffect } from "react"
import { ProductDetailDialog } from "@/components/product-detail-dialog";
import { toast } from "sonner";
import axios from "axios";
import { X,RefreshCw } from "lucide-react";

import { sanitizeHtml } from "@/lib/sanitize"
import apiClient from "@/lib/apiClient";
import { MoreHorizontal, Search, Trash2, Eye } from "lucide-react"
import Image from 'next/image';
import CustomConfirmDialog from "@/components/CustomConfirmDialog";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu";
 
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

interface Category {
    id: string;
    name: string;
  }


  interface RawProduct {
    id: number;
    title: string;
    description: string;
    images: string[];
    seller_id: number;
    status: number;
    category_id: string;
    created_at: string;
    updated_at: string;
    seller?: {
      id: number;
      name: string;
      email: string;
    };
    seller_name?: string;
    seller_email?: string;
    category_name?: string;
    Category?: {
      id: number;
      name: string;
    };
  }

 

 
  interface Product {
    id: number;
    title: string;
    description: string;
    images: string[];
    lien_web?: string;
    lien_insta?: string;
    lien_fb?: string;
    lien_linkedin?: string;
    lien_tiktok?: string;
    nmr_phone?: string;
    seller_id: number;
    status: number;
    category_id: string;
    created_at: string;
    updated_at: string;
    seller: {
      id: number;
      name: string;
      email: string;
    };
    Category?: {
      id: number;
      name: string;
    };
    likes: number;
    comments: number;
    is_liked: boolean;
    category_name?: string;
    seller_name?: string;
    seller_email?: string;
  }
  


export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true); 
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);


  const handleViewClick = async (product: Product) => {
    try {
      setViewModalOpen(true);
      setLoading(true);
      
      const token = sessionStorage.getItem("authToken");
      const response = await apiClient.get(`/products/${product.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      // Fetch likes and comments for the product
      const [likesData, commentsData] = await Promise.all([
        fetchProductLikes(product.id),
        fetchProductComments(product.id)
      ]);
  
      const fullProductDetails = {
        ...response.data,
        likes: likesData.likeCount,
        is_liked: likesData.is_liked,
        comments: commentsData.length,
        // Ensure all required fields are present
        seller: response.data.seller || {
          id: response.data.seller_id,
          name: response.data.seller_name,
          email: response.data.seller_email
        },
        Category: response.data.Category || {
          id: response.data.category_id,
          name: response.data.category_name
        }
      };
  
      setSelectedProduct(fullProductDetails);
    } catch (error) {
      console.error("Error fetching product details:", error);
      toast.error("Failed to load product details");
    } finally {
      setLoading(false);
    }
  };

  const fetchProductComments = async (productId: number) => {
    try {
      const token = sessionStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found");
      }
  
      const response = await apiClient.get(`/comments/product/${productId}`);
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching comments for product ${productId}:`, error);
      return []; // Return empty array if request fails
    }
  };

  const handleDeleteClick = (productId: number) => {
    setProductToDelete(productId);
    setShowConfirmDialog(true);
  };
  
  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    
    setShowConfirmDialog(false);
    try {
      const token = sessionStorage.getItem("authToken");
      await apiClient.delete(`/products/${productToDelete}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      // Remove the deleted product from state
      setProducts(products.filter(product => product.id !== productToDelete));
      
      toast.success("Product deleted successfully", {
        duration: 3000,
        className: "bg-green-500 text-white border-none",
        action: {
          label: <X className="h-4 w-4 cursor-pointer text-white bg-green-500" />,
          onClick: () => toast.dismiss(),
        },
      });
      
      // Reset the product to delete
      setProductToDelete(null);
      
      // If we're on a page that might now be empty, adjust pagination
      if (currentItems.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to delete product";
      console.error("Failed to delete product:", errorMessage);
      toast.error(errorMessage);
    }
  };


  const fetchProductLikes = async (productId: number) => {
    try {
      const token = sessionStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found");
      }
  
      const response = await apiClient.get(`/likes/product/${productId}`);
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching likes for product ${productId}:`, error);
      return { likeCount: 0, is_liked: false }; // Default values if request fails
    }
  };
  // Fetch products from API

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = sessionStorage.getItem("authToken");
        if (!token) {
          throw new Error("No authentication token found");
        }
  
        const response = await apiClient.get("/products/active-products");
  console.log("product : ",response.data)
        // Fetch both likes and comments for each product in parallel
        const productsWithStats = await Promise.all(
          response.data.map(async (product: RawProduct) => {
            const [likesData, commentsData] = await Promise.all([
              fetchProductLikes(product.id),
              fetchProductComments(product.id)
            ]);
            
            return {
              ...product,
              image: product.images?.[0] || '/placeholder.svg',
              seller: {
                id: product.seller_id,
                name: product.seller?.name || product.seller_name || 'Unknown Seller'
              },
              likes: likesData.likeCount,
              is_liked: likesData.is_liked,
              comments: commentsData.length // Use the length of the comments array
            };
          })
        );
  
        setProducts(productsWithStats);
        
      } catch (error) {
        console.error("Error loading products:", error);
        setError(error instanceof Error ? error.message : "Failed to load products");
      } finally {
        setLoading(false);
      }
    };
  
    fetchProducts();
  }, []);

  const handleRefresh = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = sessionStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found");
      }
  
      const response = await apiClient.get("/products/active-products");
  
      const productsWithStats = await Promise.all(
        response.data.map(async (product: RawProduct) => {
          const [likesData, commentsData] = await Promise.all([
            fetchProductLikes(product.id),
            fetchProductComments(product.id)
          ]);
          
          return {
            ...product,
            image: product.images?.[0] || '/placeholder.svg',
            seller: {
              id: product.seller_id,
              name: product.seller?.name || product.seller_name || 'Unknown Seller'
            },
            likes: likesData.likeCount,
            is_liked: likesData.is_liked,
            comments: commentsData.length
          };
        })
      );
  
      setProducts(productsWithStats);
      toast.success('Products refreshed successfully');
    } catch (error) {
      console.error("Error refreshing products:", error);
      toast.error('Failed to refresh products');
    } finally {
      setLoading(false);
    }
  };


  

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoadingCategories(true);
        const response = await apiClient.get("/categories"); // يستخدم apiClient
        setCategories(response.data);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error("Axios error loading categories:", error.response?.data || error.message);
        } else {
          console.error("Unknown error loading categories:", error);
        }
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);
  

  // Filter products based on search query and selected category
  const filteredProducts = products.filter((product) => {
  
    const matchesSearch =
    searchQuery.trim() === "" ||
    product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
      selectedCategory === null || product.category_id === selectedCategory;

    return matchesSearch && matchesCategory
  })

  // Calculate pagination
  const totalItems = filteredProducts.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems)
  const currentItems = filteredProducts.slice(startIndex, endIndex)

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery]);

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Products Management</h1>
        <div className="flex justify-center items-center h-64">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <p>Loading products...</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Products Management</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Error:</strong> {error}
        </div>
      </div>
    );
  }
  
  if (products.length === 0) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Products Management</h1>
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          No products found .
        </div>
      </div>
    );
  }

  const getImageUrl = (filename: string): string => {
    return `http://localhost:3000/upload/${filename}`;
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Products Management</h1>

      {/* Search and Filter Section */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search products..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
          />
        </div>

        <Button 
    variant="outline" 
    onClick={handleRefresh}
    disabled={loading}
    className="flex items-center gap-2"
  >
    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
    <span className="hidden sm:inline">Refresh</span>
  </Button>
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

      {/* Products Table */}
      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px] text-center">Product ID</TableHead>
              <TableHead className="w-[150px] text-center">Product Image</TableHead>
              <TableHead className="w-[150px] text-center">Title</TableHead>
              <TableHead className="hidden md:table-cell text-center">Description</TableHead>
              <TableHead className="hidden md:table-cell text-center">Seller</TableHead>
              <TableHead className="hidden md:table-cell text-center">category</TableHead>
              <TableHead className="text-center">Likes</TableHead>
              <TableHead className="text-center">Comments</TableHead>
              <TableHead className="w-[70px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems.length > 0 ? (
              currentItems.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium text-center">{product.id}</TableCell>
                  <TableCell className="flex justify-center items-center">
                  {product.images && product.images.length > 0 ? (
                   <Image
                   src={getImageUrl(product.images[0])}
                   alt={product.title}
                   width={96}
                   height={96}
                   className="object-cover rounded-md border border-gray-200 shadow-sm"
                 />
                  ) : (
                    <div className="w-24 h-24 flex items-center justify-center rounded-md border border-dashed border-gray-300 bg-gray-50 text-gray-400 text-sm shadow-sm">
                      No image
                    </div>
                  )}

                   
                  </TableCell>
                  <TableCell className="font-medium text-center">{product.title}</TableCell>
                  <TableCell className="hidden md:table-cell max-w-[300px] truncate"><p
                    className="mb-4 line-clamp-2 text-sm leading-relaxed text-gray-600 text-center"
                    dangerouslySetInnerHTML={{
                      __html: sanitizeHtml(product.description),
                    }}
                  />
                  </TableCell>
                  <TableCell className="font-medium text-center"> {product.seller?.name || 'Unknown Seller'}</TableCell>
                  <TableCell className="font-medium text-center">{product.Category?.name || 'Unknown category'}</TableCell>
                  <TableCell className="text-center">
                    {product.likes} 
                    {product.is_liked && (
                      <span className="ml-1 text-xs text-primary">(Liked)</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
    
                      {product.comments}
                    
                
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem  onClick={() => handleViewClick(product)} >
                       
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(product.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  No products found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalItems > 0 && (
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
            <span className="font-medium">{endIndex}</span> of <span className="font-medium">{totalItems}</span> products
          </p>

          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                // Show first page, last page, and pages around current page
                if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                  return (
                    <PaginationItem key={page}>
                      <PaginationLink onClick={() => handlePageChange(page)} isActive={page === currentPage}>
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  )
                }

                // Show ellipsis for gaps
                if (page === 2 && currentPage > 3) {
                  return (
                    <PaginationItem key="ellipsis-start">
                      <PaginationEllipsis />
                    </PaginationItem>
                  )
                }

                if (page === totalPages - 1 && currentPage < totalPages - 2) {
                  return (
                    <PaginationItem key="ellipsis-end">
                      <PaginationEllipsis />
                    </PaginationItem>
                  )
                }

                return null
              })}

              <PaginationItem>
                <PaginationNext
                  onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

<CustomConfirmDialog
        isOpen={showConfirmDialog}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowConfirmDialog(false)}
        message="Are you sure you want to delete this product?"
      />

      {/* View Product Modal */}
{/* View Product Modal - Modern Design */}
<ProductDetailDialog
  open={viewModalOpen}
  onOpenChange={setViewModalOpen}
  selectedProduct={selectedProduct}
  loading={loading}
  getImageUrl={getImageUrl}
/>
    </div>
  )
}