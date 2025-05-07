'use client';

import { Suspense, useRef, useEffect } from "react";
import Image from "next/image";
import HeroSection from "@/components/HeroSection";
import Noscolaborateur from "@/components/Noscolaborateurs";
import Projets from "@/components/Projets";
import Loading from "@/components/Loading";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ContactCTA from "@/components/contact-cta";


// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const collaboratorsRef = useRef<HTMLDivElement>(null);
  const projectsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize animations when component mounts
    const ctx = gsap.context(() => {
      if (!heroRef.current || !collaboratorsRef.current || !projectsRef.current) return;

      // Hero section animation
      gsap.from(heroRef.current, {
        opacity: 0,
        y: 50,
        duration: 1,
        ease: "power3.out",
      });

      // Collaborators section animation
      gsap.from(collaboratorsRef.current, {
        opacity: 0,
        y: 50,
        duration: 0.8,
        scrollTrigger: {
          trigger: collaboratorsRef.current,
          start: "top 80%",
          toggleActions: "play none none none",
        },
        delay: 0.2,
      });

      // Projects section animation
      gsap.from(projectsRef.current, {
        opacity: 0,
        y: 50,
        duration: 0.8,
        scrollTrigger: {
          trigger: projectsRef.current,
          start: "top 80%",
          toggleActions: "play none none none",
        },
        delay: 0.4,
      });

      // Animate all child elements with the .animate-item class
      const animateItems = gsap.utils.toArray(".animate-item") as HTMLElement[];
      animateItems.forEach((item, i) => {
        gsap.from(item, {
          opacity: 0,
          y: 30,
          duration: 0.6,
          delay: i * 0.1,
          scrollTrigger: {
            trigger: item,
            start: "top 90%",
            toggleActions: "play none none none",
          },
        });
      });
    });

    return () => ctx.revert(); // Cleanup
  }, []);

  return (
    <>
      <Suspense fallback={<Loading />}>
        <div ref={heroRef}>
          <HeroSection />
        </div>
      </Suspense>

      {/* Other Sections */}
      <section className="pt-0 lg:pt-12">
        <div className="container mx-auto px-4">
          <Suspense fallback={<Loading />}>
            <div ref={collaboratorsRef}>
              <Noscolaborateur />
            </div>
          </Suspense>
          
          <Suspense fallback={<Loading />}>
            <div ref={projectsRef}>
              <Projets />
            </div>
          </Suspense>
          
        </div>
      </section>
      <ContactCTA />
    </>
  );
}