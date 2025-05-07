'use client';

import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function GSAPWrapper({
  children,
  animationType = 'fadeIn',
  delay = 0,
  duration = 1,
  stagger = 0.1
}: {
  children: React.ReactNode;
  animationType?: 'fadeIn' | 'slideUp' | 'slideLeft' | 'slideRight';
  delay?: number;
  duration?: number;
  stagger?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const elements = containerRef.current.children;
    const ctx = gsap.context(() => {
      gsap.from(elements, {
        opacity: animationType === 'fadeIn' ? 0 : 1,
        y: animationType.includes('slideUp') ? 50 : animationType.includes('slideDown') ? -50 : 0,
        x: animationType.includes('slideLeft') ? 50 : animationType.includes('slideRight') ? -50 : 0,
        duration,
        delay,
        stagger,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 80%',
          toggleActions: 'play none none none'
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, [animationType, delay, duration, stagger]);

  return <div ref={containerRef}>{children}</div>;
}