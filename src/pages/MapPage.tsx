import React from "react";
import { Helmet } from "react-helmet";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { DiscoveryMap } from "@/components/maps/DiscoveryMap";

const MapPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Explore Uttarakhand Map | Villages, Stays & Attractions | Hum Pahadi Haii</title>
        <meta
          name="description"
          content="Interactive map of Uttarakhand featuring villages, homestays, travel packages, tourist attractions, and local experiences. Discover the hidden gems of Kumaon, Garhwal, and Jaunsari regions."
        />
        <meta
          name="keywords"
          content="Uttarakhand map, villages map, Kumaon map, Garhwal map, homestays Uttarakhand, travel packages map, tourist attractions Uttarakhand"
        />
        <link rel="canonical" href="https://humpahadihaii.in/map" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Explore Uttarakhand Map",
            description:
              "Interactive discovery map of Uttarakhand with villages, stays, packages, and attractions",
            url: "https://humpahadihaii.in/map",
            isPartOf: {
              "@type": "WebSite",
              name: "Hum Pahadi Haii",
              url: "https://humpahadihaii.in",
            },
          })}
        </script>
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Navigation />

        <main className="flex-1">
          {/* Hero Section */}
          <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-8 md:py-12">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl">
                <h1 className="text-3xl md:text-4xl font-bold mb-4">
                  Explore Uttarakhand
                </h1>
                <p className="text-lg text-muted-foreground">
                  Discover the villages, stays, experiences, and hidden gems across Kumaon, Garhwal, and Jaunsari regions. 
                  Use the interactive map to find your next adventure.
                </p>
              </div>
            </div>
          </section>

          {/* Map Section */}
          <section className="container mx-auto px-4 py-6">
            <DiscoveryMap
              height="calc(100vh - 300px)"
              showFilters={true}
              showSearch={true}
              showLegend={true}
              className="rounded-lg overflow-hidden shadow-lg border"
            />
          </section>

          {/* SEO Content Section (for crawlers) */}
          <section className="container mx-auto px-4 py-8">
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <h2>Discover Uttarakhand Through Our Interactive Map</h2>
              <p>
                Our interactive map brings together all the destinations, experiences, and accommodations 
                in Uttarakhand. Whether you're looking for a peaceful village homestay in the Kumaon hills, 
                an adventure trek in Garhwal, or authentic cultural experiences in Jaunsari regions - 
                find it all in one place.
              </p>
              
              <h3>What You Can Explore</h3>
              <ul>
                <li><strong>Villages:</strong> Discover remote and scenic villages across all 13 districts</li>
                <li><strong>Stays & Homestays:</strong> Find authentic accommodations run by local families</li>
                <li><strong>Travel Packages:</strong> Browse curated travel experiences and trek packages</li>
                <li><strong>Tourist Attractions:</strong> Explore temples, waterfalls, viewpoints, and more</li>
                <li><strong>Local Events:</strong> Stay updated on festivals and cultural events</li>
              </ul>

              <h3>Featured Regions</h3>
              <div className="grid md:grid-cols-3 gap-6 not-prose">
                <div className="p-4 rounded-lg bg-muted">
                  <h4 className="font-semibold mb-2">Kumaon</h4>
                  <p className="text-sm text-muted-foreground">
                    Nainital, Almora, Pithoragarh, Bageshwar, Champawat, Udham Singh Nagar
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-muted">
                  <h4 className="font-semibold mb-2">Garhwal</h4>
                  <p className="text-sm text-muted-foreground">
                    Dehradun, Haridwar, Pauri, Tehri, Uttarkashi, Chamoli, Rudraprayag
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-muted">
                  <h4 className="font-semibold mb-2">Jaunsari</h4>
                  <p className="text-sm text-muted-foreground">
                    Chakrata, Kalsi, Deoban and the Jaunsar-Bawar tribal region
                  </p>
                </div>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default MapPage;
