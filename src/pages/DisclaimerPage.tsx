import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Info, Camera, Map, BookOpen, Mail } from "lucide-react";

const DisclaimerPage = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="py-16 md:py-20 px-4 bg-gradient-to-b from-primary/10 via-primary/5 to-background">
        <div className="container mx-auto max-w-4xl text-center">
          <AlertTriangle className="h-16 w-16 text-amber-500 mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Disclaimer
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Important notices about the content and information on our website.
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            Last updated: December 2024
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 md:py-16 px-4">
        <div className="container mx-auto max-w-4xl space-y-8">
          <Card>
            <CardContent className="pt-6 space-y-6">
              <div className="flex items-start gap-4">
                <Info className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-2">General Information</h2>
                  <p className="text-muted-foreground">
                    The information provided on Hum Pahadi Haii (humpahadihaii.in) is for general informational and educational purposes only. While we strive to provide accurate and up-to-date information about Uttarakhand's culture, traditions, food, and travel destinations, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, or availability of the information.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-6">
              <div className="flex items-start gap-4">
                <BookOpen className="h-6 w-6 text-emerald-500 flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-2">Cultural Content</h2>
                  <p className="text-muted-foreground">
                    Our content about Uttarakhand's culture, traditions, and heritage is compiled from various sources including community contributions, research, and local knowledge. Cultural practices and traditions may vary across different regions, villages, and families within Uttarakhand. The information presented represents common practices but may not apply universally. We encourage readers to consult local sources and community elders for specific cultural guidance.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-6">
              <div className="flex items-start gap-4">
                <Map className="h-6 w-6 text-blue-500 flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-2">Travel Information</h2>
                  <p className="text-muted-foreground mb-4">
                    Travel information on our website is provided for reference purposes only:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2">
                    <li>Road conditions, accessibility, and travel routes may change seasonally or due to weather</li>
                    <li>Hotel and accommodation details may not reflect current availability or pricing</li>
                    <li>Always verify current conditions with local tourism offices before traveling</li>
                    <li>Some areas may require permits or have restricted access</li>
                    <li>Weather in mountain regions is unpredictable; plan accordingly</li>
                    <li>We are not responsible for any travel mishaps or inconveniences</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-6">
              <div className="flex items-start gap-4">
                <Camera className="h-6 w-6 text-amber-500 flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-2">User-Submitted Content</h2>
                  <p className="text-muted-foreground">
                    Our website features content submitted by community members and contributors. While we moderate submissions before publishing, we cannot guarantee the accuracy of all user-contributed content. The views and opinions expressed in user submissions are those of the original authors and do not necessarily reflect the official position of Hum Pahadi Haii. If you find any content that is inaccurate or inappropriate, please contact us immediately.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold text-foreground mb-2">External Links</h2>
              <p className="text-muted-foreground">
                Our website may contain links to external websites that are not operated by us. We have no control over the content and practices of these sites and cannot accept responsibility for their respective privacy policies or content. Visiting external links is at your own risk.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold text-foreground mb-2">No Professional Advice</h2>
              <p className="text-muted-foreground">
                The content on this website should not be considered as professional advice. For specific questions regarding travel safety, legal matters, health considerations, or any other professional concerns, please consult appropriate qualified professionals.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-6">
              <div className="flex items-start gap-4">
                <Mail className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-2">Report Inaccuracies</h2>
                  <p className="text-muted-foreground">
                    If you notice any inaccurate, outdated, or inappropriate content on our website, please help us improve by reporting it to:
                  </p>
                  <a 
                    href="mailto:contact@humpahadihaii.in" 
                    className="text-primary font-medium hover:underline mt-2 inline-block"
                  >
                    contact@humpahadihaii.in
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default DisclaimerPage;