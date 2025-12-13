import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Skeleton } from '@/components/ui/skeleton';
import { useCulturalContent, useCulturalContents } from '@/hooks/useCulturalContent';
import { FloatingShareButton } from '@/components/share/FloatingShareButton';
import {
  Home,
  Clock,
  IndianRupee,
  MapPin,
  Utensils,
  BookOpen,
  Lightbulb,
  AlertTriangle,
  Share2,
  ChevronRight,
  Star,
  Calendar,
  Sparkles,
  Heart,
  Info,
  TreePine,
  Users,
  ShieldCheck,
  HelpCircle,
  ExternalLink,
  Mountain,
  Compass,
} from 'lucide-react';

// Content type to schema type mapping
const SCHEMA_TYPE_MAP: Record<string, string> = {
  'local-food': 'Recipe',
  'spiritual-places': 'TouristDestination',
  'temples': 'HinduTemple',
  'nature-wildlife': 'TouristDestination',
  'festivals': 'Event',
  'traditions': 'Article',
  'handicrafts': 'Product',
  'clothing': 'Product',
  'default': 'Article',
};

// Section visibility rules by content category
const SECTION_VISIBILITY: Record<string, string[]> = {
  'local-food': ['ingredients', 'preparation_method', 'taste_description', 'consumption_occasions', 'shelf_life_tips', 'price_range'],
  'spiritual-places': ['spiritual_significance', 'local_customs', 'timings', 'entry_fee', 'how_to_reach', 'things_to_do'],
  'temples': ['spiritual_significance', 'historical_significance', 'local_customs', 'timings', 'entry_fee', 'how_to_reach'],
  'nature-wildlife': ['things_to_do', 'timings', 'entry_fee', 'how_to_reach', 'dos_and_donts'],
  'festivals': ['local_customs', 'consumption_occasions'],
  'traditions': ['local_customs', 'cultural_significance'],
  'handicrafts': ['preparation_method', 'price_range'],
  'default': ['cultural_significance', 'origin_history', 'dos_and_donts', 'fun_facts'],
};

