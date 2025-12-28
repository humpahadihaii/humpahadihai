import ContentListPage from "./ContentListPage";
import { StoryBlock } from "@/components/StoryBlock";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MapPin, Phone } from "lucide-react";

export default function TravelPage() {
  return (
    <div>
      <ContentListPage
        contentType="travel"
        title="Travel & Nature"
        description="From sacred shrines to hidden valleys, explore the Himalayas"
        heroGradient="from-primary/80 to-accent/70"
      />
      
      {/* Story Block - Nature Connection */}
      <section className="py-10 md:py-14 px-4 bg-muted/20">
        <div className="container mx-auto max-w-3xl">
          <StoryBlock theme="nature" variant="default" />
        </div>
      </section>
      
      {/* Enquiry CTA Section */}
      <section className="py-12 px-4 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto max-w-2xl text-center">
          <h3 className="font-display text-xl md:text-2xl font-semibold text-foreground mb-3">
            Planning a Trip to Uttarakhand?
          </h3>
          <p className="text-muted-foreground mb-6 text-sm md:text-base">
            Explore our curated travel packages or get in touch for personalized recommendations.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg">
              <Link to="/travel-packages">
                <MapPin className="h-4 w-4 mr-2" />
                View Travel Packages
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/contact">
                <Phone className="h-4 w-4 mr-2" />
                Contact Us
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}