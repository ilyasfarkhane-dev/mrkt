"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner";
import { CircleUser, User,LogOut } from "lucide-react";
import apiClient from "@/lib/apiClient";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import { useRouter } from "next/navigation";


type Category = {
  id: number;
  name: string;
};

export default function Header() {
  const [hasToken, setHasToken] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]); 
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const router = useRouter();

 
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await apiClient.get("/categories");
        setCategories(res.data);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };
  
    fetchCategories();
  }, []);

 
  useEffect(() => {
    const checkToken = () => setHasToken(!!sessionStorage.getItem("authToken"));
    checkToken();
    window.addEventListener("authChange", checkToken);
    return () => {
      window.removeEventListener("authChange", checkToken);
    };
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("authToken");
    setHasToken(false);
    router.push("/login");
  toast.success("Logged out successfully");
   
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <nav className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <Link href="/" className="flex items-center">
            <Image alt="Logo" src="/logo_univ.png" width={150} height={150} />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6 text-sm font-medium">
          <Link href="/" className="hover:text-primary transition-colors">Accueil</Link>
          <Link href="/about-us" className="hover:text-primary transition-colors">Qui sommes-nous ?</Link>
          <Link href="/all-projects" className="hover:text-primary transition-colors">Produits</Link>


          <Link href="/contact-us" className="hover:text-primary transition-colors">Contactez-nous</Link>
        </div>

        {/* Profile or Login */}
        <div className="hidden md:flex items-center space-x-4">
          {hasToken ? (
            <DropdownMenu open={isProfileMenuOpen} onOpenChange={setIsProfileMenuOpen}>

              <DropdownMenuTrigger asChild>
                <Avatar className="cursor-pointer">
                  <AvatarImage src="/profile.jpg" alt="Vendeur" />
                  <AvatarFallback>
                    <CircleUser className="text-blue-500" />
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setIsProfileMenuOpen(false)}>
                  <Link href="/profile" className="w-full flex gap-4">
                  <User className="text-black "  />
                 <span>Mon Profil</span> 
                  </Link>
                </DropdownMenuItem>
               
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="flex gap-4 cursor-pointer w-full text-red-500">
                <LogOut className="text-red-500 " />
                 <span> Se déconnecter</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button className="rounded-md bg-[#cbac70] px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#042e62]">
              <Link href="/login">Se connecter</Link>
            </Button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </Button>
        </div>
      </nav>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden px-4 py-4 space-y-3 bg-white shadow-md text-sm font-medium">
          <Link href="/" className="block hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>Accueil</Link>
          <Link href="/about-us" className="block hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>Qui sommes-nous ?</Link>
          <Link href="/all-projects" className="block hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>Produits</Link>
         
          <Link href="/contact-us" className="block hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>Contactez-nous</Link>
          {hasToken ? (
            <>
            <Separator className="mt-4" />
              <Link href="/profile" className="block hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>Mon Profil</Link>
              <Link href="/projects" className="block hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>Mes Produits</Link>
              <button onClick={() => {
                setIsMobileMenuOpen(false);
                handleLogout();
              }} className="block text-left text-red-500 w-full">Se déconnecter</button>
            </>
          ) : (
            <Link href="/login" className="block hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>Se connecter</Link>
          )}
        </div>
      )}
    </header>
  );
}
