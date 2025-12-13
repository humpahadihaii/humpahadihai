import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Database } from "@/integrations/supabase/types";

type GalleryItem = Database["public"]["Tables"]["gallery_items"]["Row"];

const GalleryPage = () => {
  const [activeTab, setActiveTab] = useState("all");

  const { data: galleryItems, isLoading } = useQuery({
    queryKey: ["gallery-items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gallery_items")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as GalleryItem[];
    },
  });

  const categories = Array.from(new Set(galleryItems?.map(item => item.category.toLowerCase()) || []));

  const filteredItems = activeTab === "all" 
    ? galleryItems 
    : galleryItems?.filter(item => item.category.toLowerCase() === activeTab);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="py-16 px-4 bg-gradient-to-b from-muted/50 to-background">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-primary mb-6">Photo Gallery</h1>
          <p className="text-xl text-foreground/80 mb-8">
            Visual stories from the heart of Uttarakhand
          </p>
          <Button size="lg" asChild className="bg-secondary hover:bg-secondary/90">
            <a href="https://instagram.com/hum_pahadi_haii" target="_blank" rel="noopener noreferrer">
              <Instagram className="mr-2 h-5 w-5" />
              Follow on Instagram
            </a>
          </Button>
        </div>
      </section>

      {/* Gallery Tabs */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-auto mb-12 overflow-x-auto">
              <TabsTrigger value="all">All</TabsTrigger>
              {categories.map((cat) => (
                <TabsTrigger key={cat} value={cat} className="capitalize">
                  {cat}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={activeTab} className="mt-8">
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[...Array(8)].map((_, i) => (
                    <Skeleton key={i} className="aspect-square" />
                  ))}
                </div>
              ) : filteredItems && filteredItems.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <p className="text-lg">No images in this category yet.</p>
                  <p className="text-sm mt-2">Check back soon or follow us on Instagram for updates!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredItems?.map((item) => (
                    <Card 
                      key={item.id} 
                      className="overflow-hidden group cursor-pointer hover:shadow-xl transition-all duration-300"
                    >
                      <div className="relative aspect-square overflow-hidden">
                        <img 
                          src={item.image_url} 
                          alt={item.title}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                          <p className="text-white font-medium">{item.title}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Related Pages - SEO Internal Linking */}
          <div className="mt-12 pt-8 border-t border-border/50">
            <h3 className="text-lg font-semibold text-foreground mb-4">Related Pages</h3>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              <Link to="/districts/pithoragarh" className="text-primary hover:text-primary/80 hover:underline text-sm">
                Pithoragarh District Culture
              </Link>
              <Link to="/districts/almora" className="text-primary hover:text-primary/80 hover:underline text-sm">
                Almora Heritage & Traditions
              </Link>
              <Link to="/culture" className="text-primary hover:text-primary/80 hover:underline text-sm">
                Traditional Kumaoni Attire
              </Link>
              <Link to="/culture" className="text-primary hover:text-primary/80 hover:underline text-sm">
                Garhwali Folk Traditions
              </Link>
              <Link to="/food" className="text-primary hover:text-primary/80 hover:underline text-sm">
                Pahadi Food Photography
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Instagram CTA */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-3xl text-center">
          <div className="bg-card rounded-2xl p-12 shadow-lg border-2 border-primary/10">
            <Instagram className="h-20 w-20 text-secondary mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-primary mb-4">See More on Instagram</h2>
            <p className="text-foreground/80 mb-6 leading-relaxed">
              Daily updates featuring Uttarakhand's festivals, food discoveries, breathtaking landscapes, 
              and stories from Pahadi life. Join our growing community of mountain lovers.
            </p>
            <Button size="lg" asChild className="bg-secondary hover:bg-secondary/90">
              <a href="https://instagram.com/hum_pahadi_haii" target="_blank" rel="noopener noreferrer">
                Follow @hum_pahadi_haii
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Hashtags */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <p className="text-sm text-muted-foreground mb-4">Popular Tags</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {['#Uttarakhand', '#PahadiCulture', '#HimalayanHeritage', '#MountainLife', '#TraditionalIndia', '#UttarakhandFood', '#CharDham', '#PahadiFood', '#IndianCulture', '#MountainMagic'].map((tag) => (
              <span key={tag} className="px-4 py-2 bg-muted rounded-full text-sm text-foreground/70">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default GalleryPage;
