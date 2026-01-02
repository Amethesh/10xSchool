import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/Home/Navbar";
import GalleryGrid from "./GalleryGrid";
import Footer from "@/components/Home/Footer";

export const revalidate = 0; // Ensure fresh data on every request

export default async function GalleryPage() {
  // Define the type locally since it's not in the generated types yet
  type GalleryItem = {
    id: string;
    title: string;
    description: string;
    images: string[];
    created_at: string;
  };

  const supabase = await createClient();

  // Fetch data from the 'gallary' table
  const { data, error } = await (supabase as any)
    .from("gallery")
    .select("*")
    .order("created_at", { ascending: false });

  const galleries = data as GalleryItem[] | null;

  return (
    <main className="min-h-screen relative font-sans">
      <Navbar />
      
      {/* Header Section */}
      <section className="pt-32 pb-10 px-4">
        <div className="max-w-7xl mx-auto text-center">
            {/* Banner Style Heading */}
            <div className="inline-block relative mb-8">
              <h1 className="text-4xl md:text-6xl font-bold text-black relative z-10 px-4">
                Our Gallery
              </h1>
              <div className="absolute -bottom-2 left-0 right-0 h-4 bg-[#bfecff] -rotate-1 z-0 border-2 border-black rounded-full"></div>
            </div>
            
            <p className="text-gray-600 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              Explore our quests, achievements, and epic moments captured at The 10X School.
            </p>
        </div>
      </section>

      {/* Gallery Content */}
      <section className="px-4 pb-20">
        <div className="max-w-7xl mx-auto">
          {error ? (
            <div className="text-center py-20 bg-red-50 rounded-xl border-2 border-red-500">
              <h3 className="text-red-500 text-xl font-bold mb-2">Error Loading Data</h3>
              <p className="text-red-400">{error.message}</p>
            </div>
          ) : !galleries || galleries.length === 0 ? (
            <div className="text-center py-20 bg-[#bfecff]/20 rounded-xl border-2 border-black border-dashed">
              <h3 className="text-black text-xl font-bold">No Artifacts Found</h3>
              <p className="text-gray-500 mt-2">The gallery is currently empty. Check back later!</p>
            </div>
          ) : (
            <GalleryGrid items={galleries} />
          )}
        </div>
      </section>
      <Footer/>
    </main>
  );
}
