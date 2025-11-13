import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSiteImages } from "@/hooks/useSiteImages";
import folkDanceImageFallback from "@/assets/folk-dance.jpg";
import foodImageFallback from "@/assets/pahadi-food.jpg";
import mountainImageFallback from "@/assets/hero-mountains.jpg";
import aipanImageFallback from "@/assets/aipan-pattern.jpg";

const GalleryPage = () => {
  const [activeTab, setActiveTab] = useState("all");
  const { getImage } = useSiteImages();
  
  const folkDanceImage = getImage('folk-dance', folkDanceImageFallback);
  const foodImage = getImage('pahadi-food', foodImageFallback);
  const mountainImage = getImage('hero-mountains', mountainImageFallback);
  const aipanImage = getImage('aipan-pattern', aipanImageFallback);

  // Placeholder gallery items - in production, these would be fetched from Instagram or a CMS
  const galleryItems = [
    { id: 1, category: "festivals", image: folkDanceImage, title: "Traditional Jhora Dance" },
    { id: 2, category: "food", image: foodImage, title: "Authentic Pahadi Thali" },
    { id: 3, category: "nature", image: mountainImage, title: "Himalayan Sunrise" },
    { id: 4, category: "handicrafts", image: aipanImage, title: "Traditional Aipan Art" },
    { id: 5, category: "festivals", image: folkDanceImage, title: "Festival Celebration" },
    { id: 6, category: "food", image: foodImage, title: "Local Delicacies" },
    { id: 7, category: "nature", image: mountainImage, title: "Mountain Valley" },
    { id: 8, category: "handicrafts", image: aipanImage, title: "Ringaal Craft" },
  ];

  const filteredItems = activeTab === "all" 
    ? galleryItems 
    : galleryItems.filter(item => item.category === activeTab);

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
            <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-5 mb-12">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="festivals">Festivals</TabsTrigger>
              <TabsTrigger value="food">Food</TabsTrigger>
              <TabsTrigger value="nature">Nature</TabsTrigger>
              <TabsTrigger value="handicrafts">Crafts</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredItems.map((item) => (
                  <Card 
                    key={item.id} 
                    className="overflow-hidden group cursor-pointer hover:shadow-xl transition-all duration-300"
                  >
                    <div className="relative aspect-square overflow-hidden">
                      <img 
                        src={item.image} 
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                        <p className="text-white font-medium">{item.title}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {filteredItems.length === 0 && (
                <div className="text-center py-16 text-muted-foreground">
                  <p className="text-lg">No images in this category yet.</p>
                  <p className="text-sm mt-2">Check back soon or follow us on Instagram for updates!</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
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