export default function CulturalContentDetailPage() {
  const { districtSlug, categorySlug, subcategorySlug, contentSlug } = useParams<{
    districtSlug: string;
    categorySlug: string;
    subcategorySlug: string;
    contentSlug: string;
  }>();

  const { data, isLoading } = useCulturalContent(
    districtSlug,
    categorySlug,
    contentSlug,
    subcategorySlug
  );

  // Fetch related content from same category
  const { data: sameCategoryContent = [] } = useCulturalContents({
    categoryId: data?.category?.id,
    onlyPublished: true,
  });

  // Fetch related content from same district
  const { data: sameDistrictContent = [] } = useCulturalContents({
    districtId: data?.district?.id,
    onlyPublished: true,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-[400px] w-full rounded-lg mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-32 w-full rounded-lg" />
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-32 w-full rounded-lg" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-32 w-full rounded-lg" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!data?.content) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-16 text-center">
          <Mountain className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-4">Content Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The content you're looking for doesn't exist or has been moved.
          </p>
          <Button asChild>
            <Link to={`/districts/${districtSlug}`}>
              Explore {districtSlug?.replace(/-/g, ' ')}
            </Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const { content, category, subcategory, district } = data;

  // Related content - same subcategory first, then same category, then same district
  const relatedFromSubcategory = subcategory
    ? sameCategoryContent.filter((c) => c.id !== content.id && c.subcategory_id === subcategory.id).slice(0, 3)
    : [];
  
  const relatedFromCategory = sameCategoryContent
    .filter((c) => c.id !== content.id && !relatedFromSubcategory.find((r) => r.id === c.id))
    .slice(0, 3);
  
  const relatedFromDistrict = sameDistrictContent
    .filter((c) => c.id !== content.id && c.category_id !== content.category_id)
    .slice(0, 4);

  // Parse JSON fields safely
  const faqs = Array.isArray(content.faqs) ? content.faqs : [];
  const ingredients = Array.isArray(content.ingredients) ? content.ingredients : [];
  const thingsToDo = Array.isArray(content.things_to_do) ? content.things_to_do : [];
  const famousPlaces = Array.isArray(content.famous_places) ? content.famous_places : [];
  const howToReach = content.how_to_reach && typeof content.how_to_reach === 'object' ? content.how_to_reach : null;

  // Determine visible sections based on category
  const categoryKey = category.slug || 'default';
  const visibleSections = SECTION_VISIBILITY[categoryKey] || SECTION_VISIBILITY.default;

  // Auto-generate SEO if not provided
  const metaTitle = content.seo_title || 
    `${content.title} - ${subcategory?.name || category.name} in ${district.name}, Uttarakhand`;
  const metaDescription = content.seo_description || 
    content.short_intro || 
    `Discover ${content.title}, a ${subcategory?.name || category.name} from ${district.name} district in Uttarakhand. Learn about its cultural significance, history, and more.`;

  // Generate comprehensive JSON-LD schemas
  const schemaType = SCHEMA_TYPE_MAP[category.slug] || SCHEMA_TYPE_MAP.default;
  const canonicalUrl = `https://humpahadihaii.in/districts/${district.slug}/${category.slug}/${subcategory?.slug || 'item'}/${content.slug}`;

  // Main content schema
  const contentSchema: any = {
    '@context': 'https://schema.org',
    '@type': schemaType,
    name: content.title,
    description: content.short_intro || metaDescription,
    image: content.hero_image,
    url: canonicalUrl,
    ...(category.slug === 'local-food' && {
      recipeCategory: subcategory?.name || 'Traditional Food',
      recipeCuisine: 'Kumaoni',
      recipeIngredient: ingredients,
      recipeInstructions: content.preparation_method,
    }),
    ...(content.latitude && content.longitude && {
      geo: {
        '@type': 'GeoCoordinates',
        latitude: content.latitude,
        longitude: content.longitude,
      },
    }),
    isPartOf: {
      '@type': 'WebPage',
      name: `${category.name} in ${district.name}`,
      url: `https://humpahadihaii.in/districts/${district.slug}/${category.slug}`,
    },
  };

  // Breadcrumb schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://humpahadihaii.in',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: district.name,
        item: `https://humpahadihaii.in/districts/${district.slug}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: category.name,
        item: `https://humpahadihaii.in/districts/${district.slug}/${category.slug}`,
      },
      ...(subcategory ? [{
        '@type': 'ListItem',
        position: 4,
        name: subcategory.name,
        item: `https://humpahadihaii.in/districts/${district.slug}/${category.slug}/${subcategory.slug}`,
      }] : []),
      {
        '@type': 'ListItem',
        position: subcategory ? 5 : 4,
        name: content.title,
        item: canonicalUrl,
      },
    ],
  };

  // FAQ schema (if FAQs exist)
  const faqSchema = faqs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq: any) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  } : null;

  // Helper to check if a section should be visible
  const shouldShow = (field: string, value: any) => {
    if (!value) return false;
    if (Array.isArray(value) && value.length === 0) return false;
    // Always show these core sections regardless of category
    const alwaysVisible = ['cultural_significance', 'origin_history', 'dos_and_donts', 'fun_facts', 'faqs'];
    if (alwaysVisible.includes(field)) return true;
    return visibleSections.includes(field);
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href={canonicalUrl} />
        
        {/* Open Graph */}
        <meta property="og:type" content="article" />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:url" content={canonicalUrl} />
        {content.hero_image && <meta property="og:image" content={content.hero_image} />}
        <meta property="og:site_name" content="Hum Pahadi Haii" />
        <meta property="og:locale" content="en_IN" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metaTitle} />
        <meta name="twitter:description" content={metaDescription} />
        {content.hero_image && <meta name="twitter:image" content={content.hero_image} />}
        
        {/* Schemas */}
        <script type="application/ld+json">{JSON.stringify(contentSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
        {faqSchema && <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>}
      </Helmet>

      <Navigation />
      <FloatingShareButton />

      {/* Hero Section */}
      <header
        className="relative h-[450px] md:h-[500px] bg-cover bg-center"
        style={{
          backgroundImage: content.hero_image
            ? `url(${content.hero_image})`
            : 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary)/0.7) 100%)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />
        <div className="relative container mx-auto px-4 h-full flex flex-col justify-end pb-10">
          {/* Breadcrumb */}
          <Breadcrumb className="mb-4">
            <BreadcrumbList className="flex-wrap">
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/" className="text-white/70 hover:text-white flex items-center">
                    <Home className="h-4 w-4" />
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-white/50" />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to={`/districts/${district.slug}`} className="text-white/70 hover:text-white">
                    {district.name}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-white/50" />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link
                    to={`/districts/${district.slug}/${category.slug}`}
                    className="text-white/70 hover:text-white"
                  >
                    {category.name}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              {subcategory && (
                <>
                  <BreadcrumbSeparator className="text-white/50" />
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link
                        to={`/districts/${district.slug}/${category.slug}/${subcategory.slug}`}
                        className="text-white/70 hover:text-white"
                      >
                        {subcategory.name}
                      </Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                </>
              )}
              <BreadcrumbSeparator className="text-white/50" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-white font-medium">{content.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {content.is_featured && (
              <Badge className="bg-amber-500 text-black border-0">
                <Star className="h-3 w-3 mr-1" />
                Featured
              </Badge>
            )}
            <Badge variant="secondary" className="bg-white/20 text-white border-0 backdrop-blur-sm">
              {category.name}
            </Badge>
            {subcategory && (
              <Badge variant="outline" className="text-white border-white/40">
                {subcategory.name}
              </Badge>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 max-w-4xl">
            {content.title}
          </h1>

          {/* Short Intro */}
          {content.short_intro && (
            <p className="text-white/90 text-lg md:text-xl max-w-3xl leading-relaxed">
              {content.short_intro}
            </p>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Content Area */}
          <article className="lg:col-span-2 space-y-10">
            
            {/* Section 1: Cultural & Social Significance */}
            {shouldShow('cultural_significance', content.cultural_significance) && (
              <ContentSection
                icon={<Heart className="h-5 w-5" />}
                title="Cultural & Social Significance"
              >
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {content.cultural_significance}
                </p>
              </ContentSection>
            )}

            {/* Section 2: Origin & Historical Background */}
            {shouldShow('origin_history', content.origin_history) && (
              <ContentSection
                icon={<BookOpen className="h-5 w-5" />}
                title="Origin & Historical Background"
              >
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {content.origin_history}
                </p>
              </ContentSection>
            )}

            {/* Section 3: Spiritual Significance (temples, spiritual places) */}
            {shouldShow('spiritual_significance', content.spiritual_significance) && (
              <ContentSection
                icon={<Sparkles className="h-5 w-5" />}
                title="Spiritual Significance"
              >
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {content.spiritual_significance}
                </p>
              </ContentSection>
            )}

            {/* Section 4: Historical Significance */}
            {shouldShow('historical_significance', content.historical_significance) && (
              <ContentSection
                icon={<BookOpen className="h-5 w-5" />}
                title="Historical Significance"
              >
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {content.historical_significance}
                </p>
              </ContentSection>
            )}

            {/* Section 5: Ingredients (food only) */}
            {shouldShow('ingredients', ingredients) && ingredients.length > 0 && (
              <ContentSection
                icon={<Utensils className="h-5 w-5" />}
                title="Traditional Ingredients"
              >
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {ingredients.map((ingredient: string, index: number) => (
                    <li key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                      <span className="text-foreground">{ingredient}</span>
                    </li>
                  ))}
                </ul>
              </ContentSection>
            )}

            {/* Section 6: Traditional Preparation / Practices */}
            {shouldShow('preparation_method', content.preparation_method) && (
              <ContentSection
                icon={<Utensils className="h-5 w-5" />}
                title="Traditional Preparation Method"
              >
                <div className="prose max-w-none text-muted-foreground">
                  <p className="whitespace-pre-line leading-relaxed">{content.preparation_method}</p>
                </div>
              </ContentSection>
            )}

            {/* Section 7: Taste & Texture (food) */}
            {shouldShow('taste_description', content.taste_description) && (
              <ContentSection
                icon={<Sparkles className="h-5 w-5" />}
                title="Taste & Texture Profile"
              >
                <p className="text-muted-foreground leading-relaxed">{content.taste_description}</p>
              </ContentSection>
            )}

            {/* Section 8: Local Customs & Rituals */}
            {shouldShow('local_customs', content.local_customs) && (
              <ContentSection
                icon={<Users className="h-5 w-5" />}
                title="Local Customs & Rituals"
              >
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {content.local_customs}
                </p>
              </ContentSection>
            )}

            {/* Section 9: Things to Do */}
            {shouldShow('things_to_do', thingsToDo) && thingsToDo.length > 0 && (
              <ContentSection
                icon={<Compass className="h-5 w-5" />}
                title="Things to Do & Experience"
              >
                <ul className="space-y-3">
                  {thingsToDo.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-medium shrink-0 mt-0.5">
                        {index + 1}
                      </span>
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </ContentSection>
            )}

            {/* Section 10: Best Time / When to Enjoy */}
            {shouldShow('consumption_occasions', content.consumption_occasions) && (
              <ContentSection
                icon={<Calendar className="h-5 w-5" />}
                title={category.slug === 'local-food' ? 'When & How to Enjoy' : 'Best Time to Visit'}
              >
                <p className="text-muted-foreground leading-relaxed">{content.consumption_occasions}</p>
              </ContentSection>
            )}

            {/* Section 11: Famous Places to Experience */}
            {famousPlaces.length > 0 && (
              <ContentSection
                icon={<MapPin className="h-5 w-5" />}
                title="Where to Experience"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {famousPlaces.map((place: any, index: number) => (
                    <Card key={index} className="border-border/50">
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-foreground">{place.name}</h4>
                        {place.address && (
                          <p className="text-sm text-muted-foreground mt-1">{place.address}</p>
                        )}
                        {place.maps_url && (
                          <a
                            href={place.maps_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-2"
                          >
                            <MapPin className="h-3 w-3" />
                            View on Map
                          </a>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ContentSection>
            )}

            {/* Section 12: How to Reach */}
            {howToReach && (
              <ContentSection
                icon={<Compass className="h-5 w-5" />}
                title="How to Reach"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {howToReach.by_air && (
                    <InfoCard title="By Air" content={howToReach.by_air} />
                  )}
                  {howToReach.by_rail && (
                    <InfoCard title="By Rail" content={howToReach.by_rail} />
                  )}
                  {howToReach.by_road && (
                    <InfoCard title="By Road" content={howToReach.by_road} />
                  )}
                </div>
              </ContentSection>
            )}

            {/* Section 13: Do's & Don'ts */}
            {shouldShow('dos_and_donts', content.dos_and_donts) && (
              <ContentSection
                icon={<ShieldCheck className="h-5 w-5" />}
                title="Tourist Tips & Local Advice"
              >
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 rounded-lg p-5">
                  <p className="text-foreground whitespace-pre-line leading-relaxed">
                    {content.dos_and_donts}
                  </p>
                </div>
              </ContentSection>
            )}

            {/* Section 14: Fun Facts */}
            {shouldShow('fun_facts', content.fun_facts) && (
              <ContentSection
                icon={<Lightbulb className="h-5 w-5" />}
                title="Fun Facts & Folklore"
              >
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-5">
                  <p className="text-foreground whitespace-pre-line leading-relaxed">
                    {content.fun_facts}
                  </p>
                </div>
              </ContentSection>
            )}

            {/* Section 15: FAQs */}
            {faqs.length > 0 && (
              <ContentSection
                icon={<HelpCircle className="h-5 w-5" />}
                title="Frequently Asked Questions"
              >
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq: any, index: number) => (
                    <AccordionItem key={index} value={`faq-${index}`} className="border-border/50">
                      <AccordionTrigger className="text-left hover:text-primary">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent>
                        <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </ContentSection>
            )}
          </article>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Quick Info Card */}
            <Card className="sticky top-24">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Quick Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {content.price_range && (
                  <QuickInfoRow
                    icon={<IndianRupee className="h-4 w-4" />}
                    label="Price Range"
                    value={content.price_range}
                  />
                )}
                {content.timings && (
                  <QuickInfoRow
                    icon={<Clock className="h-4 w-4" />}
                    label="Timings"
                    value={content.timings}
                  />
                )}
                {content.entry_fee && (
                  <QuickInfoRow
                    icon={<IndianRupee className="h-4 w-4" />}
                    label="Entry Fee"
                    value={content.entry_fee}
                  />
                )}
                {content.shelf_life_tips && (
                  <QuickInfoRow
                    icon={<Clock className="h-4 w-4" />}
                    label="Shelf Life & Travel Tips"
                    value={content.shelf_life_tips}
                  />
                )}

                <Separator />

                <div>
                  <p className="text-sm text-muted-foreground mb-1">District</p>
                  <Link
                    to={`/districts/${district.slug}`}
                    className="font-medium text-primary hover:underline flex items-center gap-1"
                  >
                    <MapPin className="h-4 w-4" />
                    {district.name}
                  </Link>
                </div>

                {content.google_maps_url && (
                  <>
                    <Separator />
                    <Button asChild className="w-full">
                      <a
                        href={content.google_maps_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MapPin className="h-4 w-4 mr-2" />
                        View on Google Maps
                        <ExternalLink className="h-3 w-3 ml-2" />
                      </a>
                    </Button>
                  </>
                )}

                <Separator />

                <div>
                  <p className="text-sm text-muted-foreground mb-3">Share this page</p>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: content.title,
                          text: content.short_intro || metaDescription,
                          url: window.location.href,
                        });
                      } else {
                        navigator.clipboard.writeText(window.location.href);
                      }
                    }}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Now
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Related Content - Same Subcategory */}
            {relatedFromSubcategory.length > 0 && (
              <RelatedContentCard
                title={`More ${subcategory?.name || ''}`}
                items={relatedFromSubcategory}
                districtSlug={district.slug}
                categorySlug={category.slug}
                subcategorySlug={subcategory?.slug}
              />
            )}

            {/* Related Content - Same Category */}
            {relatedFromCategory.length > 0 && (
              <RelatedContentCard
                title={`More in ${category.name}`}
                items={relatedFromCategory}
                districtSlug={district.slug}
                categorySlug={category.slug}
              />
            )}
          </aside>
        </div>

        {/* Related Content from Same District */}
        {relatedFromDistrict.length > 0 && (
          <section className="mt-16 border-t pt-10">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <TreePine className="h-6 w-6 text-primary" />
              Explore More in {district.name}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {relatedFromDistrict.map((item) => (
                <RelatedCard
                  key={item.id}
                  item={item}
                  districtSlug={district.slug}
                />
              ))}
            </div>
            <div className="text-center mt-8">
              <Button variant="outline" asChild>
                <Link to={`/districts/${district.slug}`}>
                  View All in {district.name}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}

// Reusable Section Component
function ContentSection({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="scroll-mt-24" id={title.toLowerCase().replace(/\s+/g, '-')}>
      <h2 className="text-xl md:text-2xl font-bold mb-4 flex items-center gap-3 text-foreground">
        <span className="p-2 rounded-lg bg-primary/10 text-primary">{icon}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

// Quick Info Row
function QuickInfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-muted-foreground shrink-0 mt-0.5">{icon}</span>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-medium text-foreground text-sm">{value}</p>
      </div>
    </div>
  );
}

// Info Card for How to Reach
function InfoCard({ title, content }: { title: string; content: string }) {
  return (
    <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
      <h4 className="font-semibold text-foreground mb-2">{title}</h4>
      <p className="text-sm text-muted-foreground">{content}</p>
    </div>
  );
}

// Related Content Sidebar Card
function RelatedContentCard({
  title,
  items,
  districtSlug,
  categorySlug,
  subcategorySlug,
}: {
  title: string;
  items: any[];
  districtSlug: string;
  categorySlug: string;
  subcategorySlug?: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => (
          <Link
            key={item.id}
            to={`/districts/${districtSlug}/${categorySlug}/${subcategorySlug || item.subcategory?.slug || 'item'}/${item.slug}`}
            className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-muted transition-colors group"
          >
            {item.hero_image ? (
              <img
                src={item.hero_image}
                alt=""
                className="w-12 h-12 rounded-lg object-cover shrink-0"
                loading="lazy"
              />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <Mountain className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
            <div className="min-w-0">
              <p className="font-medium text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                {item.title}
              </p>
              {item.short_intro && (
                <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                  {item.short_intro}
                </p>
              )}
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}

// Related Card for bottom section
function RelatedCard({ item, districtSlug }: { item: any; districtSlug: string }) {
  // Build URL based on available data
  const categorySlug = item.category?.slug || 'culture';
  const subcategorySlug = item.subcategory?.slug || 'item';
  
  return (
    <Link to={`/districts/${districtSlug}/${categorySlug}/${subcategorySlug}/${item.slug}`}>
      <Card className="h-full hover:shadow-lg transition-all group overflow-hidden">
        {item.hero_image ? (
          <div className="aspect-video overflow-hidden">
            <img
              src={item.hero_image}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </div>
        ) : (
          <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <Mountain className="h-10 w-10 text-primary/30" />
          </div>
        )}
        <CardContent className="p-4">
          <Badge variant="secondary" className="mb-2 text-xs">
            {item.category?.name || 'Culture'}
          </Badge>
          <h3 className="font-semibold group-hover:text-primary transition-colors line-clamp-1">
            {item.title}
          </h3>
          {item.short_intro && (
            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
              {item.short_intro}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
