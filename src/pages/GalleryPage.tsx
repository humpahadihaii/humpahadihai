import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Instagram, X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { Database } from "@/integrations/supabase/types";
import { Helmet } from "react-helmet";

type GalleryItem = Database["public"]["Tables"]["gallery_items"]["Row"];

const GalleryPage = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

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
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const categories = Array.from(new Set(galleryItems?.map(item => item.category.toLowerCase()) || [])).filter(cat => cat && cat.trim() !== "");

  const filteredItems = activeTab === "all" 
    ? galleryItems 
    : galleryItems?.filter(item => item.category.toLowerCase() === activeTab);

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  }, []);

  const navigateLightbox = useCallback((direction: 'prev' | 'next') => {
    if (!filteredItems) return;
    setLightboxIndex(prev => {
      if (direction === 'prev') {
        return prev === 0 ? filteredItems.length - 1 : prev - 1;
      }
      return prev === filteredItems.length - 1 ? 0 : prev + 1;
    });
  }, [filteredItems]);

  const currentLightboxItem = filteredItems?.[lightboxIndex];

  return (
    <>
      <Helmet>
        <title>Photo Gallery | Visual Stories from Uttarakhand | Hum Pahadi Haii</title>
        <meta name="description" content="Explore stunning photos from Uttarakhand - festivals, landscapes, food, and cultural heritage captured in our visual gallery." />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Hero */}
        <section className="py-12 md:py-20 px-4 bg-gradient-to-b from-primary/5 via-muted/30 to-background">
          <div className="container mx-auto max-w-4xl text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 tracking-tight">
              Photo Gallery
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Visual stories from the heart of Uttarakhand — festivals, landscapes, traditions, and everyday mountain life.
            </p>
            <Button size="lg" asChild className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white border-0 shadow-lg">
              <a href="https://instagram.com/hum_pahadi_haii" target="_blank" rel="noopener noreferrer">
                <Instagram className="mr-2 h-5 w-5" />
                Follow on Instagram
              </a>
            </Button>
          </div>
        </section>

        {/* Gallery Tabs */}
        <section className="py-8 md:py-12 px-4">
          <div className="container mx-auto max-w-7xl">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="flex justify-center mb-8">
                <TabsList className="inline-flex h-auto p-1.5 bg-muted/60 rounded-xl flex-wrap gap-1">
                  <TabsTrigger 
                    value="all" 
                    className="px-4 py-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm text-sm font-medium"
                  >
                    All Photos
                  </TabsTrigger>
                  {categories.map((cat) => (
                    <TabsTrigger 
                      key={cat} 
                      value={cat} 
                      className="px-4 py-2 rounded-lg capitalize data-[state=active]:bg-background data-[state=active]:shadow-sm text-sm font-medium"
                    >
                      {cat}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              <TabsContent value={activeTab} className="mt-0">
                {isLoading ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                    {[...Array(12)].map((_, i) => (
                      <Skeleton key={i} className="aspect-square rounded-xl" />
                    ))}
                  </div>
                ) : filteredItems && filteredItems.length === 0 ? (
                  <div className="text-center py-20 px-4">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                      <Instagram className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-lg font-medium text-foreground mb-2">No images yet</p>
                    <p className="text-sm text-muted-foreground">Check back soon or follow us on Instagram for updates!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                    {filteredItems?.map((item, index) => (
                      <Card 
                        key={item.id} 
                        className="overflow-hidden group cursor-pointer border-0 shadow-sm hover:shadow-xl transition-all duration-300 rounded-xl bg-card"
                        onClick={() => openLightbox(index)}
                      >
                        <div className="relative aspect-square overflow-hidden">
                          <img 
                            src={item.image_url} 
                            alt={item.title}
                            loading={index < 8 ? "eager" : "lazy"}
                            decoding={index < 8 ? "sync" : "async"}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          {/* Hover overlay - desktop only */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:flex flex-col justify-end p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <p className="text-white font-medium text-sm line-clamp-1">{item.title}</p>
                                {item.location && (
                                  <p className="text-white/70 text-xs mt-0.5">{item.location}</p>
                                )}
                              </div>
                              <div className="ml-2 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                <ZoomIn className="h-4 w-4 text-white" />
                              </div>
                            </div>
                          </div>
                          {/* Category badge */}
                          <div className="absolute top-2 left-2 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-md">
                            <span className="text-white text-xs font-medium capitalize">{item.category}</span>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>

            {/* Related Pages - SEO Internal Linking */}
            <div className="mt-16 pt-8 border-t border-border/50">
              <h3 className="text-base font-semibold text-foreground mb-4">Explore More</h3>
              <div className="flex flex-wrap gap-3">
                {[
                  { to: "/culture", label: "Culture & Traditions" },
                  { to: "/food", label: "Pahadi Cuisine" },
                  { to: "/districts", label: "Explore Districts" },
                  { to: "/travel-packages", label: "Travel Packages" },
                ].map(link => (
                  <Link 
                    key={link.to}
                    to={link.to} 
                    className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-full text-sm text-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Instagram CTA */}
        <section className="py-12 md:py-16 px-4 bg-gradient-to-br from-muted/50 to-background">
          <div className="container mx-auto max-w-2xl text-center">
            <div className="bg-card rounded-2xl p-8 md:p-12 shadow-lg border border-border/50">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center mx-auto mb-6">
                <Instagram className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">Follow Our Journey</h2>
              <p className="text-muted-foreground mb-6 leading-relaxed text-sm md:text-base">
                Daily updates featuring festivals, food discoveries, breathtaking landscapes, and stories from Pahadi life.
              </p>
              <Button size="lg" asChild className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white border-0">
                <a href="https://instagram.com/hum_pahadi_haii" target="_blank" rel="noopener noreferrer">
                  @hum_pahadi_haii
                </a>
              </Button>
            </div>
          </div>
        </section>

        {/* Hashtags */}
        <section className="py-10 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <p className="text-sm text-muted-foreground mb-4 font-medium">Popular Tags</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {['#Uttarakhand', '#PahadiCulture', '#HimalayanHeritage', '#MountainLife', '#PahadiFood', '#CharDham', '#IndianCulture'].map((tag) => (
                <span key={tag} className="px-3 py-1.5 bg-muted hover:bg-muted/80 rounded-full text-sm text-foreground/70 transition-colors cursor-default">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Lightbox Dialog */}
        <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
          <DialogContent className="max-w-5xl w-[95vw] h-[90vh] p-0 bg-black/95 border-0 overflow-hidden">
            <DialogTitle className="sr-only">
              {currentLightboxItem?.title || 'Gallery Image'}
            </DialogTitle>
            {currentLightboxItem && (
              <div className="relative w-full h-full flex items-center justify-center">
                {/* Close button */}
                <button 
                  onClick={() => setLightboxOpen(false)}
                  className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <X className="h-5 w-5 text-white" />
                </button>

                {/* Navigation buttons */}
                {filteredItems && filteredItems.length > 1 && (
                  <>
                    <button 
                      onClick={() => navigateLightbox('prev')}
                      className="absolute left-4 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                    >
                      <ChevronLeft className="h-6 w-6 text-white" />
                    </button>
                    <button 
                      onClick={() => navigateLightbox('next')}
                      className="absolute right-4 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                    >
                      <ChevronRight className="h-6 w-6 text-white" />
                    </button>
                  </>
                )}

                {/* Image */}
                <img 
                  src={currentLightboxItem.image_url} 
                  alt={currentLightboxItem.title}
                  className="max-w-full max-h-[80vh] object-contain"
                />

                {/* Caption */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                  <h3 className="text-white font-semibold text-lg">{currentLightboxItem.title}</h3>
                  {currentLightboxItem.location && (
                    <p className="text-white/70 text-sm mt-1">{currentLightboxItem.location}</p>
                  )}
                  {filteredItems && filteredItems.length > 1 && (
                    <p className="text-white/50 text-xs mt-2">
                      {lightboxIndex + 1} of {filteredItems.length}
                    </p>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default GalleryPage;
