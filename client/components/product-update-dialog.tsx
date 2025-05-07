"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit, X, Upload, ImageIcon, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface Category {
  id: string
  name: string
}

interface ProductImage {
  id: string
  url: string
  filename?: string
}

type ProductFormData = {
  title: string
  description: string
  category_id: string
  images: File[]
  existingImages: ProductImage[]
  lien_web: string
  lien_insta: string
  lien_fb: string
  lien_linkedin: string
  lien_tiktok: string
  nnn_phone: string
}

interface ProductUpdateDialogProps {
  productId: string | number
  
}

export default function ProductUpdateDialog({ productId }: ProductUpdateDialogProps) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState<ProductFormData>({
    title: "",
    description: "",
    category_id: "",
    images: [],
    existingImages: [],
    lien_web: "",
    lien_insta: "",
    lien_fb: "",
    lien_linkedin: "",
    lien_tiktok: "",
    nnn_phone: "",
  })
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([])

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("http://localhost:5000/categories")
        if (!res.ok) {
          throw new Error("Failed to fetch categories")
        }

        const data = await res.json()
        setCategories(data)
      } catch (error) {
        console.error("Error fetching categories:", error)
      }
    }

    if (open) {
      fetchCategories()
    }
  }, [open])

  // Fetch product data when dialog opens
  useEffect(() => {
    const fetchProductData = async () => {
      if (!open || !productId) return

      setIsLoading(true)
      try {
        const token = sessionStorage.getItem("authToken")
        const res = await fetch(`http://localhost:5000/products/${productId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!res.ok) {
          throw new Error(`Failed to fetch product: ${res.status}`)
        }

        const productData = await res.json()
        console.log("Fetched product data:", productData)

        // Format existing images correctly
        const existingImages = Array.isArray(productData.images)
          ? productData.images
              .map((img: string | ProductImage, index: number) => {
                // Handle if images are strings (filenames) or objects
                if (typeof img === "string") {
                  return {
                    id: `existing-${index}`,
                    url: `http://localhost:5000/${img.replace(/\\/g, "/")}`,
                    filename: img,
                  }
                } else if (typeof img === "object" && img !== null) {
                  return {
                    id: img.id || `existing-${index}`,
                    url: img.url || `http://localhost:5000/${img.filename?.replace(/\\/g, "/")}`,
                    filename: img.filename || img.url,
                  }
                }
                return null
              })
              .filter(Boolean)
          : []

        // Set form data from fetched product
        setFormData({
          title: productData.title || "",
          description: productData.description || "",
          category_id: productData.category_id?.toString() || "",
          images: [],
          existingImages: existingImages,
          lien_web: productData.lien_web || "",
          lien_insta: productData.lien_insta || "",
          lien_fb: productData.lien_fb || "",
          lien_linkedin: productData.lien_linkedin || "",
          lien_tiktok: productData.lien_tiktok || "",
          nnn_phone: productData.nnn_phone || "",
        })
      } catch (error) {
        console.error("Error fetching product data:", error)
        toast.error("Failed to load product data. Please try again.")
        setOpen(false)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProductData()
  }, [open, productId])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, category_id: value }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      handleAddImages(newFiles)
    }
  }

  const handleAddImages = (files: File[]) => {
    // Add new files to the existing images array
    const updatedImages = [...formData.images, ...files]
    setFormData((prev) => ({ ...prev, images: updatedImages }))

    // Generate previews for the new files
    const newPreviews = files.map((file) => URL.createObjectURL(file))
    setImagePreviews((prev) => [...prev, ...newPreviews])
  }

  const handleRemoveImage = (index: number) => {
    // Remove image from formData
    const updatedImages = [...formData.images]
    updatedImages.splice(index, 1)
    setFormData((prev) => ({ ...prev, images: updatedImages }))

    // Remove preview and revoke object URL to free memory
    const updatedPreviews = [...imagePreviews]
    URL.revokeObjectURL(updatedPreviews[index])
    updatedPreviews.splice(index, 1)
    setImagePreviews(updatedPreviews)
  }

  const handleRemoveExistingImage = (image: ProductImage) => {
    // If the image has a filename, add it to the delete list
    if (image.filename) {
      setImagesToDelete((prev) => [...prev, image.filename!])
    } else if (image.id) {
      setImagesToDelete((prev) => [...prev, image.id])
    }

    // Remove from UI
    setFormData((prev) => ({
      ...prev,
      existingImages: prev.existingImages.filter((img) => img.id !== image.id),
    }))
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files) {
      const files = Array.from(e.dataTransfer.files)
      const imageFiles = files.filter((file) => file.type.startsWith("image/"))
      handleAddImages(imageFiles)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
  
    try {
      const token = sessionStorage.getItem("authToken");
      if (!token) {
        toast.error("Authentication required");
        setIsSubmitting(false);
        return;
      }
  
      // Create FormData
      const formDataToSubmit = new FormData();
  
      // Prepare text payload with proper typing
      const textPayload: Record<string, string> = {
        title: formData.title,
        description: formData.description,
        category_id: formData.category_id,
        lien_web: formData.lien_web || "",
        lien_insta: formData.lien_insta || "",
        lien_fb: formData.lien_fb || "",
        lien_linkedin: formData.lien_linkedin || "",
        lien_tiktok: formData.lien_tiktok || "",
        nnn_phone: formData.nnn_phone || ""
      };
  
      // Append text fields - TypeScript approved way
      Object.entries(textPayload).forEach(([key, value]) => {
        formDataToSubmit.append(key, value);
      });
  
      // Append images with proper typing
      formData.images.forEach((image: File) => {
        formDataToSubmit.append("images", image);
      });
  
      // Append images to delete
      imagesToDelete.forEach((imageId: string) => {
        formDataToSubmit.append("imagesToDelete", imageId);
      });
  
      // Debug logs with TypeScript types
      console.log("Updating product with:", {
        ...textPayload,
        imagesCount: formData.images.length,
        imagesToDelete: imagesToDelete.length
      });
  
      const response = await fetch(`http://localhost:5000/products/${productId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSubmit,
      });
  
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Update failed");
      }
  
      const result = await response.json();
      console.log("Server response:", result);
  
      // Type-safe verification
      const verifyFields = ["title", "description", "category_id"] as const;
      const mismatches = verifyFields.filter(field => 
        result[field] !== textPayload[field]
      );
  
      if (mismatches.length > 0) {
        console.error("Data mismatch in:", mismatches);
        console.table({
          field: verifyFields,
          sent: verifyFields.map(f => textPayload[f]),
          received: verifyFields.map(f => result[f])
        });
        throw new Error("Server returned inconsistent data");
      }
  
      // Success handling
      toast.success("Product updated successfully!");
      setOpen(false);
  
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Update failed";
      console.error("Update error:", error);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    // Clear all form data when dialog closes
    if (!open) {
      setFormData({
        title: "",
        description: "",
        category_id: "",
        images: [],
        existingImages: [],
        lien_web: "",
        lien_insta: "",
        lien_fb: "",
        lien_linkedin: "",
        lien_tiktok: "",
        nnn_phone: "",
      })
      setImagePreviews([])
      setImagesToDelete([])
    }
  }

  return (
    <>
      <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={() => setOpen(true)}>
        <Edit className="h-4 w-4" />
        Update
      </Button>

      <Dialog
        open={open}
        onOpenChange={(newOpen) => {
          setOpen(newOpen)
          if (!newOpen) resetForm()
        }}
      >
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Update Product</DialogTitle>
          </DialogHeader>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading product data...</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
                {/* Left Column - Image Upload */}
                <div className="space-y-4">
                  <Label>Product Images</Label>
                  <div
                    className={cn(
                      "border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center min-h-[150px]",
                      isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/20",
                    )}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <Input
                      type="file"
                      id="images"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                    <Label htmlFor="images" className="cursor-pointer flex flex-col items-center">
                      <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                      <span className="text-lg font-medium">Upload Images</span>
                      <span className="text-sm text-muted-foreground mt-1">Drag & drop or click to browse</span>
                    </Label>
                  </div>

                  {/* Existing Images */}
                  {formData.existingImages && formData.existingImages.length > 0 && (
                    <>
                      <Label>Existing Images</Label>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        {formData.existingImages.map((image) => (
                          <div key={image.id} className="relative group">
                            <div className="aspect-square rounded-md overflow-hidden border">
                              <img
                                src={image.url || "/placeholder.svg"}
                                alt="Product image"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveExistingImage(image)}
                              className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 shadow-sm"
                            >
                              <X className="h-4 w-4" />
                              <span className="sr-only">Remove image</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {/* New Images Preview */}
                  {imagePreviews.length > 0 && (
                    <>
                      <Label>New Images</Label>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="relative group">
                            <div className="aspect-square rounded-md overflow-hidden border">
                              <img
                                src={preview || "/placeholder.svg"}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(index)}
                              className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 shadow-sm"
                            >
                              <X className="h-4 w-4" />
                              <span className="sr-only">Remove image</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {/* No Images Message */}
                  {formData.existingImages.length === 0 && imagePreviews.length === 0 && (
                    <div className="flex items-center justify-center p-8 border rounded-lg">
                      <div className="text-center text-muted-foreground">
                        <ImageIcon className="mx-auto h-12 w-12 mb-2" />
                        <p>No images uploaded yet</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column - Form Fields */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Product title"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Product description"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={formData.category_id} onValueChange={handleSelectChange}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={String(cat.id)}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nnn_phone">Phone Number</Label>
                    <Input
                      id="nnn_phone"
                      name="nnn_phone"
                      value={formData.nnn_phone}
                      onChange={handleInputChange}
                      placeholder="Phone number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Social Media Links</Label>
                    <div className="grid grid-cols-1 gap-3">
                      <Input
                        name="lien_web"
                        value={formData.lien_web}
                        onChange={handleInputChange}
                        placeholder="Website URL"
                      />
                      <Input
                        name="lien_insta"
                        value={formData.lien_insta}
                        onChange={handleInputChange}
                        placeholder="Instagram URL"
                      />
                      <Input
                        name="lien_fb"
                        value={formData.lien_fb}
                        onChange={handleInputChange}
                        placeholder="Facebook URL"
                      />
                      <Input
                        name="lien_linkedin"
                        value={formData.lien_linkedin}
                        onChange={handleInputChange}
                        placeholder="LinkedIn URL"
                      />
                      <Input
                        name="lien_tiktok"
                        value={formData.lien_tiktok}
                        onChange={handleInputChange}
                        placeholder="TikTok URL"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Update Product"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
