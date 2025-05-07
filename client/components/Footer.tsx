import Link from "next/link"
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="w-full border-t bg-background">
      <div className="container flex flex-col items-center gap-8 py-8 md:py-12 px-4 md:px-6">
        {/* Contact section - centered */}
        <div className="space-y-3 text-center">
          <h3 className="text-base font-medium md:text-lg mb-6">Contact Us</h3>
          <ul className="flex flex-col lg:flex-row items-center justify-content gap-2 lg:gap-12">
            <li className="flex items-center justify-center gap-2">
              <Mail className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm text-muted-foreground">info@example.com</span>
            </li>
            <li className="flex items-center justify-center gap-2">
              <Phone className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm text-muted-foreground">+1 (555) 123-4567</span>
            </li>
            <li className="flex items-center justify-center gap-2">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm text-muted-foreground">123 Main St, City, Country</span>
            </li>
          </ul>
        </div>

        {/* Social media links - centered */}
        <div className="flex items-center justify-center gap-6">
          <Link href="#" className="text-muted-foreground hover:text-foreground">
            <Facebook className="h-5 w-5 text-[#cbac70] hover:text-[#042e62]" />
            <span className="sr-only">Facebook</span>
          </Link>
          <Link href="#" className="text-muted-foreground hover:text-foreground">
            <Twitter className="h-5 w-5 text-[#cbac70] hover:text-[#042e62]" />
            <span className="sr-only">Twitter</span>
          </Link>
          <Link href="#" className="text-muted-foreground hover:text-foreground">
            <Instagram className="h-5 w-5 text-[#cbac70] hover:text-[#042e62]" />
            <span className="sr-only">Instagram</span>
          </Link>
          <Link href="#" className="text-muted-foreground hover:text-foreground">
            <Linkedin className="h-5 w-5 text-[#cbac70] hover:text-[#042e62]" />
            <span className="sr-only">LinkedIn</span>
          </Link>
        </div>

        {/* Copyright - centered */}
        <div className="pt-4 border-t w-full text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} UNIVMARKET. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}