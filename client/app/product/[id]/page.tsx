"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Facebook, Instagram, Phone, TwitterIcon as TikTok } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

// Sample product data based on the provided JSON
const allProducts = Array.from({ length: 15 }).map((_, index) => ({
  images: [
    "/placeholder.svg?height=400&width=600",
    "/placeholder.svg?height=400&width=600",
    "/placeholder.svg?height=400&width=600",
    "/placeholder.svg?height=400&width=600",
  ],
  id: index + 1,
  title: "Express Yourself with Our Unique Stickers!",
  description:
    "Add a splash of personality to your world with our vibrant, high-quality stickers! Perfect for decorating laptops, water bottles, phones, notebooks, and more, these stickers let you turn everyday items into a canvas for your creativity.",
  lien_web: "https://example.co",
  lien_insta: "https://example.co",
  lien_fb: "https://example.co",
  lien_linkedin: "https://example.co",
  lien_tiktok: "https://example.co",
  nmr_phone: "+212687678104",
  category: {
    id: 7,
    name: "Food",
  },
}))

function ProductCard({ product }: { product: (typeof allProducts)[0] }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex === product.images.length - 1 ? 0 : prevIndex + 1))
  }

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex === 0 ? product.images.length - 1 : prevIndex - 1))
  }

  return (
    <Card className="overflow-hidden h-full flex flex-col">
      {/* Image Carousel */}
      <div className="relative aspect-square">
        <Image
          src={product.images[currentImageIndex] || "/placeholder.svg"}
          alt={product.title}
          fill
          className="object-cover"
        />

        <div className="absolute inset-0 flex items-center justify-between p-2">
          <Button
            variant="secondary"
            size="icon"
            className="rounded-full opacity-80 hover:opacity-100"
            onClick={prevImage}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="rounded-full opacity-80 hover:opacity-100"
            onClick={nextImage}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Image Indicators */}
        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
          {product.images.map((_, index) => (
            <button
              key={index}
              className={`w-1.5 h-1.5 rounded-full ${index === currentImageIndex ? "bg-primary" : "bg-gray-300"}`}
              onClick={() => setCurrentImageIndex(index)}
            />
          ))}
        </div>
      </div>

      {/* Product Details */}
      <div className="flex flex-col flex-grow">
        <CardHeader className="p-4">
          <div className="flex justify-between items-start gap-2">
            <CardTitle className="text-lg font-bold line-clamp-2">{product.title}</CardTitle>
            <Badge variant="outline" className="shrink-0">
              {product.category.name}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-4 pt-0 flex-grow">
          <CardDescription className="text-sm text-muted-foreground mb-4 line-clamp-3">
            {product.description}
          </CardDescription>
        </CardContent>

        <CardFooter className="p-4 pt-0 flex flex-col gap-3 mt-auto">
          <Button variant="default" className="w-full">
            View Details
          </Button>

          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-1">
              <Phone className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{product.nmr_phone}</span>
            </div>

            <div className="flex items-center gap-2">
              <Link href={product.lien_insta} target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <Instagram className="h-3 w-3" />
                </Button>
              </Link>
              <Link href={product.lien_fb} target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <Facebook className="h-3 w-3" />
                </Button>
              </Link>
              <Link href={product.lien_tiktok} target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <TikTok className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </div>
        </CardFooter>
      </div>
    </Card>
  )
}

export default function ProductsList() {
  const [currentPage, setCurrentPage] = useState(1)
  const productsPerPage = 6
  const totalPages = Math.ceil(allProducts.length / productsPerPage)

  // Get current products
  const indexOfLastProduct = currentPage * productsPerPage
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage
  const currentProducts = allProducts.slice(indexOfFirstProduct, indexOfLastProduct)

  // Change page
  const goToPage = (pageNumber: number) => {
    setCurrentPage(pageNumber)
    // Scroll to top of products section
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1)
    }
  }

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1)
    }
  }

  return (
    <section className="py-12 px-4 md:px-6 lg:px-8">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Our Products</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center mt-10">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={goToPreviousPage} disabled={currentPage === 1}>
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {Array.from({ length: totalPages }).map((_, index) => {
              const pageNumber = index + 1
              // Show current page, first page, last page, and one page before and after current
              const shouldShowPage =
                pageNumber === 1 || pageNumber === totalPages || Math.abs(pageNumber - currentPage) <= 1

              // Show ellipsis for gaps
              if (!shouldShowPage) {
                // Show ellipsis only once between gaps
                if (pageNumber === 2 || pageNumber === totalPages - 1) {
                  return (
                    <span key={`ellipsis-${pageNumber}`} className="px-2">
                      ...
                    </span>
                  )
                }
                return null
              }

              return (
                <Button
                  key={pageNumber}
                  variant={currentPage === pageNumber ? "default" : "outline"}
                  size="icon"
                  onClick={() => goToPage(pageNumber)}
                  className="w-8 h-8"
                >
                  {pageNumber}
                </Button>
              )
            })}

            <Button variant="outline" size="icon" onClick={goToNextPage} disabled={currentPage === totalPages}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
