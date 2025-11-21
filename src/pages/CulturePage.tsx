import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useSiteImages } from "@/hooks/useSiteImages";
import folkDanceImageFallback from "@/assets/folk-dance.jpg";
import folkDanceImageOptimized from "@/assets/folk-dance-optimized.webp";
import aipanPatternFallback from "@/assets/aipan-pattern.jpg";
import aipanPatternOptimized from "@/assets/aipan-pattern-optimized.webp";

const CulturePage = () => {
  const { getImage } = useSiteImages();
  const folkDanceImage = getImage('folk-dance', folkDanceImageFallback);
  const aipanPattern = getImage('aipan-pattern', aipanPatternFallback);

  const festivals = [
    {
      name: "Harela",
      description: "A harvest festival celebrating the bounty of nature, where people plant seeds and distribute fresh crops as blessings."
    },
    {
      name: "Phool Dei",
      description: "Children welcome spring by placing flowers at doorsteps, receiving blessings and sweets from elders."
    },
    {
      name: "Ghughutiya",
      description: "Celebrated to honor crows as messengers, with sweet delicacies shaped like birds offered to nature."
    },
    {
      name: "Nanda Devi Raj Jat",
      description: "A grand pilgrimage to honor Goddess Nanda Devi, featuring a magnificent procession through the mountains."
    }
  ];

  const folkArts = [
    {
      name: "Chholiya Dance",
      description: "A traditional sword dance performed during weddings, showcasing valor and celebration."
    },
    {
      name: "Jhora",
      description: "A group dance where men and women hold hands in a circle, celebrating community and harvest."
    },
    {
      name: "Langvir Nritya",
      description: "An acrobatic dance performed on long bamboo poles, demonstrating skill and courage."
    }
  ];

  const crafts = [
    {
      name: "Aipan Art",
      description: "Sacred floor and wall paintings created with rice paste, featuring geometric patterns and religious symbols for auspicious occasions."
    },
    {
      name: "Ringaal Craft",
      description: "Traditional bamboo weaving to create baskets, mats, and decorative items, a sustainable art form passed through generations."
    },
    {
      name: "Wool Weaving",
      description: "Hand-woven woolen shawls, blankets, and carpets using traditional looms, keeping Pahadi families warm in harsh winters."
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative h-96 flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${folkDanceImageOptimized}), url(${folkDanceImage})` }}
        >
          <div className="absolute inset-0 bg-primary/70"></div>
        </div>
        <div className="relative z-10 text-center px-4">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">Culture & Traditions</h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Discover the timeless heritage of Garhwal and Kumaon
          </p>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <p className="text-lg text-center text-foreground/80 leading-relaxed">
            Uttarakhand's culture is a beautiful tapestry woven with ancient traditions, vibrant festivals, soulful music, 
            and exquisite crafts. The Garhwal and Kumaon regions preserve centuries-old customs that celebrate nature, 
            community, and spirituality. Every festival, dance, and art form tells a story of our deep connection with 
            the Himalayas.
          </p>
        </div>
      </section>

      {/* Festivals */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-primary mb-12 text-center">Sacred Festivals</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {festivals.map((festival, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow border-l-4 border-l-secondary">
                <CardHeader>
                  <CardTitle className="text-2xl text-primary">{festival.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground/80">{festival.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Separator className="my-8" />

      {/* Folk Music & Dance */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-primary mb-12 text-center">Folk Music & Dance</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {folkArts.map((art, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-xl text-secondary">{art.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground/80">{art.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Separator className="my-8" />

      {/* Traditional Attire */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-primary mb-12 text-center">Traditional Attire</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl text-accent">Pichora</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground/80">
                  A traditional headscarf worn by women, often adorned with intricate embroidery and colorful borders, symbolizing grace and cultural identity.
                </p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl text-accent">Ghagra-Choli</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground/80">
                  The traditional dress featuring a long skirt, blouse, and dupatta, decorated with mirror work and embroidery, worn during festivals and celebrations.
                </p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl text-accent">Pahadi Topi</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground/80">
                  The iconic Pahadi cap worn by men, made of wool or cloth with a distinctive fold, representing mountain pride and cultural heritage.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Separator className="my-8" />

      {/* Handicrafts */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-primary mb-12 text-center">Traditional Handicrafts</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {crafts.map((craft, index) => (
              <Card key={index} className="hover:shadow-xl transition-all border-2 hover:border-primary/30">
                <CardHeader>
                  <CardTitle className="text-2xl text-primary">{craft.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground/80 leading-relaxed">{craft.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Aipan Showcase */}
          <div className="mt-16 rounded-2xl overflow-hidden shadow-xl">
            <picture>
              <source srcSet={aipanPatternOptimized} type="image/webp" />
              <img 
                src={aipanPattern} 
                alt="Traditional Aipan Art Pattern" 
                loading="lazy"
                width="1200"
                height="256"
                className="w-full h-64 object-cover"
              />
            </picture>
            <div className="bg-card p-8">
              <h3 className="text-2xl font-bold text-primary mb-4">The Art of Aipan</h3>
              <p className="text-foreground/80 leading-relaxed">
                Aipan is more than decoration—it's a prayer, a blessing, and a celebration of life. Created during festivals, 
                weddings, and sacred ceremonies, these intricate patterns connect us to our ancestors and the divine. Each symbol 
                carries meaning: the lotus for purity, the swastika for prosperity, and geometric forms representing cosmic balance.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CulturePage;
