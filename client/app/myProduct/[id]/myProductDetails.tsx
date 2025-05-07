"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import type React from "react"
import CustomConfirmDialog from "@/components/CustomConfirmDialog";
import { toast } from "sonner"
import apiClient from "@/lib/apiClient"
import { RichTextEditor } from "@/components/rich-text-editor"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { sanitizeHtml } from "@/lib/sanitize"
import {
  PhoneCall,
  Globe,
  Instagram,
  Facebook,
  Linkedin,
  CircleUser,
  Heart,
  MessageSquare,
  Share2,
  Trash2,
  Edit,
  X,
  Upload,
  ImageIcon,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Tag
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
  import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
  import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

interface ImageState {
  existing: ProductImage[]
  new: Array<{ file: File; preview: string }>
  toDelete: string[] // This will store IDs or filenames of images to delete
}

interface Comment {
  id: string;
  content: string;
  user_id: string;
  user_name: string;
  createdAt: string;
  // Add any other fields you need
}

interface Category {
  id: string
  name: string
}

interface ProductImage {
  id: string
  url: string
  filename?: string
}

interface ProductFormData {
  title: string
  description: string
  category_id: string
  lien_web: string
  lien_insta: string
  lien_fb: string
  lien_linkedin: string
  lien_tiktok: string
  nmr_phone: string
}

type ProjectType = {
  id: string;
  title: string;
  description: string;
  category_id: number;
  lien_web?: string;
  lien_insta?: string;
  lien_fb?: string;
  lien_linkedin?: string;
  lien_tiktok?: string;
  nmr_phone?: string;
  images?: ProductImage[];
  Category?: {
    name: string;
  };
  
};


export default function ProductDetails({ project }: { project: any }) {
  const router = useRouter()

  const [mainImage, setMainImage] = useState(0)
  const [localProject, setLocalProject] = useState(project);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [comments, setComments] = useState<any[]>([])
  const [visibleComments, setVisibleComments] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const [categoryTitle, setCategoryTitle] = useState("Autre")
  
const [commentToDelete, setCommentToDelete] = useState<string | null>(null);


  
  // Update Dialog State
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState<ProductFormData>({
    title: "",
    description: "",
    category_id: "",
    lien_web: "",
    lien_insta: "",
    lien_fb: "",
    lien_linkedin: "",
    lien_tiktok: "",
    nmr_phone: "",
  })
  const [categories, setCategories] = useState<Category[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const [images, setImages] = useState<ImageState>({
    existing: [],
    new: [],
    toDelete: [],
  })

  useEffect(() => {
    if (project.images && project.images.length > 0) {
      setMainImage(0); // Reset mainImage if images are available
    } else {
      setMainImage(-1); // Indicate no main image
    }
  }, [project.images]);
  ///////
  useEffect(() => {
    if (project && project.category_name) {
      setCategoryTitle(project.category_name)
    } else {
      setCategoryTitle("Autre")
    }
  }, [project])

  if (!project) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-600">Loading product details...</span>
      </div>
    )
  }

  const COMMENTS_PER_PAGE = 4

  // Fetch likes
  useEffect(() => {
    const fetchLikes = async () => {
      try {
        const response = await apiClient.get(`/likes/product/${project.id}`)
        const data = response.data
        setLikeCount(data.likeCount || 0)
        setIsLiked(data.is_liked || false)
      } catch (error: any) {
        console.error("Failed to fetch like count:", error?.response?.data || error.message)
      }
    }

    fetchLikes()
    const interval = setInterval(fetchLikes, 3000)
    return () => clearInterval(interval)
  }, [project.id])

  // Fetch comments
  const fetchComments = async () => {
    try {
      const response = await apiClient.get(`/comments/product/${project.id}`)
      const data = response.data
      console.log("comments response:", data) // Debug log
      
      // Preserve all comment data including ID
      const formattedComments = Array.isArray(data) 
        ? data.map((comment: any) => ({
            id: comment.id, // Make sure to include the ID
            text: comment.content,
            user: comment.User?.user_name || `User ${comment.user_id}`,
            date: new Date(comment.createdAt).toLocaleString("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: false,
            }),
            user_id: comment.user_id, // Include user_id for ownership check
          }))
        : [];
        
      setComments(formattedComments)
    } catch (error: any) {
      console.error("Failed to fetch comments:", error?.response?.data || error.message)
      setComments([])
    }
  }

  useEffect(() => {
    fetchComments()
  }, [project.id])

  const handleDeleteComment = async (commentId: string) => {
    try {
      const token = sessionStorage.getItem("authToken");
      await apiClient.delete(`/comments/${commentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      toast.success("Comment deleted successfully");
      fetchComments(); // Refresh comments
    } catch (error: any) {
      console.error("Failed to delete comment:", error?.response?.data || error.message);
      toast.error("Failed to delete comment");
    } finally {
      setCommentToDelete(null);
    }
  };

  // Update visible comments based on the current page
  useEffect(() => {
    const startIndex = (page - 1) * COMMENTS_PER_PAGE
    const endIndex = startIndex + COMMENTS_PER_PAGE
    setVisibleComments(comments.slice(startIndex, endIndex))
  }, [comments, page])

  const loadMoreComments = () => {
    setPage(page + 1)
  }

  const loadOlderComments = () => {
    setPage(page - 1)
  }

  const handleDelete = async () => {
    setShowConfirmDialog(true);
  }
  const handleConfirmDelete = async () => {
    setShowConfirmDialog(false); // Close the dialog first
    try {
      const token = sessionStorage.getItem("authToken");
      await apiClient.delete(`/products/${project.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
     
       toast.success("Product deleted successfully", {
              duration: 3000, // Duration in milliseconds
              className: "bg-green-500 text-white border-none", // Custom green styling
              action: {
                label: <X
                className="h-4 w-4 cursor-pointer text-white  bg-green-500 " // White icon with hover effect
                style={{ background: "transparent" }} // Transparent background
              />, // Close icon
                onClick: () => toast.dismiss(), // Dismiss the toast on click
              },
            });
            router.push("/profile");
    } catch (error: any) {
      console.error("Failed to delete product:", error?.response?.data || error.message);
      toast.error("Failed to delete product");
    }
  };
  // Update Dialog Functions
  const fetchCategories = async () => {
    try {
      const response = await apiClient.get("/categories");
      const data = response.data;
      console.log("catego: ", data);
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!e?.target) return

    const { name, value } = e.target
    if (!name) {
      console.error("Input element is missing name attribute", e.target)
      return
    }

    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, category_id: value }))
  }
  useEffect(() => {
    const fetchProductData = async () => {
      setIsLoading(true);
      try {
        const token = sessionStorage.getItem("authToken");
        const response = await apiClient.get(`/products/${project.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        const productData = response.data;
        console.log("my product data : ", productData);
  
        const existingImages = Array.isArray(productData.images)
          ? productData.images.map((img: string | ProductImage, index: number) => {
              if (typeof img === "string") {
                return {
                  id: `existing-${index}`,
                  url: `http://localhost:3000/upload/${img.replace(/\\/g, "/")}`,
                  filename: img,
                };
              }
              return {
                id: img.id || `existing-${index}`,
                url: img.url || `http://localhost:3000/upload/${img.filename?.replace(/\\/g, "/")}`,
                filename: img.filename || img.url,
              };
            })
          : [];
  
        setImages((prev) => ({
          ...prev,
          existing: existingImages,
        }));
  
        setFormData({
          title: productData.title || "",
          description: productData.description || "",
          category_id: productData.category_id?.toString() || "",
          lien_web: productData.lien_web || "",
          lien_insta: productData.lien_insta || "",
          lien_fb: productData.lien_fb || "",
          lien_linkedin: productData.lien_linkedin || "",
          lien_tiktok: productData.lien_tiktok || "",
          nmr_phone: productData.nmr_phone || "",
        });
      } catch (error) {
        console.error("Error fetching product data:", error);
        toast.error("Failed to load product data. Please try again.");
        setOpen(false);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchProductData();
  }, []);

  useEffect(() => {
    if (open) {
      fetchCategories()
    }
  }, [open, project.id])

 

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      if (e.target.files.length > 1) {
        toast.error("Please select only one image at a time. Upload images one by one.", {
          style: {
            background: '#ef4444',
            color: 'white',
            border: 'none',
          }
        });
        e.target.value = ''; // Clear the input to allow re-selection
        return;
      }
  
      const file = e.target.files[0];
      const newImage = {
        file,
        preview: URL.createObjectURL(file),
      };
  
      setImages((prev) => ({
        ...prev,
        new: [...prev.new, newImage],
      }));
    }
  };
  const handleRemoveImage = (index: number) => {
    setImages((prev) => {
      const newImages = [...prev.new]
      URL.revokeObjectURL(newImages[index].preview)
      newImages.splice(index, 1)
      return { ...prev, new: newImages }
    })
  }

  const handleRemoveExistingImage = (image: ProductImage) => {
    setImages((prev) => {
      // Check if image is already marked for deletion
      const alreadyMarked = prev.toDelete.includes(image.filename || image.url);
      
      if (alreadyMarked) {
        // If already marked, remove it from toDelete and add back to existing
        return {
          ...prev,
          toDelete: prev.toDelete.filter(filename => filename !== (image.filename || image.url)),
          existing: [...prev.existing, image]
        };
      } else {
        // If not marked, add to toDelete and remove from existing
        return {
          ...prev,
          toDelete: [...prev.toDelete, image.filename || image.url],
          existing: prev.existing.filter((img) => img.id !== image.id)
        };
      }
    });
  };

  console.log("Images to delete:", images.toDelete);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      if (e.dataTransfer.files.length > 1) {
        toast.error("Please drop only one image at a time. Upload images one by one.", {
          style: {
            background: '#ef4444',
            color: 'white',
            border: 'none',
          }
        });
        return;
      }
  
      const file = e.dataTransfer.files[0];
      const newImage = {
        file,
        preview: URL.createObjectURL(file),
      };
  
      setImages((prev) => ({
        ...prev,
        new: [...prev.new, newImage],
      }));
    }
  };

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
  }

  // Description validation
  if (!formData.description.trim()) {
    errors.push({
      field: 'description',
      message: 'Description is required'
    });
  } else if (formData.description.trim().length < 10) {
    errors.push({
      field: 'description',
      message: 'Description must be at least 10 characters'
    });
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
  if (images.existing.length === 0 && images.new.length === 0) {
    errors.push({
      field: 'images',
      message: 'At least one image is required'
    });
  }

  return errors;
};
const getImageUrl = (filename: string): string => {
  return `http://localhost:3000/upload/${filename}`;
};

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const errors = validateForm();
  if (errors.length > 0) {
    toast.error(errors[0].message, {
      style: {
        background: '#ef4444',
        color: 'white',
        border: 'none',
      }
    });
    const firstErrorField = document.getElementById(errors[0].field);
    if (firstErrorField) {
      firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return;
  }

  setIsSubmitting(true);

  try {
    const token = sessionStorage.getItem("authToken");
    if (!token) {
      toast.error("Authentication required");
      setIsSubmitting(false);
      return;
    }

    const formDataToSend = new FormData();

    // Append all text fields
    Object.entries(formData).forEach(([key, value]) => {
      formDataToSend.append(key, value);
    });

    // Append images to delete (if any)
    if (images.toDelete.length > 0) {
      formDataToSend.append("imagesToDelete", JSON.stringify(images.toDelete));
    }

    // Append existing images that should be kept
    if (images.existing.length > 0) {
      formDataToSend.append(
        "existingImages",
        JSON.stringify(images.existing.map((image) => image.filename || image.url)),
      );
    }

    // Append new images
    images.new.forEach(({ file }) => {
      formDataToSend.append("images", file);
    });

    // Make the API call
    const response = await apiClient.put(`/products/${project.id}`, formDataToSend, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    const updatedProduct = response.data;

    // Update all relevant state without refreshing
    setLocalProject((prev: ProjectType) => ({
      ...prev,
      title: updatedProduct.title,
      description: updatedProduct.description,
      category_id: updatedProduct.category_id,
      lien_web: updatedProduct.lien_web,
      lien_insta: updatedProduct.lien_insta,
      lien_fb: updatedProduct.lien_fb,
      lien_linkedin: updatedProduct.lien_linkedin,
      lien_tiktok: updatedProduct.lien_tiktok,
      nmr_phone: updatedProduct.nmr_phone,
      images: updatedProduct.images || prev.images,
      Category: updatedProduct.Category || prev.Category,
    }));

    // Update images state
   // Update images state
setImages({
  existing: updatedProduct.images 
    ? updatedProduct.images.map((img: string | ProductImage, index: number) => ({
        id: `existing-${index}`,
        url: typeof img === 'string' 
          ? `http://localhost:3000/upload/${img.replace(/\\/g, "/")}`
          : img.url || `http://localhost:3000/upload/${img.filename?.replace(/\\/g, "/")}`,
        filename: typeof img === 'string' ? img : img.filename || img.url,
      }))
    : [],
  new: [],
  toDelete: [],
});

    // Update category title if changed
    if (updatedProduct.Category?.name) {
      setCategoryTitle(updatedProduct.Category.name);
    }

    // Update main image if needed
    if (updatedProduct.images && updatedProduct.images.length > 0) {
      setMainImage(0);
    }
    router.refresh();
    toast.success("Product updated successfully!");
    setOpen(false);
  } catch (error: any) {
    console.error("Update error:", error);
    const errorMessage = "Failed to update product";
    toast.error(errorMessage);
  } finally {
    setIsSubmitting(false);
  }
};

  useEffect(() => {
    setLocalProject(project);
  }, [project]);

  const resetForm = () => {
    if (!open) {
      setFormData({
        title: "",
        description: "",
        category_id: "",
        lien_web: "",
        lien_insta: "",
        lien_fb: "",
        lien_linkedin: "",
        lien_tiktok: "",
        nmr_phone: "",
      })

      setImages({
        existing: [],
        new: [],
        toDelete: [],
      })
    }
  }

  const formatUrl = (url: string) => {
    if (!url) return '#';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.startsWith('www.')) return `https://${url}`;
    return `https://${url}`;
  };

  // Check if social media links exist
  const hasSocialLinks =
    project.lien_web || project.lien_insta || project.lien_fb || project.lien_linkedin || project.nmr_phone

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">

        <Link
          href="/profile"
          className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 mb-8"
        >
          <ChevronLeft className="h-4 w-4 mr-1 " />
          Back to Profile
        </Link>
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
              <h1 className="text-3xl font-medium text-gray-900">{project.title}</h1>
              <Badge
                variant="outline"
                className="text-xs font-medium uppercase tracking-wider text-white bg-[#cbac70]"
              >
                <Tag className="h-3 w-3 mr-1" />
                {categoryTitle}
              </Badge>
            </div>

          <div className="flex gap-2 self-start">
            <Button variant="outline" size="sm" className="flex items-center gap-1.5 h-9 hover:cursor-pointer" onClick={() => setOpen(true)}>
              <Edit className="h-4 w-4" />
              <span>Edit</span>
            </Button>

            <Button
              onClick={handleDelete}
              variant="outline"
              size="sm"
              className="flex items-center gap-1.5 h-9 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Image Gallery - 3 columns on large screens */}
        <div className="md:w-1/2 flex flex-col">
        <img
         src={getImageUrl(project.images[mainImage])}
          alt={project.title}
          className="w-full h-96 object-contain rounded-lg mb-4"
        />
        <div className="flex gap-2  justify-center overflow-x-auto ">
          {project.images.map((image: string, index: number) => (
            <img
              key={index}
              src={getImageUrl(image)}
              alt={`${project.title} - ${index + 1}`}
              className={`w-20 h-20 object-cover rounded-md cursor-pointer hover:opacity-80 ${mainImage === index ? 'ring-2 ring-[#cbac70]' : ''}`}
              onClick={() => setMainImage(index)}
            />
          ))}
        </div>
      </div>

        {/* Product Details - 2 columns on large screens */}
        <div className="md:w-1/2 flex flex-col">
          {/* Description */}
          <div
            className="text-gray-700 prose prose-gray max-w-none text-justify font-sans text-base mb-8"
            
            // Safely render HTML content by sanitizing it to prevent XSS attacks.
            dangerouslySetInnerHTML={{
              __html: sanitizeHtml(project.description || "") // Ensure `project.description` is sanitized before rendering.
            }}
          />

          {/* Social Links */}
          {hasSocialLinks && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Contact & Social</h3>
              <div className="flex flex-wrap gap-3">
                {project.lien_web && (
                 <a
                 href={project.lien_web.startsWith('http') ? project.lien_web : `https://${project.lien_web}`}
                 target="_blank"
                 rel="noopener noreferrer"
                 className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 text-sm hover:bg-gray-200 transition-colors"
               >
                 <Globe className="h-4 w-4" />
                 <span>Website</span>
               </a>
                )}
               {project.lien_insta && (
  <a
    href={formatUrl(project.lien_insta)}
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 text-sm hover:bg-gray-200 transition-colors"
  >
    <Instagram className="h-4 w-4" />
    <span>Instagram</span>
  </a>
)}

{project.lien_fb && (
  <a
    href={formatUrl(project.lien_fb)}
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 text-sm hover:bg-gray-200 transition-colors"
  >
    <Facebook className="h-4 w-4" />
    <span>Facebook</span>
  </a>
)}

{project.lien_linkedin && (
  <a
    href={formatUrl(project.lien_linkedin)}
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 text-sm hover:bg-gray-200 transition-colors"
  >
    <Linkedin className="h-4 w-4" />
    <span>LinkedIn</span>
  </a>
)}

{project.nmr_phone && (
  <a
    href={`tel:${project.nmr_phone}`}
    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 text-sm hover:bg-gray-200 transition-colors"
  >
    <PhoneCall className="h-4 w-4" />
    <span>{project.nmr_phone}</span>
  </a>
)}
              </div>
            </div>
          )}

          {/* Engagement Stats */}
          <div className="pt-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-1.5">
                <Heart className={cn("h-5 w-5", isLiked ? "fill-red-500 text-red-500" : "text-gray-400")} />
                <span className="text-sm font-medium">{likeCount}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MessageSquare className="h-5 w-5 text-gray-400" />
                <span className="text-sm font-medium">{comments.length}</span>
              </div>
              <button className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700">
                <Share2 className="h-5 w-5" />
                <span className="text-sm font-medium">Share</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className="mt-12">
  <Separator className="my-6" />
  <h2 className="text-xl font-medium text-gray-900 mb-6">Comments ({comments.length})</h2>

  <div className="space-y-6">
    {visibleComments.length > 0 ? (
      visibleComments.map((item: any, index: number) => (
        <div key={index} className="flex gap-4">
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
            <CircleUser className="h-6 w-6 text-gray-500" />
          </div>
          <div className="flex-1 flex gap-12">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-gray-900">{item.user}</span>
                <span className="text-xs text-gray-500">{item.created_at}</span>
              </div>
              <p className="text-gray-700">{item.text}</p>
            </div>
            {/* Delete button - always visible for comment owner/admin */}
            <button
              onClick={() => setCommentToDelete(item.id)}
              className="text-red-500 hover:text-red-700 hover:cursor-pointer"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      ))
    ) : (
      <div className="text-center py-8">
        <MessageSquare className="h-8 w-8 text-gray-300 mx-auto mb-2" />
        <p className="text-gray-500">No comments yet</p>
      </div>
    )}
  </div>

  {/* Comment Delete Confirmation Dialog */}

  {/* Pagination */}
  {(page > 1 || comments.length > visibleComments.length) && (
    <div className="flex justify-between mt-6">
      {page > 1 && (
        <Button variant="ghost" size="sm" onClick={loadOlderComments} className="flex items-center gap-1">
          <ChevronLeft className="h-4 w-4" />
          <span>Previous comments</span>
        </Button>
      )}
      {comments.length > page * COMMENTS_PER_PAGE && (
        <Button variant="ghost" size="sm" onClick={loadMoreComments} className="flex items-center gap-1 ml-auto">
          <span>More comments</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  )}
</div>

      {/* Update Dialog */}
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
                      className="hidden"
                      onChange={handleImageUpload}
                      multiple={false}
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

                  {/* Existing Images */}
                  {images.existing.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Existing Images</Label>
                      <div className="grid grid-cols-3 gap-3">
                        {images.existing.map((image) => (
                          <div
                            key={image.id}
                            className="relative group aspect-square rounded-md overflow-hidden bg-gray-100"
                          >
                            <img
                              src={image.url || "/placeholder.svg"}
                              alt="Product"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveExistingImage(image)}
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

                  {/* New Images */}
                  {images.new.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">New Images</Label>
                      <div className="grid grid-cols-3 gap-3">
                        {images.new.map((image, index) => (
                          <div
                            key={index}
                            className="relative group aspect-square rounded-md overflow-hidden bg-gray-100"
                          >
                            <img
                              src={image.preview || "/placeholder.svg"}
                              alt={`Preview ${index}`}
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
                </div>

                {/* Right Column - Form Fields */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title 
                    <span className="text-red-500 font-medium "> *</span>
                    </Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Product title"
                      className="w-full"
                    />
                    {validateForm().some(e => e.field === 'title') && (
    <p className="text-sm text-red-500">
      {validateForm().find(e => e.field === 'title')?.message}
    </p>
  )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description
                    <span className="text-red-500 font-medium "> *</span>
                    </Label>
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
                      <div className="flex items-center">
                        <Globe className="h-4 w-4 text-gray-500 mr-2" />
                        <Input
                          name="lien_web"
                          value={formData.lien_web}
                          onChange={handleInputChange}
                          placeholder="Website URL"
                        />
                      </div>
                      <div className="flex items-center">
                        <Instagram className="h-4 w-4 text-gray-500 mr-2" />
                        <Input
                          name="lien_insta"
                          value={formData.lien_insta}
                          onChange={handleInputChange}
                          placeholder="Instagram URL"
                        />
                      </div>
                      <div className="flex items-center">
                        <Facebook className="h-4 w-4 text-gray-500 mr-2" />
                        <Input
                          name="lien_fb"
                          value={formData.lien_fb}
                          onChange={handleInputChange}
                          placeholder="Facebook URL"
                        />
                      </div>
                      <div className="flex items-center">
                        <Linkedin className="h-4 w-4 text-gray-500 mr-2" />
                        <Input
                          name="lien_linkedin"
                          value={formData.lien_linkedin}
                          onChange={handleInputChange}
                          placeholder="LinkedIn URL"
                        />
                      </div>
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
                      Updating...
                    </>
                  ) : (
                    "Update Product"
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
      <CustomConfirmDialog
        isOpen={showConfirmDialog}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowConfirmDialog(false)}
        message="Are you sure you want to delete this product?"
      />

<Dialog open={!!commentToDelete} onOpenChange={(open) => !open && setCommentToDelete(null)}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Delete Comment</DialogTitle>
    </DialogHeader>
    <p className="text-gray-700">Are you sure you want to delete this comment? This action cannot be undone.</p>
    <DialogFooter>
      <Button variant="outline" onClick={() => setCommentToDelete(null)}>
        Cancel
      </Button>
      <Button 
        variant="destructive" 
        onClick={() => {
          if (commentToDelete) {
            handleDeleteComment(commentToDelete);
          }
        }}
      >
        Delete
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
    </div>
  )
}
