"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Heart,
  MessageSquare,
  Phone,
  Globe,
  Instagram,
  Facebook,
  Linkedin,
  Music,
  X,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react"
import {sanitizeHtml} from "@/lib/sanitize"

interface Product {
  id: number
  title: string
  description: string
  created_at: string
  images: string[]
  likes: number
  comments: number
  nmr_phone?: string
  lien_web?: string
  lien_insta?: string
  lien_fb?: string
  lien_linkedin?: string
  lien_tiktok?: string
  seller?: {
    name?: string
    email?: string
  }
  seller_name?: string
  seller_email?: string
  Category?: {
    name: string
  }
}

interface ProductDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedProduct: Product | null
  loading: boolean
  getImageUrl: (image: string) => string
}

export function ProductDetailDialog({
  open,
  onOpenChange,
  selectedProduct,
  loading,
  getImageUrl,
}: ProductDetailDialogProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [isImageZoomed, setIsImageZoomed] = useState(false)

  // Reset active image when product changes
  useEffect(() => {
    setActiveImageIndex(0)
    setIsImageZoomed(false)
  }, [selectedProduct])

  const nextImage = () => {
    if (!selectedProduct?.images?.length) return
    setActiveImageIndex((prev) => (prev + 1) % selectedProduct.images.length)
  }

  const prevImage = () => {
    if (!selectedProduct?.images?.length) return
    setActiveImageIndex((prev) => (prev - 1 + selectedProduct.images.length) % selectedProduct.images.length)
  }

  const toggleImageZoom = () => {
    setIsImageZoomed(!isImageZoomed)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-none  w-screen max-h-[90vh] p-0 overflow-hidden rounded-lg">
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 z-50 rounded-full bg-white/90 p-1.5 text-gray-500 shadow-sm hover:text-gray-700 transition-colors"
          aria-label="Close dialog"
        >
          <X className="h-4 w-4" />
        </button>

        {loading ? (
          <div className="p-6 space-y-6">
            <div className="flex flex-col gap-4">
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-4 w-1/3" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Skeleton className="h-[300px] w-full rounded-lg" />
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          </div>
        ) : selectedProduct ? (
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Image Gallery Section */}
            <div className="relative bg-gray-50 flex flex-col">
              <div
                className={`relative overflow-hidden transition-all duration-300 ${
                  isImageZoomed ? "cursor-zoom-out" : "cursor-zoom-in"
                }`}
                onClick={toggleImageZoom}
              >
                {selectedProduct.images && selectedProduct.images.length > 0 ? (
                  <div className="aspect-square relative">
                    <Image
                      src={getImageUrl(selectedProduct.images[activeImageIndex]) || "/placeholder.svg"}
                      alt={selectedProduct.title}
                      width={40}
                      height={40}
                      className={`w-full h-full object-contain transition-transform duration-300 ${
                        isImageZoomed ? "scale-150" : "scale-100"
                      }`}
                    />
                  </div>
                ) : (
                  <div className="aspect-square w-full flex items-center justify-center bg-gray-100 text-gray-400">
                    <span>No image available</span>
                  </div>
                )}

                {selectedProduct.images && selectedProduct.images.length > 1 && !isImageZoomed && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        prevImage()
                      }}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1.5 shadow-sm hover:bg-white transition-colors"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        nextImage()
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1.5 shadow-sm hover:bg-white transition-colors"
                      aria-label="Next image"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}
              </div>

              {selectedProduct.images && selectedProduct.images.length > 1 && !isImageZoomed && (
                <div className="p-4 overflow-x-auto">
                  <div className="flex gap-2">
                    {selectedProduct.images.map((image: string, index: number) => (
                      <button
                        key={index}
                        className={`relative flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-all ${
                          activeImageIndex === index
                            ? "border-primary ring-2 ring-primary/20"
                            : "border-transparent hover:border-gray-300"
                        }`}
                        onClick={() => setActiveImageIndex(index)}
                      >
                        <Image
                          src={getImageUrl(image) || "/placeholder.svg"}
                          alt={`${selectedProduct.title} - ${index + 1}`}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Details Section */}
            <ScrollArea className="h-[80vh] w-full lg:h-auto">
              <div className="p-6 space-y-6">
                <div>
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 leading-tight">{selectedProduct.title}</h2>
                      <div className="flex items-center gap-2 mt-2">
                       
                        <span className="text-xs text-gray-500">
                          {new Date(selectedProduct.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  
                    
                   
                  </div>

                  <div className="flex flex-wrap gap-2 mt-3">
                    {selectedProduct.Category?.name && (
                      <Badge variant="secondary" className="font-normal">
                        {selectedProduct.Category.name}
                      </Badge>
                    )}
                    <div className="flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full">
                      <Heart className="h-3 w-3" />
                      <span>{selectedProduct.likes || 0}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                      <MessageSquare className="h-3 w-3" />
                      <span>{selectedProduct.comments || 0}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                <Tabs defaultValue="description" className="w-full">
                  <TabsList className="w-full">
                    <TabsTrigger value="description" className="flex-1">
                      Description
                    </TabsTrigger>
                    <TabsTrigger value="details" className="flex-1">
                      Details
                    </TabsTrigger>
                    <TabsTrigger value="contact" className="flex-1">
                      Contact
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="description" className="pt-4">
                    <div
                      className="prose prose-sm max-w-none text-gray-700"
                      dangerouslySetInnerHTML={{
                        __html: sanitizeHtml(selectedProduct.description || "No description available"),
                      }}
                    />
                  </TabsContent>

                  <TabsContent value="details" className="pt-4">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Seller Information</h3>
                        <p className="mt-1 font-medium">
                          {selectedProduct.seller?.name || selectedProduct.seller_name || "Not specified"}
                        </p>
                        {(selectedProduct.seller?.email || selectedProduct.seller_email) && (
                          <p className="text-sm text-gray-600">
                            {selectedProduct.seller?.email || selectedProduct.seller_email}
                          </p>
                        )}
                      </div>

                      {selectedProduct.created_at && (
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Listed on</h3>
                          <p className="mt-1">
                            {new Date(selectedProduct.created_at).toLocaleDateString(undefined, {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="contact" className="pt-4">
                    <div className="space-y-4">
                      {selectedProduct.nmr_phone && (
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                          <a
                            href={`tel:${selectedProduct.nmr_phone}`}
                            className="mt-1 text-primary hover:underline flex items-center gap-1.5"
                          >
                            <Phone className="h-4 w-4" />
                            {selectedProduct.nmr_phone}
                          </a>
                        </div>
                      )}

                      {(selectedProduct.lien_web ||
                        selectedProduct.lien_insta ||
                        selectedProduct.lien_fb ||
                        selectedProduct.lien_linkedin ||
                        selectedProduct.lien_tiktok) && (
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-2">Social Links</h3>
                          <div className="flex flex-wrap gap-2">
                            {selectedProduct.lien_web && (
                              <a
                                href={selectedProduct.lien_web}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs bg-gray-100 hover:bg-gray-200 px-2.5 py-1.5 rounded-full transition-colors"
                              >
                                <Globe className="h-3 w-3" />
                                Website
                                <ExternalLink className="h-3 w-3 ml-0.5" />
                              </a>
                            )}
                            {selectedProduct.lien_insta && (
                              <a
                                href={selectedProduct.lien_insta}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs bg-pink-50 hover:bg-pink-100 text-pink-700 px-2.5 py-1.5 rounded-full transition-colors"
                              >
                                <Instagram className="h-3 w-3" />
                                Instagram
                              </a>
                            )}
                            {selectedProduct.lien_fb && (
                              <a
                                href={selectedProduct.lien_fb}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-2.5 py-1.5 rounded-full transition-colors"
                              >
                                <Facebook className="h-3 w-3" />
                                Facebook
                              </a>
                            )}
                            {selectedProduct.lien_linkedin && (
                              <a
                                href={selectedProduct.lien_linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs bg-sky-50 hover:bg-sky-100 text-sky-700 px-2.5 py-1.5 rounded-full transition-colors"
                              >
                                <Linkedin className="h-3 w-3" />
                                LinkedIn
                              </a>
                            )}
                            {selectedProduct.lien_tiktok && (
                              <a
                                href={selectedProduct.lien_tiktok}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs bg-gray-50 hover:bg-gray-100 text-gray-700 px-2.5 py-1.5 rounded-full transition-colors"
                              >
                                <Music className="h-3 w-3" />
                                TikTok
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>

                <DialogFooter className=" pt-4 border-t">
                  <Button  onClick={() => onOpenChange(false)}>
                    Close
                  </Button>
                </DialogFooter>
              </div>
            </ScrollArea>
          </div>
        ) : (
          <div className="flex justify-center items-center h-64">
            <div className="text-center space-y-2">
              <p className="text-gray-500">No product details available</p>
              <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
