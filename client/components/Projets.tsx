"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import ProjectCard from "@/components/ProjectCard";
import GSAPWrapper from "@/components/GSAPWrapper";
import apiClient from "@/lib/apiClient"; 

export default function Example() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await apiClient.get("/products/active-products");

        console.log("res:", res);

        const data = res.data;
        console.log("data:", data);

        setPosts(data.slice(-3));
      } catch (err) {
        console.error("Failed to fetch products", err);
        setPosts([]);
      }
    };

    fetchProjects();
  }, []);
  return (
    <div className="bg-white py-18">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Title and Description */}
        <GSAPWrapper animationType="fadeIn" delay={0.2} duration={1}>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-[#042e62] sm:text-4xl">
              Projets récents
            </h2>
            <p className="mt-8 text-lg leading-8 font-sans text-gray-600">
              Parcourez les projets récents à la pointe de l'excellence scientifique.
            </p>
          </div>
        </GSAPWrapper>

        {/* Project Cards */}
        <GSAPWrapper animationType="slideUp" delay={0.4} stagger={0.2}>
         <div className="mx-auto mt-16 grid max-w-6xl grid-cols-1 justify-center gap-x-8 gap-y-20 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post: any) => (
              <ProjectCard key={post.id} post={post} />
            ))}
          </div>

          <div className="mt-18 flex justify-center">
            <Button className="rounded-md bg-[#cbac70] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#042e62]">
              <Link href="/all-projects">
                Voir Plus <span className="ml-1">→</span>
              </Link>
            </Button>
          </div>

        </GSAPWrapper>

      
      </div>
    </div>
  );
}