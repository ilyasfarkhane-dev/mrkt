"use client"

import { useState, useEffect } from "react"
import { MoreHorizontal, Plus, SquarePen, RefreshCw , Trash2} from "lucide-react"
import { Button } from "@/components/ui/button"
import apiClient from "@/lib/apiClient";
import CustomConfirmDialog from "@/components/CustomConfirmDialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"

interface Category {
  id: string;
  name: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newCategory, setNewCategory] = useState("")
  const [editCategory, setEditCategory] = useState({ id: "", name: "" })
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);


  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get("/categories")
      setCategories(response.data)
    } catch (error) {
      console.error("Error fetching categories:", error)
      setError(error instanceof Error ? error.message : "Failed to load categories")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const refreshCategories = async () => {
    await fetchCategories()
    toast.success('Categories refreshed successfully')
  }

  const handleAddCategory = async () => {
    if (newCategory.trim()) {
      try {
        const response = await apiClient.post("/categories", { 
          name: newCategory 
        })

        setCategories(prev => [
          ...prev,
          {
            id: response.data.id.toString(),
            name: newCategory,
          },
        ])
        
        setNewCategory("")
        setIsAddOpen(false)
        toast.success('Category added successfully')
      } catch (error) {
        console.error("Error adding category:", error)
        setError(error instanceof Error ? error.message : "Failed to add category")
        toast.error('Failed to add category')
      }
    }
  }


  const handleUpdateCategory = async () => {
    if (editCategory.name.trim()) {
      try {
         await apiClient.put(`/categories/${editCategory.id}`, { 
          name: editCategory.name 
        })

        setCategories(categories.map(cat =>
          cat.id === editCategory.id
            ? { ...cat, name: editCategory.name }
            : cat
        ));
        

        setIsEditOpen(false)
        toast.success('Category updated successfully')
      } catch (error) {
        console.error("Error updating category:", error)
        setError(error instanceof Error ? error.message : "Failed to update category")
        toast.error('Failed to update category')
      }
    }
  }
  const handleDeleteClick = (id: string) => {
    setCategoryToDelete(id);
    setShowConfirmDialog(true);
  };
  
  const handleConfirmDeleteCategory = async () => {
    if (!categoryToDelete) return;
  
    setShowConfirmDialog(false);
    try {
      await apiClient.delete(`/categories/${categoryToDelete}`);
      setCategories(categories.filter((cat) => cat.id !== categoryToDelete));
      toast.success('Category deleted successfully');
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error('Failed to delete category');
    } finally {
      setCategoryToDelete(null);
    }
  };
  

  const openEditDialog = (category: Category) => {
    setEditCategory(category)
    setIsEditOpen(true)
  }

  // Calculate paginated categories for display
  const paginatedCategories = categories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const PaginationControls = () => {
    const totalPages = Math.ceil(categories.length / itemsPerPage)
    const maxVisiblePages = 5

    const getPageNumbers = () => {
      const pages = []
      let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

      if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1)
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
      }

      return pages
    }

    return (
      <div className="flex items-center justify-between px-2 py-4">
        <div className="flex items-center space-x-2">
          <p className="text-sm text-gray-600">
            Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
            <span className="font-medium">
              {Math.min(currentPage * itemsPerPage, categories.length)}
            </span>{' '}
            of <span className="font-medium">{categories.length}</span> categories
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
          >
            First
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          
          {getPageNumbers().map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </Button>
          ))}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            Next
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            Last
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <select
            className="border rounded-md px-2 py-1 text-sm"
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value))
              setCurrentPage(1) // Reset to first page when changing items per page
            }}
          >
            {[5, 10, 20, 50, 100].map((size) => (
              <option key={size} value={size}>
                Show {size}
              </option>
            ))}
          </select>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={refreshCategories}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex justify-center items-center h-64">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <p>Loading categories...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Error:</strong> {error}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#042e62]">Categories</h1>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#cbac70] hover:bg-[#042e62]">
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Category</DialogTitle>
              <DialogDescription>Enter a name for the new category.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddCategory}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">ID</TableHead>
              <TableHead className="text-center">Name</TableHead>
              <TableHead className="w-[100px] text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedCategories.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="text-center">{category.id}</TableCell>
                <TableCell className="text-center">{category.name}</TableCell>
                <TableCell className="text-center">
                 
                   
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                            onClick={() => openEditDialog(category)}
                             className="flex items-center gap-2 "
                        >
                            <SquarePen className="mr-2 h-4 w-4 text-black" />
                       Edit
                     
                        </DropdownMenuItem>
                      
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => handleDeleteClick(category.id)}
                            className="flex items-center gap-2"
                          >
                            <Trash2 className="mr-2 h-4 w-4 text-black" />
                            Delete
                          </DropdownMenuItem>

                      </DropdownMenuContent>
                    </DropdownMenu>
                 
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <PaginationControls />
      </div>

      {/* Edit Category Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-[#042e62]">Edit Category</DialogTitle>
            <DialogDescription>Update the category name.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Name
              </Label>
              <Input
                id="edit-name"
                value={editCategory.name}
                onChange={(e) => setEditCategory({ ...editCategory, name: e.target.value })}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateCategory} className="bg-[#cbac70] hover:bg-[#042e62]">
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CustomConfirmDialog
  isOpen={showConfirmDialog}
  onConfirm={handleConfirmDeleteCategory}
  onCancel={() => setShowConfirmDialog(false)}
  message="Are you sure you want to delete this category?"
/>

    </div>
  )
}