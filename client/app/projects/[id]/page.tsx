// app/projects/[id]/page.tsx
import { notFound } from "next/navigation";
import ProductDetails from "./ProductDetails";
import apiClient from "@/lib/apiClient";

async function getProject(id: string) {
  try {
    const response = await apiClient.get(`/products/${id}`, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch project:", error);
    return null;
  }
}
export default async function ProjectPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  // Alternative approach - create a new object first
  const { id } = params;
  const projectId = id;
  const project = await getProject(projectId);

  if (!project) {
    notFound();
  }

  return <ProductDetails project={project} />;
}