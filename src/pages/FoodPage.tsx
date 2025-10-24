import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import foodImage from "@/assets/pahadi-food.jpg";

const FoodPage = () => {
  const stapleDishes = [
    {
      name: "Kafuli",
      category: "Main Course",
      description: "A nutritious green curry made from spinach and fenugreek leaves, tempered with local spices and ghee. Rich in iron and deeply satisfying."
    },
    {
      name: "Bhatt ki Churkani",
      category: "Dal",
      description: "Black soybean dal cooked to perfection with traditional Pahadi spices, offering protein-rich comfort in every spoonful."
    },
    {
      name: "Chainsoo",
      category: "Dal",
      description: "Black gram dal roasted and ground into a thick, flavorful paste, then cooked with aromatic spices. A protein powerhouse."
    },
    {
      name: "Jhangora ki Kheer",
      category: "Dessert",
      description: "Sweet pudding made from barnyard millet, milk, and jaggery. A healthy, gluten-free dessert cherished across generations."
    }
  ];

  const streetFood = [
    {
      name: "Aloo ke Gutke",
      description: "Crispy baby potatoes tossed with coriander, red chili, and local spices. The ultimate Pahadi snack."
    },
    {
      name: "Singori",
      description: "Mawa wrapped in maalu leaf, a traditional sweet with subtle flavors and aromatic presentation."
    },
    {
      name: "Bal Mithai",
      description: "The iconic chocolate-brown sweet coated with white sugar balls, originating from Almora. A must-try!"
    },
    {
      name: "Arsa",
      description: "Deep-fried rice flour and jaggery delicacy, crispy on the outside and soft inside, made during festivals."
    }
  ];

  const regionalSpecialties = [
    {
      region: "Garhwal",
      dishes: ["Phaanu (mixed lentil curry)", "Kandalee ka Saag (a rare famine food)", "Gahat ki Dal (horse gram)"]
    },
    {
      region: "Kumaon",
      dishes: ["Dubuk (dal-based gravy)", "Ras (black dal soup)", "Bhang ki Chutney (hemp seed chutney)"]
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative h-96 flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${foodImage})` }}
        >
          <div className="absolute inset-0 bg-secondary/75"></div>
        </div>
        <div className="relative z-10 text-center px-4">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">Food Trails</h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Authentic Pahadi cuisine, from mountains to your plate
          </p>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <p className="text-lg text-center text-foreground/80 leading-relaxed mb-8">
            Uttarakhand's cuisine is a celebration of simplicity, nutrition, and local ingredients. Shaped by the harsh 
            mountain climate, our food emphasizes sustenance and warmth. From protein-rich dals to iron-packed greens, 
            every dish tells a story of survival, tradition, and love passed down through generations.
          </p>
          <p className="text-lg text-center text-foreground/80 leading-relaxed">
            The cuisine varies between Garhwal and Kumaon, each region adding its unique touch while sharing common threads 
            of minimal spice, maximum nutrition, and deep respect for seasonal produce.
          </p>
        </div>
      </section>

      {/* Staple Dishes */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-primary mb-12 text-center">Staple Dishes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {stapleDishes.map((dish, index) => (
              <Card key={index} className="hover:shadow-xl transition-all border-l-4 border-l-accent">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-2xl text-primary">{dish.name}</CardTitle>
                    <Badge variant="secondary">{dish.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground/80 leading-relaxed">{dish.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Street Food */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-primary mb-12 text-center">Street Food Favorites</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {streetFood.map((item, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg text-secondary">{item.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-foreground/80">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Regional Specialties */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-primary mb-12 text-center">Regional Specialties</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {regionalSpecialties.map((region, index) => (
              <Card key={index} className="hover:shadow-xl transition-all">
                <CardHeader className="bg-muted/50">
                  <CardTitle className="text-3xl text-primary">{region.region}</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <ul className="space-y-3">
                    {region.dishes.map((dish, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-accent font-bold">•</span>
                        <span className="text-foreground/80">{dish}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Food Philosophy */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <Card className="border-2 border-primary/20 shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl text-primary">The Pahadi Food Philosophy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-foreground/80 leading-relaxed">
              <p>
                <strong className="text-primary">Seasonal Eating:</strong> We eat what the mountains provide in each season. 
                Summer brings fresh greens, monsoon offers mushrooms, and winter stores include dried vegetables and grains.
              </p>
              <p>
                <strong className="text-primary">Minimal Waste:</strong> Every part of produce is used. Radish leaves become 
                saag, leftover rice transforms into bhaat, and nothing goes to waste in Pahadi kitchens.
              </p>
              <p>
                <strong className="text-primary">Slow Cooking:</strong> Traditional dishes are cooked on wood fires for hours, 
                infusing deep flavors and retaining maximum nutrition.
              </p>
              <p>
                <strong className="text-primary">Community Sharing:</strong> Food is never just sustenance—it's connection. 
                Every festival, wedding, and celebration centers around sharing traditional meals with loved ones.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* City Food Trails */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-primary mb-12 text-center">Must-Visit Food Destinations</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow border-t-4 border-t-secondary">
              <CardHeader>
                <CardTitle className="text-2xl text-primary">Dehradun</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground/80 mb-4">
                  Paltan Bazaar for street food, traditional mithai shops, and authentic Garhwali restaurants.
                </p>
                <Badge>Capital City Flavors</Badge>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow border-t-4 border-t-secondary">
              <CardHeader>
                <CardTitle className="text-2xl text-primary">Almora</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground/80 mb-4">
                  Home of Bal Mithai and Singori. Visit Lala Bazaar for authentic Kumaoni snacks and sweets.
                </p>
                <Badge>Sweet Capital</Badge>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow border-t-4 border-t-secondary">
              <CardHeader>
                <CardTitle className="text-2xl text-primary">Nainital</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground/80 mb-4">
                  Mall Road eateries, Tibetan momos, and local bakeries serving fusion Pahadi cuisine.
                </p>
                <Badge>Hill Station Treats</Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FoodPage;
