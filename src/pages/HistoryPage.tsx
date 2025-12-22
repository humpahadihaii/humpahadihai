import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { 
  Mountain, 
  Crown, 
  Building, 
  Flag, 
  Heart,
  ChevronRight,
  BookOpen,
  MapPin,
  Calendar
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface HistoryEra {
  id: string;
  title: string;
  period: string;
  icon: React.ReactNode;
  description: string;
  highlights: string[];
  relatedLinks?: { label: string; path: string }[];
  accentColor: string;
}

const historyEras: HistoryEra[] = [
  {
    id: "ancient",
    title: "Ancient Uttarakhand",
    period: "Vedic Era – 7th Century CE",
    icon: <BookOpen className="h-6 w-6" />,
    description: "The land of Uttarakhand finds its earliest mentions in ancient Hindu scriptures. The region was known as Kedarkhand (Garhwal) and Manaskhand (Kumaon) in the Skanda Purana. These sacred texts describe the Himalayan settlements as the abode of gods, where sages meditated and divine rivers originated.",
    highlights: [
      "Mentioned in Vedas as the land of spiritual pursuit",
      "Kedarkhand and Manaskhand in Skanda Purana",
      "Early Himalayan settlements and ashrams",
      "Origin of sacred rivers - Ganga and Yamuna"
    ],
    relatedLinks: [
      { label: "Explore Char Dham", path: "/culture" },
      { label: "Sacred Temples", path: "/cultural/temples-shrines" }
    ],
    accentColor: "from-amber-500/20 to-orange-500/20"
  },
  {
    id: "medieval",
    title: "Medieval Period",
    period: "7th Century – 18th Century CE",
    icon: <Crown className="h-6 w-6" />,
    description: "The medieval era saw the rise of powerful dynasties that shaped the cultural and political landscape of the region. The Katyuri dynasty established the first unified kingdom, followed by the Chand dynasty in Kumaon and the Parmar dynasty in Garhwal, each leaving an indelible mark on the region's heritage.",
    highlights: [
      "Katyuri Dynasty – First unified kingdom (7th-11th century)",
      "Chand Dynasty – Rulers of Kumaon (10th-18th century)",
      "Garhwal Kingdom under Parmar rulers",
      "Construction of ancient temples and forts"
    ],
    relatedLinks: [
      { label: "Kumaon Region", path: "/districts" },
      { label: "Garhwal Heritage", path: "/districts" }
    ],
    accentColor: "from-purple-500/20 to-indigo-500/20"
  },
  {
    id: "colonial",
    title: "Colonial Era",
    period: "1815 – 1947",
    icon: <Building className="h-6 w-6" />,
    description: "Following the Anglo-Gorkha War, the British East India Company gained control of the region. The colonial period brought significant changes including the establishment of hill stations, development of infrastructure, and introduction of modern education. Despite colonial rule, the people preserved their cultural identity and traditions.",
    highlights: [
      "Treaty of Sugauli (1815) – British control begins",
      "Development of hill stations like Mussoorie and Nainital",
      "Forest conservation policies introduced",
      "Growth of education and infrastructure"
    ],
    relatedLinks: [
      { label: "Mussoorie", path: "/districts" },
      { label: "Nainital", path: "/districts" }
    ],
    accentColor: "from-slate-500/20 to-gray-500/20"
  },
  {
    id: "statehood",
    title: "Formation of Uttarakhand",
    period: "1994 – 2000",
    icon: <Flag className="h-6 w-6" />,
    description: "The demand for a separate state emerged from the need for better governance and development of the hill regions. The Uttarakhand movement, marked by peaceful protests and sacrifices, culminated in the formation of India's 27th state on November 9, 2000. Initially named Uttaranchal, it was renamed Uttarakhand in 2007.",
    highlights: [
      "Uttarakhand Kranti Dal leads the movement (1979)",
      "Muzaffarnagar incident sparks widespread protest (1994)",
      "State formation on November 9, 2000",
      "Renamed from Uttaranchal to Uttarakhand (2007)"
    ],
    relatedLinks: [
      { label: "Explore Districts", path: "/districts" }
    ],
    accentColor: "from-green-500/20 to-emerald-500/20"
  },
  {
    id: "legacy",
    title: "Cultural Legacy",
    period: "Living Heritage",
    icon: <Heart className="h-6 w-6" />,
    description: "Uttarakhand's cultural heritage is a living tapestry woven through generations. The region's identity is shaped by its languages (Garhwali, Kumaoni, Jaunsari), vibrant folk traditions, and deep spiritual significance. Known as Devbhoomi (Land of Gods), it remains a beacon of India's cultural and spiritual heritage.",
    highlights: [
      "Languages: Garhwali, Kumaoni, Jaunsari, Hindi",
      "Rich folk music and dance traditions",
      "Pilgrimage centers and sacred temples",
      "Traditional crafts and Pahadi cuisine"
    ],
    relatedLinks: [
      { label: "Culture & Traditions", path: "/culture" },
      { label: "Pahadi Food", path: "/food" },
      { label: "Folk Traditions", path: "/cultural/folk-traditions" }
    ],
    accentColor: "from-rose-500/20 to-pink-500/20"
  }
];

const HistoryPage = () => {
  return (
    <>
      <Helmet>
        <title>History of Uttarakhand | From Ancient Roots to Devbhoomi | Hum Pahadi Haii</title>
        <meta 
          name="description" 
          content="Explore the rich history of Uttarakhand from Vedic times to modern statehood. Discover the journey of Devbhoomi through ancient kingdoms, colonial era, and the statehood movement." 
        />
        <meta name="keywords" content="Uttarakhand history, Devbhoomi, Kedarkhand, Manaskhand, Katyuri dynasty, Chand dynasty, Garhwal kingdom, Uttarakhand statehood" />
        <link rel="canonical" href="https://humpahadihaii.in/history" />
      </Helmet>

      <main id="main-content" className="min-h-screen">
        {/* Hero Section */}
        <section className="relative py-16 md:py-24 bg-gradient-to-b from-primary/5 via-background to-background overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-10 left-10 w-64 h-64 bg-primary rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-10 w-48 h-48 bg-secondary rounded-full blur-3xl" />
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8" aria-label="Breadcrumb">
              <Link to="/" className="hover:text-primary transition-colors">Home</Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground font-medium">History</span>
            </nav>

            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
                <Mountain className="h-4 w-4" />
                <span className="text-sm font-medium">Devbhoomi Heritage</span>
              </div>
              
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-4">
                History of Uttarakhand
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                From ancient roots to the identity of Devbhoomi — 
                <span className="text-primary font-medium"> a journey through time</span>
              </p>
            </div>
          </div>
        </section>

        {/* Introduction */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-foreground/80 leading-relaxed">
                Nestled in the lap of the Himalayas, Uttarakhand's history is as majestic as its mountains. 
                Known as <strong className="text-primary">Devbhoomi</strong> (Land of Gods), this sacred land has been a center of 
                spirituality, culture, and resilience for millennia. From ancient Vedic references to the 
                formation of a modern state, discover the remarkable journey of Uttarakhand.
              </p>
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              {/* Timeline */}
              <div className="relative">
                {/* Vertical line - hidden on mobile */}
                <div className="hidden md:block absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/50 via-primary/30 to-primary/10" />
                
                <div className="space-y-8 md:space-y-12">
                  {historyEras.map((era, index) => (
                    <article 
                      key={era.id}
                      className="relative"
                      id={era.id}
                    >
                      {/* Timeline dot - hidden on mobile */}
                      <div className="hidden md:flex absolute left-8 -translate-x-1/2 w-4 h-4 rounded-full bg-primary border-4 border-background shadow-lg z-10" />
                      
                      <Card className={`md:ml-16 overflow-hidden transition-all duration-300 hover:shadow-lg border-l-4 border-l-primary/50`}>
                        <div className={`absolute inset-0 bg-gradient-to-br ${era.accentColor} opacity-50`} />
                        
                        <CardContent className="relative p-6 md:p-8">
                          {/* Era Header */}
                          <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-6">
                            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary shrink-0">
                              {era.icon}
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <h2 className="text-xl md:text-2xl font-display font-bold text-foreground">
                                  {era.title}
                                </h2>
                                <Badge variant="secondary" className="font-normal">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  {era.period}
                                </Badge>
                              </div>
                              
                              <p className="text-foreground/80 leading-relaxed">
                                {era.description}
                              </p>
                            </div>
                          </div>
                          
                          {/* Key Highlights */}
                          <div className="mb-6">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                              Key Highlights
                            </h3>
                            <ul className="grid sm:grid-cols-2 gap-2">
                              {era.highlights.map((highlight, i) => (
                                <li 
                                  key={i}
                                  className="flex items-start gap-2 text-sm text-foreground/80"
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                                  {highlight}
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          {/* Related Links */}
                          {era.relatedLinks && era.relatedLinks.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-4 border-t border-border/50">
                              {era.relatedLinks.map((link, i) => (
                                <Link
                                  key={i}
                                  to={link.path}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
                                >
                                  <MapPin className="h-3.5 w-3.5" />
                                  {link.label}
                                </Link>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 bg-gradient-to-b from-muted/50 to-background">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-4">
                Explore Uttarakhand's Living Heritage
              </h2>
              <p className="text-muted-foreground mb-8">
                Discover the culture, traditions, and beauty that make Uttarakhand truly special.
              </p>
              
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  to="/culture"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
                >
                  <Heart className="h-4 w-4" />
                  Explore Culture
                </Link>
                <Link
                  to="/districts"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-secondary text-secondary-foreground font-medium hover:bg-secondary/90 transition-colors"
                >
                  <MapPin className="h-4 w-4" />
                  Explore Districts
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Navigation */}
        <section className="py-12 border-t border-border/50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 text-center">
                Jump to Era
              </h3>
              <div className="flex flex-wrap justify-center gap-2">
                {historyEras.map((era) => (
                  <a
                    key={era.id}
                    href={`#${era.id}`}
                    className="px-4 py-2 rounded-full bg-muted hover:bg-muted/80 text-sm font-medium text-foreground transition-colors"
                  >
                    {era.title}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default HistoryPage;
