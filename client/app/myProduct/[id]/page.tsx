// app/myProduct/[id]/page.tsx
import { notFound } from "next/navigation";
import ProductDetails from "./myProductDetails";
import apiClient from "@/lib/apiClient";

async function getProject(id: string) {
  try {
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching project:", error);
    return null;
  }
}

export default async function ProjectPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  // Destructure first to avoid direct params access
  const { id } = params;

  if (!id) {
    notFound();
  }

  const project = await getProject(id);

  if (!project) {
    notFound();
  }

  return <ProductDetails project={project} />;
}

export const dynamic = 'force-dynamic';