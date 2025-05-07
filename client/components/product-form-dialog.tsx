"use client"

import { useState, useEffect } from "react"
import apiClient from "@/lib/apiClient";
import { useRouter } from "next/navigation"
import { toast } from "sonner"; 
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, X, Upload, ImageIcon, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { RichTextEditor } from "@/components/rich-text-editor"

interface Category {
  id: string
  name: string
}

type ProductFormData = {
  title: string
  description: string
  category_id: string
  images: File[]
  lien_web: string
  lien_insta: string
  lien_fb: string
  lien_linkedin: string
  lien_tiktok: string
  nmr_phone: string
}

interface ProductFormDialogProps {
  onProductAdded: (newProduct: any) => void;
}

export default function ProductFormDialog({ onProductAdded }: ProductFormDialogProps) {
  const router = useRouter()

  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState<ProductFormData>({
    title: "",
    description: "",
    category_id: "",
    images: [],
    lien_web: "",
    lien_insta: "",
    lien_fb: "",
    lien_linkedin: "",
    lien_tiktok: "",
    nmr_phone: "",
  })
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await apiClient.get("/categories");
        setCategories(res.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    if (name === 'title' && value.length > 50) {
      return; // Don't update if over limit
    }
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      const imageFiles = files.filter((file) => file.type.startsWith("image/"));
      handleAddImages(imageFiles);
    }
  };
  
  const handleAddImages = (files: File[]) => {
    const totalFiles = formData.images.length + files.length;
    if (totalFiles > 10) {
      toast.error("You can upload a maximum of 10 images");
      return;
    }
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...files],
    }));
    setImagePreviews((prev) => [...prev, ...newPreviews]);
  };
  
  const handleRemoveImage = (index: number) => {
    // Revoke the object URL to prevent memory leaks
    URL.revokeObjectURL(imagePreviews[index]);
  
    // Update both images and previews
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, category_id: value }))
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

  const validateForm = () => {
  const errors: {field: string; message: string}[] = [];
  
  // Title validation
  if (!formData.title.trim()) {
    errors.push({
      field: 'title',
      message: 'Title is required'
    });
  } else if (formData.title.trim().length < 3) {
    errors.push({
      field: 'title',
      message: 'Title must be at least 3 characters'
    });
  } else if (formData.title.trim().length > 50) {
    errors.push({
      field: 'title',
      message: 'Title cannot exceed 50 characters'
    });
  }

  // Description validation
// Replace this section in validateForm()
if (!formData.description.trim()) {
  errors.push({ field: 'description', message: 'Description is required' });
} else {
  const cleanText = formData.description.replace(/<[^>]*>/g, '').trim();
  if (cleanText.length < 10) {
    errors.push({ field: 'description', message: 'Description must be at least 10 characters' });
  } else if (cleanText.length > 1000) {
    errors.push({ field: 'description', message: 'Description cannot exceed 1000 characters' });
  }
}

  // Category validation
  if (!formData.category_id) {
    errors.push({
      field: 'category',
      message: 'Category is required'
    });
  }

  // Phone number validation
  if (!formData.nmr_phone.trim()) {
    errors.push({
      field: 'nmr_phone',
      message: 'Phone number is required'
    });
  } else if (!/^[0-9+]{8,15}$/.test(formData.nmr_phone)) {
    errors.push({
      field: 'nmr_phone',
      message: 'Enter a valid phone number (8-15 digits)'
    });
  }

  // Image validation
  if (formData.images.length === 0) {
    errors.push({
      field: 'images',
      message: 'At least one image is required'
    });
  }

  return errors;
};


