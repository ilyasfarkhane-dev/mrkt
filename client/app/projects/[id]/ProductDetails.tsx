"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { sanitizeHtml } from "@/lib/sanitize";
import { toast } from "sonner";
import apiClient from "@/lib/apiClient";
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button";
import ProjectCard from "@/components/ProjectCard";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import UserBadge from "@/components/UserBadge";
import {
  Heart, MessageCircle, Share2, Facebook, 
  Twitter, Instagram, Link as LinkIcon, PhoneCall, ChevronLeft, Tag, Globe, Linkedin, CircleUser
} from "lucide-react";
import Image from "next/image";

interface RelatedProduct {
  id: string;
  title: string;
  image: string | null;
  seller?: {
    name: string;
  };
}

export default function ProductDetails({ project }: { project: any }) {
  const [mainImage, setMainImage] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<any[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [commentsBatch, setCommentsBatch] = useState(0);
  const commentsRef = useRef<HTMLDivElement>(null);
  
  const COMMENTS_PER_PAGE = 3;
  const categoryTitle = project.Category?.name || "Autre";

  // Fetch likes
  useEffect(() => {
    const fetchLikeStatus = async () => {
      try {
        // Always fetch like count (public data)
        const likesResponse = await apiClient.get(`/likes/product/${project.id}`);
        setLikeCount(likesResponse.data.likeCount || 0);
        
        // Only check if user liked if logged in
        const token = sessionStorage.getItem("authToken");
        if (token) {
          const checkResponse = await apiClient.get(`/likes/check/${project.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setIsLiked(checkResponse.data.liked || false);
        } else {
          setIsLiked(false);
        }
      } catch (error: any) {
        console.error("Failed to fetch like status:", error?.response?.data || error.message);
      }
    };
  
    fetchLikeStatus();
  }, [project.id]);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        const response = await apiClient.get(`/products/${project.id}/related`);
        setRelatedProducts(response.data.related || response.data || []);
      } catch (error) {
        console.error("Failed to fetch related products", error);
        setRelatedProducts([]);
      }
    };
    
    if (project.id) {
      fetchRelatedProducts();
    }
  }, [project.id]);

  const handleShare = async () => {
    try {
      const shareData = {
        title: project.title,
        text: project.description ? `${project.title}: ${project.description.substring(0, 100)}...` : project.title,
        url: typeof window !== 'undefined' ? window.location.href : '',
      };
  
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        toast.success('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }
      toast.error('Failed to share');
    }
  };

  // Fetch comments
  const fetchComments = async () => {
    try {
      const response = await apiClient.get(`/comments/product/${project.id}`);
      const data = response.data;
      setComments(data);
    } catch (error: any) {
      console.error("Failed to fetch comments:", error?.response?.data || error.message);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [project.id]);

  const handleLike = async () => {
    const token = sessionStorage.getItem("authToken");
    if (!token) {
      toast("Please login to like");
      return;
    }
  
    try {
      const newIsLiked = !isLiked;
      setIsLiked(newIsLiked);
      setLikeCount(newIsLiked ? likeCount + 1 : likeCount - 1);

      await apiClient.post(
        "/likes/toggle",
        { product_id: project.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const checkResponse = await apiClient.get(`/likes/check/${project.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const likesResponse = await apiClient.get(`/likes/product/${project.id}`);
      
      setIsLiked(checkResponse.data.liked);
      setLikeCount(likesResponse.data.likeCount);
      
    } catch (error) {
      setIsLiked(!isLiked);
      setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
      toast.error("Failed to update like");
    }
  };

  const getImageUrl = (filename: string): string => {
    return `http://localhost:3000/upload/${filename}`;
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = sessionStorage.getItem("authToken");
    if (!token) {
      toast.error("You must be logged in to comment.");
      return;
    }

    try {
      await apiClient.post(
        `/comments`,
        { content: comment, product_id: project.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComment("");
      setCommentsBatch(0); // Reset to first page
      fetchComments();
      toast.success("Comment added!");
    } catch (error: any) {
      console.error("Failed to submit comment:", error?.response?.data || error.message);
      toast.error("Failed to add comment");
    }
  };

  const formatUrl = (url: string | undefined | null): string | undefined => {
    if (!url) return undefined;
    if (url.match(/^(http|https):\/\//)) return url;
    if (url.match(/^www\./)) return `https://${url}`;
    if (url.match(/^@/)) return `https://instagram.com/${url.replace('@', '')}`;
    return `https://${url}`;
  };

  const handlePageChange = (newBatch: number) => {
    setCommentsBatch(newBatch);
    commentsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const hasSocialLinks = project.lien_web || project.lien_insta || 
                        project.lien_fb || project.lien_linkedin || 
                        project.nmr_phone;

  return (
    <div className="container mx-auto px-4 pb-14">
      <Link href="/all-projects" className="flex items-center text-sm text-gray-600 hover:text-gray-900 py-8 font-bold max-w-36">
        <ChevronLeft className="h-4 w-4 mr-1" />
        Back to Products
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <div className="space-y-4">
          {project.images && project.images.length > 0 ? (
            <>
              <div className="relative rounded-lg border" style={{ height: '500px' }}>
                <Image
                  src={getImageUrl(project.images[mainImage])}
                  alt={project.title}
                  width={400}
                  height={400}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="grid grid-cols-4 gap-2 justify-items-center">
                {project.images.map((image: string, index: number) => (
                  <div
                    key={index}
                    className="relative aspect-square overflow-hidden rounded-lg border cursor-pointer hover:opacity-80"
                    onClick={() => setMainImage(index)}
                  >
                    <img
                      src={getImageUrl(image)}
                      alt={`${project.title} - ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="relative aspect-square overflow-hidden rounded-lg border flex items-center justify-center bg-gray-100">
              <div className="text-center p-8">
                <div className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                <p className="text-gray-500">No images available</p>
              </div>
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <div>
            <div className="flex flex-col gap-y-4">
              <UserBadge project={project} />
              <h1 className="text-3xl font-bold text-[#042e62]">{project.title}</h1>
            </div>
            <Badge className="mt-2 bg-[#cbac70]">
              <Tag className="h-3 w-3 mr-1" />
              {project.category_name}
            </Badge>
          </div>

          <div className="prose max-w-none text-gray-700" 
               dangerouslySetInnerHTML={{ __html: sanitizeHtml(project.description || "") }} />

          {/* Social Interactions */}
          <div className="flex flex-col md:flex-row md:items-center justify-between border-t border-b py-4 gap-4 md:gap-0">
  {/* Interaction Buttons */}
  <div className="flex items-center space-x-6">
    <button onClick={handleLike} className="flex items-center space-x-1">
      <Heart className={`h-5 w-5 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
      <span>{likeCount}</span>
    </button>
    <button className="flex items-center space-x-1">
      <MessageCircle className="h-5 w-5" />
      <span>{comments.length}</span>
    </button>
    <button 
      onClick={handleShare} 
      className="flex items-center space-x-1 hover:text-blue-500 hover:cursor-pointer"
    >
      <Share2 className="h-5 w-5" />
      <span>Share</span>
    </button>
  </div>

  {/* Social Media Links - will stack below interaction buttons on mobile */}
  {hasSocialLinks && (
    <div className="flex flex-wrap items-center gap-3">
      {project.lien_web && (
        <a 
          href={formatUrl(project.lien_web) || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full p-1.5 bg-gray-100 hover:bg-gray-200"
        >
          <Globe className="h-4 w-4" />
        </a>
      )}
      {project.lien_fb && (
        <a 
          href={formatUrl(project.lien_fb) || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full p-1.5 bg-gray-100 hover:bg-gray-200"
        >
          <Facebook className="h-4 w-4" />
        </a>
      )}
      {project.lien_insta && (
        <a 
          href={formatUrl(project.lien_insta) || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full p-1.5 bg-gray-100 hover:bg-gray-200"
        >
          <Instagram className="h-4 w-4" />
        </a>
      )}
      {project.lien_linkedin && (
        <a 
          href={formatUrl(project.lien_linkedin) || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full p-1.5 bg-gray-100 hover:bg-gray-200"
        >
          <Linkedin className="h-4 w-4" />
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
  )}
</div>

          {/* Comments Section */}
          <div className="space-y-4" ref={commentsRef}>
            <h3 className="text-lg font-semibold">Comments ({comments.length})</h3>
            
            <form onSubmit={handleCommentSubmit} className="flex gap-3">
              <Avatar>
                <AvatarFallback>
                  <CircleUser />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full min-h-[100px] p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Write your comment here..."
                />
                <Button type="submit" className="ml-auto bg-[#cbac70] hover:bg-[#042e62] hover:cursor-pointer">
                  Post Comment
                </Button>
              </div>
            </form>

            <div className="pt-6">
  {/* Comments List */}
  <div className="space-y-4 mb-4">
    {comments.length > 0 ? (
      comments
        .slice(commentsBatch * COMMENTS_PER_PAGE, (commentsBatch + 1) * COMMENTS_PER_PAGE)
        .map((comment, index) => (
          <div key={index} className="flex gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-white border border-gray-200">
                <CircleUser className="h-4 w-4 text-gray-500" />
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="font-medium text-sm">
                  {comment.user_name || `User ${comment.user_id}`}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(comment.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm mt-1 text-gray-700">{comment.content}</p>
            </div>
          </div>
        ))
    ) : (
      <p className="text-sm text-gray-500 text-center py-4">No comments yet</p>
    )}
  </div>

  {/* Minimal Pagination */}
  {comments.length > COMMENTS_PER_PAGE && (
    <div className="flex justify-center gap-4 text-sm">
      <button
        onClick={() => handlePageChange(commentsBatch - 1)}
        disabled={commentsBatch === 0}
        className={`${commentsBatch === 0 ? 'text-gray-300' : 'text-gray-600 hover:text-[#cbac70]'} hover:cursor-pointer`}
      >
        ← Previous
      </button>
      <span className="text-gray-500">
        {commentsBatch + 1}/{Math.ceil(comments.length / COMMENTS_PER_PAGE)}
      </span>
      <button
        onClick={() => handlePageChange(commentsBatch + 1)}
        disabled={commentsBatch >= Math.ceil(comments.length / COMMENTS_PER_PAGE) - 1}
        className={`${commentsBatch >= Math.ceil(comments.length / COMMENTS_PER_PAGE) - 1 ? 'text-gray-300' : 'text-gray-600 hover:text-[#cbac70]'}`}
      >
        Next →
      </button>
    </div>
  )}
</div>
          </div>
        </div>
      </div>

      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-6">Related Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {Array.isArray(relatedProducts) && relatedProducts.length > 0 ? (
            relatedProducts.map((relatedProduct) => (
              <ProjectCard 
                key={relatedProduct.id} 
                post={{
                  ...relatedProduct,
                  id: relatedProduct.id,
                  title: relatedProduct.title,
                  image: getImageUrl(relatedProduct.image),
                  price: relatedProduct.price,
                  category: relatedProduct.category_name || categoryTitle,
                  seller: relatedProduct.seller 
                }}
              />
            ))
          ) : (
            <p className="text-gray-500 col-span-full text-center py-8">
              No related products found
            </p>
          )}
        </div>
      </div>
    </div>
  );
}