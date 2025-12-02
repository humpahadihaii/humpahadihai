import { Card, CardContent } from "@/components/ui/card";
import { Heart, Users, Mountain } from "lucide-react";
import { useSiteImages } from "@/hooks/useSiteImages";
import logoFallback from "@/assets/hum-pahadi-logo.jpg";

const AboutPage = () => {
  const { getImage } = useSiteImages();
  const logo = getImage('about_section_image', logoFallback);
  
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="py-20 px-4 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto max-w-4xl text-center">
          <img src={logo} alt="Hum Pahadi Haii" className="h-32 w-32 mx-auto mb-8 rounded-full shadow-xl" />
          <h1 className="text-5xl md:text-6xl font-bold text-primary mb-6">About Hum Pahadi Haii</h1>
          <p className="text-xl text-foreground/80 leading-relaxed">
            A celebration of Uttarakhand's timeless culture, vibrant traditions, and mountain spirit
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <Card className="border-2 border-primary/20 shadow-xl">
            <CardContent className="p-8 md:p-12">
              <h2 className="text-3xl font-bold text-primary mb-6 text-center">Our Mission</h2>
              <p className="text-lg text-foreground/80 leading-relaxed mb-6">
                Hum Pahadi Haii was born from a deep love for Uttarakhand and a commitment to preserving 
                its cultural heritage. In a rapidly changing world, we believe it's essential to document, 
                celebrate, and share the traditions that make our mountain homeland unique.
              </p>
              <p className="text-lg text-foreground/80 leading-relaxed mb-6">
                Our platform serves as a bridge between generations—honoring the wisdom of our elders 
                while inspiring younger Pahadis to embrace their roots. We're building a digital archive 
                of stories, recipes, art forms, and knowledge that might otherwise be lost to time.
              </p>
              <p className="text-lg text-foreground/80 leading-relaxed">
                Whether you're from Uttarakhand, have roots here, or simply love the mountains, 
                Hum Pahadi Haii welcomes you to explore, learn, and connect with our living heritage.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-primary mb-12 text-center">What We Stand For</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-8 pb-8">
                <Heart className="h-16 w-16 text-secondary mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-primary mb-4">Cultural Preservation</h3>
                <p className="text-foreground/80">
                  Documenting and safeguarding Uttarakhand's traditions, crafts, music, and oral histories 
                  for future generations.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-8 pb-8">
                <Users className="h-16 w-16 text-accent mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-primary mb-4">Community Connection</h3>
                <p className="text-foreground/80">
                  Building a global community of Pahadis who share stories, recipes, and experiences 
                  from mountain life.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-8 pb-8">
                <Mountain className="h-16 w-16 text-primary mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-primary mb-4">Authentic Storytelling</h3>
                <p className="text-foreground/80">
                  Sharing genuine, researched content that honors the truth and depth of 
                  Uttarakhand's cultural tapestry.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Regions */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-primary mb-12 text-center">Garhwal & Kumaon</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-l-4 border-l-secondary">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-secondary mb-4">Garhwal Region</h3>
                <p className="text-foreground/80 leading-relaxed mb-4">
                  The western part of Uttarakhand, known for the Char Dham pilgrimage sites, 
                  Garhwali language, and distinct folk traditions. Home to Dehradun, Haridwar, 
                  Rishikesh, and the sacred shrines of Kedarnath, Badrinath, Gangotri, and Yamunotri.
                </p>
                <p className="text-foreground/80 leading-relaxed">
                  Garhwali culture emphasizes strong community bonds, warrior heritage, and 
                  deep spiritual connection with the Himalayas.
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-accent">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-accent mb-4">Kumaon Region</h3>
                <p className="text-foreground/80 leading-relaxed mb-4">
                  The eastern region famous for hill stations like Nainital, Almora, and Ranikhet. 
                  Kumaoni language, distinct cuisine, and rich artistic traditions including Aipan 
                  art and intricate wood carving.
                </p>
                <p className="text-foreground/80 leading-relaxed">
                  Kumaon is celebrated for its serene lakes, literary heritage, and the warmth 
                  of its people who've preserved ancient customs with pride.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl font-bold text-primary mb-8 text-center">Our Story</h2>
          <div className="prose prose-lg max-w-none text-foreground/80">
            <p className="leading-relaxed mb-6">
              Hum Pahadi Haii began as an Instagram account sharing glimpses of Uttarakhand's 
              culture and traditions. What started as a personal project quickly grew into a 
              community of thousands who shared our passion for preserving Pahadi heritage.
            </p>
            <p className="leading-relaxed mb-6">
              We realized that social media posts, while engaging, couldn't capture the depth 
              and detail our culture deserves. That's why we created this comprehensive digital 
              platform—a place where stories can breathe, recipes can be detailed, and traditions 
              can be explored in full context.
            </p>
            <p className="leading-relaxed mb-6">
              Every festival we document, every recipe we share, and every craft we highlight 
              comes from authentic sources: our grandmothers' kitchens, village elders' memories, 
              traditional artisans' workshops, and scholarly research into our region's history.
            </p>
            <p className="leading-relaxed">
              We're not just creating content—we're building an archive of Pahadi identity, 
              accessible to anyone, anywhere in the world who wants to understand or reconnect 
              with Uttarakhand's soul.
            </p>
          </div>
        </div>
      </section>

      {/* Join Us */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <Card className="border-2 border-primary/20 shadow-xl bg-gradient-to-br from-primary/5 to-accent/5">
            <CardContent className="p-12">
              <h2 className="text-3xl font-bold text-primary mb-6">Join Our Community</h2>
              <p className="text-lg text-foreground/80 mb-8 leading-relaxed">
                Whether you're sharing family recipes, old photographs, village stories, or simply 
                exploring your heritage, we invite you to be part of this journey. Together, we ensure 
                that Uttarakhand's culture not only survives but thrives.
              </p>
              <p className="text-xl font-bold text-primary">
                Hum Pahadi Haii—because our mountains, our culture, our heritage matter.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
