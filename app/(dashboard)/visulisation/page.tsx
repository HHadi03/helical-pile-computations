import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { getSoils } from "@/lib/getSoils";
import SoilDepthChart from "./graph"; // Adjust the path as needed

export default async function VisualisationPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/");
  }

  // Fetch soil data
  const soilsData = await getSoils();

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-6">Soil Data Visualization</h1>
      
    </main>
  );
}