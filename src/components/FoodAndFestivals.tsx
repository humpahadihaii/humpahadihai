import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Utensils, PartyPopper, Landmark, Sparkles } from "lucide-react";

interface ContentItem {
  id: string;
  title: string;
  description: string;
  image_url?: string | null;
  category: string;
}

interface FoodAndFestivalsProps {
  districtName: string;
  foodItems: ContentItem[];
  festivalItems: ContentItem[];
  cultureItems: ContentItem[];
}

const FoodAndFestivals = ({ districtName, foodItems, festivalItems, cultureItems }: FoodAndFestivalsProps) => {
  const hasContent = foodItems.length > 0 || festivalItems.length > 0 || cultureItems.length > 0;
  
  if (!hasContent) return null;

  const renderItems = (items: ContentItem[], emptyMessage: string, icon: React.ReactNode) => {
    if (items.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          {icon}
          <p className="mt-4">{emptyMessage}</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-all group">
            {item.image_url ? (
              <div className="h-40 overflow-hidden">
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
            ) : (
              <div className="h-40 bg-gradient-to-br from-primary/10 to-secondary/30 flex items-center justify-center">
                {icon}
              </div>
            )}
            <CardHeader className="pb-2">
              <CardTitle className="text-base group-hover:text-primary transition-colors">
                {item.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-3">
                {item.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="h-8 w-8 text-primary" />
          <h2 className="text-3xl font-bold">Heritage of {districtName}</h2>
        </div>
        <p className="text-muted-foreground mb-8">
          Discover the food, festivals, and cultural traditions
        </p>

        <Tabs defaultValue="food" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="food" className="flex items-center gap-2">
              <Utensils className="h-4 w-4" />
              <span className="hidden sm:inline">Local Food</span>
              <span className="sm:hidden">Food</span>
              {foodItems.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {foodItems.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="festivals" className="flex items-center gap-2">
              <PartyPopper className="h-4 w-4" />
              <span className="hidden sm:inline">Festivals</span>
              <span className="sm:hidden">Fests</span>
              {festivalItems.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {festivalItems.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="culture" className="flex items-center gap-2">
              <Landmark className="h-4 w-4" />
              <span className="hidden sm:inline">Culture</span>
              <span className="sm:hidden">Culture</span>
              {cultureItems.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {cultureItems.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="food">
            {renderItems(
              foodItems, 
              `No food items added for ${districtName} yet.`,
              <Utensils className="h-12 w-12 text-muted-foreground/30 mx-auto" />
            )}
          </TabsContent>

          <TabsContent value="festivals">
            {renderItems(
              festivalItems, 
              `No festivals added for ${districtName} yet.`,
              <PartyPopper className="h-12 w-12 text-muted-foreground/30 mx-auto" />
            )}
          </TabsContent>

          <TabsContent value="culture">
            {renderItems(
              cultureItems, 
              `No culture items added for ${districtName} yet.`,
              <Landmark className="h-12 w-12 text-muted-foreground/30 mx-auto" />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default FoodAndFestivals;
