import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mountain, TreePine, Footprints } from "lucide-react";
import { useSiteImages } from "@/hooks/useSiteImages";
import heroImageFallback from "@/assets/hero-mountains.jpg";

const TravelPage = () => {
  const { getImage } = useSiteImages();
  const heroImage = getImage('hero-mountains', heroImageFallback);

  const charDham = [
    {
      name: "Kedarnath",
      elevation: "3,583 m",
      description: "Sacred abode of Lord Shiva, nestled in the Garhwal Himalayas. A spiritual journey through breathtaking mountain landscapes."
    },
    {
      name: "Badrinath",
      elevation: "3,300 m",
      description: "Temple of Lord Vishnu situated between Nar and Narayan mountain ranges, one of India's most important pilgrimage sites."
    },
    {
      name: "Gangotri",
      elevation: "3,100 m",
      description: "Origin of the holy Ganges river, where devotees seek blessings at the source of India's most sacred water."
    },
    {
      name: "Yamunotri",
      elevation: "3,293 m",
      description: "Source of river Yamuna, featuring thermal springs and stunning alpine scenery along the pilgrimage route."
    }
  ];

  const hillStations = [
    {
      name: "Nainital",
      description: "Lake district surrounded by seven hills, offering boating, colonial architecture, and panoramic mountain views.",
      highlights: "Naini Lake, Mall Road, Snow View Point"
    },
    {
      name: "Mussoorie",
      description: "The Queen of Hills with waterfalls, cable car rides, and stunning valley vistas from Gun Hill.",
      highlights: "Kempty Falls, Camel's Back Road, Lal Tibba"
    },
    {
      name: "Almora",
      description: "Cultural capital with ancient temples, handicraft markets, and views of the Himalayas stretching 300 km.",
      highlights: "Kasar Devi, Bright End Corner, Chitai Temple"
    },
    {
      name: "Ranikhet",
      description: "Pine-covered ridges with army heritage, golf courses, and peaceful orchards amid mountain serenity.",
      highlights: "Chaubatia Gardens, Jhula Devi Temple, KRC Museum"
    }
  ];

  const hiddenGems = [
    {
      name: "Chopta",
      description: "Mini Switzerland of India, base camp for Tungnath temple trek, covered in alpine meadows."
    },
    {
      name: "Munsiyari",
      description: "Gateway to Milam Glacier, offering spectacular Panchachuli peak views and tribal culture."
    },
    {
      name: "Khirsu",
      description: "Untouched hamlet with 360-degree Himalayan views, apple orchards, and complete tranquility."
    },
    {
      name: "Binsar",
      description: "Wildlife sanctuary with majestic views of Nanda Devi, Trishul, and Panchachuli peaks."
    }
  ];

  const treks = [
    {
      name: "Roopkund Trek",
      difficulty: "Moderate-Difficult",
      duration: "8-9 days",
      description: "Mystery lake with ancient skeletons, passing through meadows, forests, and high-altitude landscapes."
    },
    {
      name: "Valley of Flowers",
      difficulty: "Easy-Moderate",
      duration: "6-7 days",
      description: "UNESCO World Heritage Site blooming with rare alpine flowers from July to September."
    },
    {
      name: "Har Ki Dun",
      difficulty: "Easy-Moderate",
      duration: "7-8 days",
      description: "Cradle of Gods valley trek through ancient villages, dense forests, and pristine meadows."
    },
    {
      name: "Kedarkantha",
      difficulty: "Easy-Moderate",
      duration: "6 days",
      description: "Perfect winter trek with snow-covered trails and stunning summit views of major peaks."
    }
  ];

  const wildlife = [
    {
      name: "Jim Corbett National Park",
      description: "India's oldest national park, famous for Bengal tigers, elephants, and diverse wildlife in Terai and Bhabar regions."
    },
    {
      name: "Rajaji National Park",
      description: "Elephant reserve with varied ecosystems, home to leopards, bears, and over 400 bird species."
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative h-96 flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-accent/70"></div>
        </div>
        <div className="relative z-10 text-center px-4">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">Travel & Nature</h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            From sacred shrines to hidden valleys, explore the Himalayas
          </p>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl text-center">
          <p className="text-lg text-foreground/80 leading-relaxed">
            Uttarakhand, the Land of Gods, is blessed with unparalleled natural beauty and spiritual significance. 
            From the sacred Char Dham pilgrimage to pristine trekking trails, from colonial hill stations to 
            wildlife-rich forests—every corner offers a unique experience. Whether you seek adventure, peace, 
            or divine connection, the mountains welcome you.
          </p>
        </div>
      </section>

      {/* Char Dham */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <Mountain className="h-16 w-16 text-primary mx-auto mb-4" />
            <h2 className="text-4xl font-bold text-primary mb-4">Char Dham Yatra</h2>
            <p className="text-foreground/70 max-w-2xl mx-auto">
              The four sacred shrines that mark the spiritual heartbeat of Uttarakhand
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {charDham.map((dham, index) => (
              <Card key={index} className="hover:shadow-xl transition-all border-2 hover:border-primary/30">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-2xl text-primary">{dham.name}</CardTitle>
                    <Badge variant="secondary">{dham.elevation}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground/80 leading-relaxed">{dham.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Hill Stations */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <TreePine className="h-16 w-16 text-secondary mx-auto mb-4" />
            <h2 className="text-4xl font-bold text-primary mb-4">Popular Hill Stations</h2>
            <p className="text-foreground/70 max-w-2xl mx-auto">
              Colonial charm meets Himalayan beauty in these mountain retreats
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {hillStations.map((station, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-2xl text-secondary">{station.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-foreground/80">{station.description}</p>
                  <div>
                    <Badge variant="outline" className="mr-2">Highlights:</Badge>
                    <span className="text-sm text-foreground/70">{station.highlights}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Hidden Gems */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-primary mb-12 text-center">Hidden Gems</h2>
          <p className="text-center text-foreground/70 mb-8 max-w-2xl mx-auto">
            Offbeat destinations for those seeking solitude and untouched mountain magic
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {hiddenGems.map((place, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow bg-accent/5">
                <CardHeader>
                  <CardTitle className="text-lg text-accent">{place.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-foreground/80">{place.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Treks */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <Footprints className="h-16 w-16 text-primary mx-auto mb-4" />
            <h2 className="text-4xl font-bold text-primary mb-4">Famous Treks</h2>
            <p className="text-foreground/70 max-w-2xl mx-auto">
              Challenge yourself on these iconic Himalayan trails
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {treks.map((trek, index) => (
              <Card key={index} className="hover:shadow-xl transition-all">
                <CardHeader>
                  <CardTitle className="text-2xl text-primary mb-3">{trek.name}</CardTitle>
                  <div className="flex gap-2">
                    <Badge>{trek.difficulty}</Badge>
                    <Badge variant="outline">{trek.duration}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground/80 leading-relaxed">{trek.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Wildlife */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-primary mb-12 text-center">Wildlife Sanctuaries</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {wildlife.map((park, index) => (
              <Card key={index} className="hover:shadow-xl transition-all border-l-4 border-l-accent">
                <CardHeader>
                  <CardTitle className="text-2xl text-primary">{park.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground/80 leading-relaxed">{park.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Travel Tips */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <Card className="border-2 border-primary/20 shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl text-primary">Travel Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-foreground/80">
              <p><strong className="text-primary">Best Time:</strong> March-June and September-November for most destinations. December-February for snow lovers.</p>
              <p><strong className="text-primary">Altitude Sickness:</strong> Acclimatize properly, stay hydrated, and ascend gradually for high-altitude destinations.</p>
              <p><strong className="text-primary">Respect Nature:</strong> Carry back all waste, use biodegradable products, and follow Leave No Trace principles.</p>
              <p><strong className="text-primary">Local Culture:</strong> Dress modestly at religious sites, remove shoes before entering temples, and respect local customs.</p>
              <p><strong className="text-primary">Permits:</strong> Some areas require permits. Check requirements in advance for restricted zones and national parks.</p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default TravelPage;
