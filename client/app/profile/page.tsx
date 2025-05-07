"use client"

import { useEffect, useState } from "react"
import { Bell, Facebook, Github, Instagram, Linkedin, Mail, User, Twitter, Edit, TriangleAlert } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import apiClient from "@/lib/apiClient";
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import ProductsList from "@/components/product"

interface ProfileData {
  first_name: string;
  last_name: string;
  faculte: string;
  affiliation: string;
  about: string;
  linkedin?: string;
  twitter?: string;
  github?: string;
  facebook?: string;
  instagram?: string;
  email: string;
  picture: string;
  status: boolean;
  role?: string;
  notif_read_status?: boolean;
}

export default function ProfilePage() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [showNotificationMessage, setShowNotificationMessage] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await apiClient.get("/users/profile");
  
        const data = res.data;
        const normalizedStatus =
          data.status === true || data.status === "true" || data.status === 1 || data.status === "active";
  
        setProfileData({
          ...data,
          status: normalizedStatus,
          notif_read_status: Boolean(data.notif_read_status),
        });
        setLoading(false);
      } catch (err: any) {
        setLoading(false);
        setError(err?.response?.data?.message || err.message || "Failed to fetch profile");
        console.error("Error fetching profile:", err);
      }
    };
  
    fetchProfile();
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("authToken");
    window.location.href = "/login";
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await apiClient.put("/users/profile", profileData);
  
      // إذا كان كل شيء تمام
      const updated = response.data;
      setOpen(false);
    } catch (err: any) {
      console.error("Error updating profile:", err);
      toast.error(err?.response?.data?.message || err.message || "Failed to update profile");
    }
  };
  const handleNotificationToggle = async (open: boolean) => {
    setNotificationOpen(open);
    if (open && profileData?.notif_read_status) {
      setShowNotificationMessage(true);
      const timer = setTimeout(() => setShowNotificationMessage(false), 10000);
      return () => clearTimeout(timer);
    } else {
      setShowNotificationMessage(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData((prev) => (prev ? { ...prev, [name]: value } : prev));
  };

  if (loading) return <div className="text-center py-20 text-gray-500">Loading profile...</div>;
  if (error) return (
    <div className="text-center py-20">
      <div className="text-red-500 mb-4">Oops!!! something went wrong</div>
      <Button onClick={handleLogout}>Logout and try again</Button>
    </div>
  );
  if (!profileData) return <div className="text-center py-20 text-gray-500">Loading profile...</div>;

  return (
    <div className="container mx-auto py-6 space-y-8 max-w-6xl">
      <Card>
        <CardHeader className="relative pb-0">
          <div className="h-42 w-full bg-gradient-to-r to-[#cbac70]/10 from-[#cbac70] rounded-t-lg" />
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end -mt-12 px-6">
          <div className="relative">
            <div className="h-24 w-24 rounded-full border-4 border-background bg-muted flex items-center justify-center">
              <User className="h-12 w-12 text-gray-500" />
            </div>
            <Badge
              className={`absolute bottom-0 right-0 ${
                profileData.status ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"
              } cursor-pointer`}
            >
              {profileData.status ? "Active" : "Inactive"}
            </Badge>
          </div>
            <div className="flex-1 space-y-1 ">
              <div className="flex items-center gap-2">
                <h2 className="text-3xl font-bold text-[#042e62] font-sans">{profileData.first_name} {profileData.last_name}</h2>
                <span className="text-sm text-[#042e62] font-bold font-sans">@{profileData.role} </span>
              </div>
              <div className="flex flex-col gap-2">
               <p className="text-muted-foreground font-sans mt-2">{profileData.faculte}</p>
                <p className="text-muted-foreground font-sans">{profileData.affiliation}</p>
               </div>
             
            </div>
            
            <div className="flex gap-2 sm:self-start mt-4 sm:mt-0 ">
              <DropdownMenu open={notificationOpen} onOpenChange={handleNotificationToggle}>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="relative rounded-full">
                    <Bell className="h-4 w-4" />
                    {profileData.notif_read_status && (
                      <span className="absolute -top-1 -right-1 bg-red-500 rounded-full h-2 w-2"></span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-60">
                  {profileData.notif_read_status && showNotificationMessage ? (
                    <DropdownMenuItem className="p-4 text-center text-red-500 font-sans" >
                      Please check your mail
                      <TriangleAlert className="ml-2 text-red-500" />
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem className="p-4 font-sans text-center text-gray-500">
                      No new notifications
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-1 hover:bg-[#cbac70] bg-[#042e62]">
                    <Edit className="h-4 w-4" /> Update Profile
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                    <DialogDescription>
                      Make changes to your profile here. Click save when you're done.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="first_name">First Name</Label>
                        <Input id="first_name" name="first_name" value={profileData.first_name} onChange={handleChange} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="last_name">Last Name</Label>
                        <Input id="last_name" name="last_name" value={profileData.last_name} onChange={handleChange} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="faculte">Branche</Label>
                        <Input id="faculte" name="faculte" value={profileData.faculte} onChange={handleChange} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="affiliation">Faculté</Label>
                        <Input id="affiliation" name="affiliation" value={profileData.affiliation} onChange={handleChange} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="about ">About</Label>
                      <Textarea id="about" name="about" rows={4} value={profileData.about} onChange={handleChange} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {["linkedin", "twitter", "github", "facebook", "instagram", "email"].map((field) => (
                        <div className="space-y-2" key={field}>
                          <Label htmlFor={field} className="capitalize">
                            {field}
                          </Label>
                          <Input 
                            id={field} 
                            name={field} 
                            value={profileData[field as keyof ProfileData] as string || ''} 
                            onChange={handleChange} 
                          />
                        </div>
                      ))}
                    </div>

                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                      <Button className="bg-[#042e62] hover:cursor-pointer" type="submit">Save changes</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold font-sans" >About</h3>
            <p className="text-muted-foreground font-sans">
              {profileData.about}
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold font-sans">Social Media</h3>
            <div className="flex flex-wrap gap-3">
              {profileData.linkedin && (
                <Button variant="outline" size="icon" className="rounded-full" asChild>
                  <Link href={profileData.linkedin} target="_blank">
                    <Linkedin className="h-4 w-4" />
                    <span className="sr-only">LinkedIn</span>
                  </Link>
                </Button>
              )}
              {profileData.twitter && (
                <Button variant="outline" size="icon" className="rounded-full" asChild>
                  <Link href={profileData.twitter} target="_blank">
                    <Twitter className="h-4 w-4" />
                    <span className="sr-only">Twitter</span>
                  </Link>
                </Button>
              )}
              {profileData.github && (
                <Button variant="outline" size="icon" className="rounded-full" asChild>
                  <Link href={profileData.github} target="_blank">
                    <Github className="h-4 w-4" />
                    <span className="sr-only">GitHub</span>
                  </Link>
                </Button>
              )}
              {profileData.facebook && (
                <Button variant="outline" size="icon" className="rounded-full" asChild>
                  <Link href={profileData.facebook} target="_blank">
                    <Facebook className="h-4 w-4" />
                    <span className="sr-only">Facebook</span>
                  </Link>
                </Button>
              )}
              {profileData.instagram && (
                <Button variant="outline" size="icon" className="rounded-full" asChild>
                  <Link href={profileData.instagram} target="_blank">
                    <Instagram className="h-4 w-4" />
                    <span className="sr-only">Instagram</span>
                  </Link>
                </Button>
              )}
              {profileData.email && (
                <Button variant="outline" size="icon" className="rounded-full" asChild>
                  <Link href={`mailto:${profileData.email}`}>
                    <Mail className="h-4 w-4" />
                    <span className="sr-only">Email</span>
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {profileData.role === 'seller' && (
        <Card>
          <CardHeader className="flex flex-row items-center font-sans justify-between">
            <div>
              <CardTitle>My Products</CardTitle>
              <CardDescription>Manage your product listings</CardDescription>
            </div>
            
          </CardHeader>
          <CardContent>
            <ProductsList />
          </CardContent>
        </Card>
      )}
    </div>
  )
}