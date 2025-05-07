// components/AddProductDialog.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CirclePlus } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Category {
  id: string;
  name: string;
}

interface ProductForm {
  title: string;
  description: string;
  category_id: string;
  images: File[];
  lien_web?: string;
  lien_insta?: string;
  lien_fb?: string;
  lien_linkedin?: string;
  lien_tiktok?: string;
  nnn_phone?: string;
}

export default function AddProductDialog({ onProductAdded }: { onProductAdded: () => void }) {
  const [form, setForm] = useState<ProductForm>({
    title: "",
    description: "",
    category_id: "",
    images: [],
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Mock categories initially
    setCategories([
      { id: "1", name: "Fashion" },
      { id: "2", name: "Tech" },
      { id: "3", name: "Home" },
    ]);
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newImages = Array.from(e.target.files);
      setForm((prev) => ({ ...prev, images: [...prev.images, ...newImages] }));
      
      // Clear the file input after selection
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleChange = (key: keyof ProductForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleRemoveImage = (index: number) => {
    const updatedImages = form.images.filter((_, i) => i !== index);
    setForm((prev) => ({ ...prev, images: updatedImages }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("description", form.description);
    formData.append("category_id", form.category_id);
    form.images.forEach((file) => formData.append("images", file));

    if (form.lien_web) formData.append("lien_web", form.lien_web);
    if (form.lien_insta) formData.append("lien_insta", form.lien_insta);
    if (form.lien_fb) formData.append("lien_fb", form.lien_fb);
    if (form.lien_linkedin) formData.append("lien_linkedin", form.lien_linkedin);
    if (form.lien_tiktok) formData.append("lien_tiktok", form.lien_tiktok);
    if (form.nnn_phone) formData.append("nnn_phone", form.nnn_phone);

    try {
      const token = sessionStorage.getItem("authToken");
      const res = await fetch("http://localhost:5000/products", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (res.ok) {
        onProductAdded();
        // Reset form after successful submission
        setForm({
          title: "",
          description: "",
          category_id: "",
          images: [],
          lien_web: "",
          lien_insta: "",
          lien_fb: "",
          lien_linkedin: "",
          lien_tiktok: "",
          nnn_phone: "",
        });
      } else {
        console.error("Error adding product");
      }
    } catch (err) {
      console.error("Error submitting product:", err);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-[#cbac70] hover:bg-black text-white flex items-center gap-2">
          Add Product <CirclePlus className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
          <DialogDescription>Fill in the details below to add a new product.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[
            ["Title", "title", "text"],
            ["Description", "description", "textarea"],
            ["Website URL", "lien_web"],
            ["Instagram URL", "lien_insta"],
            ["Facebook URL", "lien_fb"],
            ["LinkedIn URL", "lien_linkedin"],
            ["TikTok URL", "lien_tiktok"],
            ["Phone Number", "nnn_phone", "number"],
          ].map(([label, key, type = "text"]) => (
            <div className="col-span-1 sm:col-span-4 sm:grid sm:grid-cols-4 items-center gap-4" key={key as string}>
              <Label className="col-span-1">{label}</Label>
              <div className="col-span-3">
                {type === "textarea" ? (
                  <Textarea 
                    value={(form as any)[key] || ""} 
                    onChange={(e) => handleChange(key as keyof ProductForm, e.target.value)} 
                  />
                ) : (
                  <Input
                    type={type}
                    value={(form as any)[key] || ""}
                    onChange={(e) => handleChange(key as keyof ProductForm, e.target.value)}
                  />
                )}
              </div>
            </div>
          ))}

          <div className="col-span-1 sm:col-span-4 sm:grid sm:grid-cols-4 items-center gap-4">
            <Label className="col-span-1">Category</Label>
            <Select 
              value={form.category_id}
              onValueChange={(value) => handleChange("category_id", value)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="col-span-1 sm:col-span-4 sm:grid sm:grid-cols-4 items-center gap-4">
            <Label className="col-span-1">Images</Label>
            <div className="col-span-3 space-y-2">
              <Input 
                ref={fileInputRef}
                type="file" 
                multiple 
                onChange={handleImageChange} 
              />
              <p className="text-sm text-muted-foreground">
                You can select multiple images at once or add them one by one
              </p>
            </div>
          </div>

          {form.images.length > 0 && (
            <div className="col-span-1 sm:col-span-4 space-y-2">
              <Label>Selected Images ({form.images.length})</Label>
              <div className="flex flex-col gap-2">
                {form.images.map((image: File, index: number) => (
                  <div key={index} className="flex items-center justify-between bg-gray-100 px-4 py-2 rounded-md">
                    <span className="text-sm truncate">
                      {image.name} ({Math.round(image.size / 1024)} KB)
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="text-red-500 text-xl"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="col-span-4 flex justify-end mt-4">
            <Button type="submit" className="bg-[#cbac70] hover:bg-black text-white">
              Submit
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}