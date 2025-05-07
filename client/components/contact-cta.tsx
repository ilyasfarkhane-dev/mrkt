import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function ContactCTA() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-[#cbac70]">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight text-[#042e62]">Ready to get in touch?</h2>
            <p className="mx-auto max-w-[700px] text-gray-700 md:text-xl/relaxed">
              We're here to help with any questions you might have about our services.
            </p>
          </div>
          <div className="space-x-4">
            <Button asChild size="lg" className="px-8 bg-[#042e62]  hover:bg-black">
              <Link href="/contact-us">Contact Us</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