const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  const errors = validateForm();
  if (errors.length > 0) {
    toast.error(errors[0].message);
    return;
  }

  setIsSubmitting(true);

  try {
    const formDataToSubmit = new FormData();
    formDataToSubmit.append("title", formData.title);
    formDataToSubmit.append("description", formData.description);
    formDataToSubmit.append("category_id", formData.category_id);
    formDataToSubmit.append("lien_web", formData.lien_web);
    formDataToSubmit.append("lien_insta", formData.lien_insta);
    formDataToSubmit.append("lien_fb", formData.lien_fb);
    formDataToSubmit.append("lien_linkedin", formData.lien_linkedin);
    formDataToSubmit.append("lien_tiktok", formData.lien_tiktok);
    formDataToSubmit.append("nmr_phone", formData.nmr_phone);
    formData.images.forEach((image) => {
      formDataToSubmit.append("images", image);
    });

    const res = await apiClient.post("/products", formDataToSubmit, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    onProductAdded(res.data);
    console.log("Product added successfully:", res.data);

    // Reset form
    setFormData({
      title: "",
      description: "",
      category_id: "",
      images: [],
      lien_web: "",
      lien_insta: "",
      lien_fb: "",
      lien_linkedin: "",
      lien_tiktok: "",
      nmr_phone: "",
    });
    setImagePreviews([]);
    setOpen(false);
    toast.success("Product added successfully!");
  } catch (error: any) {
    console.error("Error submitting product:", error);
    toast.error(error.response?.data?.message || "Failed to add product !!!");
  } finally {
    setIsSubmitting(false);
  }
};



  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className=" bg-[#cbac70] hover:cursor-pointer">
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            {/* Left Column - Image Upload */}
            <div className="space-y-4">
              <Label className="text-sm font-medium">Product Images 
              <span className="text-red-500 font-medium "> *</span>
              
              </Label>
              <div
                className={cn(
                  "border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center min-h-[180px]",
                  isDragging ? "border-primary bg-primary/5" : "border-gray-200 hover:border-gray-300",
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <Input
                  type="file"
                  id="images"
                  accept="image/*"
                  multiple={false}
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <Label htmlFor="images" className="cursor-pointer flex flex-col items-center">
                  <Upload className="h-10 w-10 text-gray-400 mb-2" />
                  <span className="text-base font-medium text-gray-700">Upload Images</span>
                  <span className="text-sm text-gray-500 mt-1">Drag & drop or click to browse</span>
                </Label>
                {validateForm().some(e => e.field === 'images') && (
    <p className="text-sm text-red-500">
      {validateForm().find(e => e.field === 'images')?.message}
    </p>
  )}
              </div>

              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Uploaded Images</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {imagePreviews.map((preview, index) => (
                      <div
                        key={index}
                        className="relative group aspect-square rounded-md overflow-hidden bg-gray-100"
                      >
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="bg-white/90 text-red-600 rounded-full p-1.5 hover:bg-white"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {imagePreviews.length === 0 && (
                <div className="flex items-center justify-center p-8 border border-gray-200 rounded-lg">
                  <div className="text-center text-gray-400">
                    <ImageIcon className="mx-auto h-12 w-12 mb-2" />
                    <p>No images uploaded yet</p>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Form Fields */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title 
                <span className="text-red-500 font-medium "> *</span>
                <span className="text-xs text-gray-500">
                  {formData.title.length}/50 characters
                </span>
                </Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Product title"
                  className="w-full"
                  maxLength={50} 
                />
                 {validateForm().some(e => e.field === 'title') && (
    <p className="text-sm text-red-500">
      {validateForm().find(e => e.field === 'title')?.message}
    </p>
  )}
              </div>

              <div className="space-y-2">
              <Label htmlFor="description">
      Description <span className="text-red-500 font-medium">*</span>
    </Label>
    <span className="text-xs text-gray-500">
      {formData.description.replace(/<[^>]*>/g, '').length}/1000
    </span>
                <RichTextEditor
                  content={formData.description}
                  onChange={(html) => setFormData((prev) => ({ ...prev, description: html }))}
                  className="min-h-[200px]"
                  
                />
                {validateForm().some(e => e.field === 'description') && (
    <p className="text-sm text-red-500">
      {validateForm().find(e => e.field === 'description')?.message}
    </p>
  )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category 
                <span className="text-red-500 font-medium "> *</span>
                </Label>
                <Select value={formData.category_id} onValueChange={handleSelectChange}>
                  <SelectTrigger>
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
                {validateForm().some(e => e.field === 'category') && (
    <p className="text-sm text-red-500">
      {validateForm().find(e => e.field === 'category')?.message}
    </p>
  )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="nmr_phone">Phone Number 
                <span className="text-red-500 font-medium "> *</span>
                </Label>
                <Input
                  id="nmr_phone"
                  name="nmr_phone"
                  value={formData.nmr_phone}
                  onChange={handleInputChange}
                  placeholder="Phone number"
                />
                 {validateForm().some(e => e.field === 'nmr_phone') && (
    <p className="text-sm text-red-500">
      {validateForm().find(e => e.field === 'nmr_phone')?.message}
    </p>
  )}
              </div>

              <div className="space-y-2">
                <Label className="block mb-2">Social Media Links</Label>
                <div className="space-y-3">
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
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Add Product"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}