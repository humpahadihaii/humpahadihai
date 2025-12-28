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
  Quote,
  Music,
  Shirt,
  Landmark,
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

// Section icon mapping for cultural anchors
const SECTION_ICONS: Record<string, React.ReactNode> = {
  'festivals': <Calendar className="h-4 w-4" />,
  'language': <BookOpen className="h-4 w-4" />,
  'clothing': <Shirt className="h-4 w-4" />,
  'folk-dance': <Music className="h-4 w-4" />,
  'traditions': <Landmark className="h-4 w-4" />,
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
          <div className="max-w-3xl mx-auto space-y-6">
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="h-48 w-full rounded-lg" />
            <Skeleton className="h-32 w-full rounded-lg" />
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

  // Extract a cultural insight quote from content
  const getCulturalInsight = () => {
    const text = content.cultural_significance || content.origin_history || content.short_intro || '';
    if (!text) return null;
    // Get first substantial sentence (at least 50 chars)
    const sentences = text.split(/[.!?]+/).filter((s: string) => s.trim().length > 50);
    return sentences[0]?.trim() || null;
  };

  const culturalInsight = getCulturalInsight();

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

      {/* Archival Hero Section - Refined & Calm */}
      <header className="relative bg-muted/30">
        {/* Background Image with Subtle Overlay */}
        {content.hero_image && (
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${content.hero_image})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/85 to-background" />
          </div>
        )}
        
        {/* Content */}
        <div className="relative container mx-auto px-4 py-12 md:py-16 lg:py-20">
          {/* Breadcrumb - Muted */}
          <nav className="mb-8">
            <Breadcrumb>
              <BreadcrumbList className="flex-wrap text-sm">
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/" className="text-muted-foreground hover:text-foreground flex items-center transition-colors">
                      <Home className="h-3.5 w-3.5" />
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="text-muted-foreground/50" />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to={`/districts/${district.slug}`} className="text-muted-foreground hover:text-foreground transition-colors">
                      {district.name}
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="text-muted-foreground/50" />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link
                      to={`/districts/${district.slug}/${category.slug}`}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {category.name}
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {subcategory && (
                  <>
                    <BreadcrumbSeparator className="text-muted-foreground/50" />
                    <BreadcrumbItem>
                      <BreadcrumbLink asChild>
                        <Link
                          to={`/districts/${district.slug}/${category.slug}/${subcategory.slug}`}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {subcategory.name}
                        </Link>
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                  </>
                )}
                <BreadcrumbSeparator className="text-muted-foreground/50" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-foreground font-medium">{content.title}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </nav>

          {/* Meta Badges - Subtle */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {content.is_featured && (
              <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-0 text-xs font-medium">
                <Star className="h-3 w-3 mr-1" />
                Featured
              </Badge>
            )}
            <Badge variant="outline" className="text-muted-foreground border-border/60 text-xs">
              {category.name}
            </Badge>
            {subcategory && (
              <Badge variant="outline" className="text-muted-foreground border-border/60 text-xs">
                {subcategory.name}
              </Badge>
            )}
          </div>

          {/* Title - Authoritative */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-serif font-bold text-foreground mb-5 max-w-4xl leading-[1.15] tracking-tight">
            {content.title}
          </h1>

          {/* Subtitle / Short Intro */}
          {content.short_intro && (
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
              {content.short_intro}
            </p>
          )}

          {/* Meta Info - Muted Date/Location */}
          <div className="flex flex-wrap items-center gap-4 mt-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              {district.name}, Uttarakhand
            </span>
            {content.created_at && (
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {new Date(content.created_at).toLocaleDateString('en-IN', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main Content - Archival Reading Layout */}
      <main className="bg-background">
        <div className="container mx-auto px-4 py-12 md:py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
            
            {/* Main Article - Constrained Width for Readability */}
            <article className="lg:col-span-8 lg:max-w-[800px] space-y-10 md:space-y-14">
              
              {/* Cultural Insight Callout - Editorial Highlight */}
              {culturalInsight && (
                <div className="relative bg-gradient-to-br from-primary/5 via-primary/3 to-transparent border-l-4 border-primary/60 rounded-r-xl p-6 md:p-8">
                  <Quote className="absolute top-4 right-4 h-8 w-8 text-primary/20" />
                  <p className="text-lg md:text-xl text-foreground/90 leading-relaxed italic font-serif">
                    "{culturalInsight}"
                  </p>
                  <p className="text-sm text-muted-foreground mt-4 font-medium">
                    — Cultural Insight
                  </p>
                </div>
              )}

              {/* Section 1: Cultural & Social Significance */}
              {shouldShow('cultural_significance', content.cultural_significance) && (
                <ArchivalSection
                  icon={<Heart className="h-5 w-5" />}
                  title="Cultural & Social Significance"
                >
                  <ArticleText>{content.cultural_significance}</ArticleText>
                </ArchivalSection>
              )}

              {/* Section 2: Origin & Historical Background */}
              {shouldShow('origin_history', content.origin_history) && (
                <ArchivalSection
                  icon={<BookOpen className="h-5 w-5" />}
                  title="Origin & Historical Background"
                >
                  <ArticleText>{content.origin_history}</ArticleText>
                </ArchivalSection>
              )}

              {/* Section 3: Spiritual Significance (temples, spiritual places) */}
              {shouldShow('spiritual_significance', content.spiritual_significance) && (
                <ArchivalSection
                  icon={<Sparkles className="h-5 w-5" />}
                  title="Spiritual Significance"
                >
                  <ArticleText>{content.spiritual_significance}</ArticleText>
                </ArchivalSection>
              )}

              {/* Section 4: Historical Significance */}
              {shouldShow('historical_significance', content.historical_significance) && (
                <ArchivalSection
                  icon={<BookOpen className="h-5 w-5" />}
                  title="Historical Significance"
                >
                  <ArticleText>{content.historical_significance}</ArticleText>
                </ArchivalSection>
              )}

              {/* Section 5: Ingredients (food only) */}
              {shouldShow('ingredients', ingredients) && ingredients.length > 0 && (
                <ArchivalSection
                  icon={<Utensils className="h-5 w-5" />}
                  title="Traditional Ingredients"
                >
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {ingredients.map((ingredient: string, index: number) => (
                      <li key={index} className="flex items-center gap-3 p-4 rounded-lg bg-muted/40 border border-border/30">
                        <span className="w-2 h-2 rounded-full bg-primary/60 shrink-0" />
                        <span className="text-foreground">{ingredient}</span>
                      </li>
                    ))}
                  </ul>
                </ArchivalSection>
              )}

              {/* Section 6: Traditional Preparation / Practices */}
              {shouldShow('preparation_method', content.preparation_method) && (
                <ArchivalSection
                  icon={<Utensils className="h-5 w-5" />}
                  title="Traditional Preparation Method"
                >
                  <ArticleText>{content.preparation_method}</ArticleText>
                </ArchivalSection>
              )}

              {/* Section 7: Taste & Texture (food) */}
              {shouldShow('taste_description', content.taste_description) && (
                <ArchivalSection
                  icon={<Sparkles className="h-5 w-5" />}
                  title="Taste & Texture Profile"
                >
                  <ArticleText>{content.taste_description}</ArticleText>
                </ArchivalSection>
              )}

              {/* Section 8: Local Customs & Rituals */}
              {shouldShow('local_customs', content.local_customs) && (
                <ArchivalSection
                  icon={<Users className="h-5 w-5" />}
                  title="Local Customs & Rituals"
                >
                  <ArticleText>{content.local_customs}</ArticleText>
                </ArchivalSection>
              )}

              {/* Section 9: Things to Do */}
              {shouldShow('things_to_do', thingsToDo) && thingsToDo.length > 0 && (
                <ArchivalSection
                  icon={<Compass className="h-5 w-5" />}
                  title="Things to Do & Experience"
                >
                  <ul className="space-y-4">
                    {thingsToDo.map((item, index) => (
                      <li key={index} className="flex items-start gap-4">
                        <span className="flex items-center justify-center w-7 h-7 rounded-full bg-muted text-muted-foreground text-sm font-medium shrink-0 mt-0.5">
                          {index + 1}
                        </span>
                        <span className="text-foreground/85 text-base leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </ArchivalSection>
              )}

              {/* Section 10: Best Time / When to Enjoy */}
              {shouldShow('consumption_occasions', content.consumption_occasions) && (
                <ArchivalSection
                  icon={<Calendar className="h-5 w-5" />}
                  title={category.slug === 'local-food' ? 'When & How to Enjoy' : 'Best Time to Visit'}
                >
                  <ArticleText>{content.consumption_occasions}</ArticleText>
                </ArchivalSection>
              )}

              {/* Section 11: Famous Places to Experience */}
              {famousPlaces.length > 0 && (
                <ArchivalSection
                  icon={<MapPin className="h-5 w-5" />}
                  title="Where to Experience"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {famousPlaces.map((place: any, index: number) => (
                      <div key={index} className="p-5 rounded-lg bg-muted/40 border border-border/30">
                        <h4 className="font-semibold text-foreground">{place.name}</h4>
                        {place.address && (
                          <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{place.address}</p>
                        )}
                        {place.maps_url && (
                          <a
                            href={place.maps_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline mt-3 font-medium"
                          >
                            <MapPin className="h-3.5 w-3.5" />
                            View on Map
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </ArchivalSection>
              )}

              {/* Section 12: How to Reach */}
              {howToReach && (
                <ArchivalSection
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
                </ArchivalSection>
              )}

              {/* Section 13: Do's & Don'ts */}
              {shouldShow('dos_and_donts', content.dos_and_donts) && (
                <ArchivalSection
                  icon={<ShieldCheck className="h-5 w-5" />}
                  title="Tourist Tips & Local Advice"
                >
                  <div className="bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/30 rounded-lg p-6">
                    <ArticleText className="!text-foreground/90">{content.dos_and_donts}</ArticleText>
                  </div>
                </ArchivalSection>
              )}

              {/* Section 14: Fun Facts */}
              {shouldShow('fun_facts', content.fun_facts) && (
                <ArchivalSection
                  icon={<Lightbulb className="h-5 w-5" />}
                  title="Fun Facts & Folklore"
                >
                  <div className="bg-primary/5 border border-primary/10 rounded-lg p-6">
                    <ArticleText className="!text-foreground/90">{content.fun_facts}</ArticleText>
                  </div>
                </ArchivalSection>
              )}

              {/* Section 15: FAQs */}
              {faqs.length > 0 && (
                <ArchivalSection
                  icon={<HelpCircle className="h-5 w-5" />}
                  title="Frequently Asked Questions"
                >
                  <Accordion type="single" collapsible className="w-full space-y-3">
                    {faqs.map((faq: any, index: number) => (
                      <AccordionItem 
                        key={index} 
                        value={`faq-${index}`} 
                        className="border border-border/40 rounded-lg px-5 bg-muted/20 data-[state=open]:bg-muted/40"
                      >
                        <AccordionTrigger className="text-left hover:text-primary py-4 text-base font-medium hover:no-underline">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="pb-4">
                          <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </ArchivalSection>
              )}

              {/* Internal Context Links - Editorial Style */}
              <div className="pt-8 border-t border-border/40">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">
                  Continue Exploring
                </h3>
                <div className="flex flex-wrap gap-3">
                  <Link
                    to={`/districts/${district.slug}`}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-muted/50 hover:bg-muted text-sm text-foreground transition-colors border border-border/30"
                  >
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    {district.name} District
                  </Link>
                  <Link
                    to={`/districts/${district.slug}/${category.slug}`}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-muted/50 hover:bg-muted text-sm text-foreground transition-colors border border-border/30"
                  >
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    More {category.name}
                  </Link>
                  <Link
                    to="/gallery"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-muted/50 hover:bg-muted text-sm text-foreground transition-colors border border-border/30"
                  >
                    <Mountain className="h-4 w-4 text-muted-foreground" />
                    Photo Gallery
                  </Link>
                </div>
              </div>
            </article>

            {/* Sidebar - Quick Reference */}
            <aside className="lg:col-span-4 space-y-6">
              {/* Quick Info Card */}
              <Card className="sticky top-24 border-border/40 bg-muted/20">
                <CardHeader className="pb-4 border-b border-border/30">
                  <CardTitle className="text-base flex items-center gap-2.5 font-medium">
                    <Info className="h-4 w-4 text-muted-foreground" />
                    Quick Reference
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-5 space-y-5">
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

                  <Separator className="!my-4" />

                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1.5">Location</p>
                    <Link
                      to={`/districts/${district.slug}`}
                      className="font-medium text-primary hover:underline flex items-center gap-1.5 text-sm"
                    >
                      <MapPin className="h-4 w-4" />
                      {district.name}, Uttarakhand
                    </Link>
                  </div>

                  {content.google_maps_url && (
                    <>
                      <Separator className="!my-4" />
                      <Button asChild variant="outline" className="w-full">
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

                  <Separator className="!my-4" />

                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-3">Share</p>
                    <Button
                      variant="outline"
                      size="sm"
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
                      Share Page
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
        </div>

        {/* Related Content from Same District */}
        {relatedFromDistrict.length > 0 && (
          <div className="container mx-auto px-4 pb-16">
            <section className="border-t border-border/40 pt-12">
              <h2 className="text-xl md:text-2xl font-semibold mb-8 flex items-center gap-3 text-foreground">
                <TreePine className="h-6 w-6 text-muted-foreground" />
                Explore More in {district.name}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
                {relatedFromDistrict.map((item) => (
                  <RelatedCard
                    key={item.id}
                    item={item}
                    districtSlug={district.slug}
                  />
                ))}
              </div>
              <div className="text-center mt-10">
                <Button variant="outline" asChild>
                  <Link to={`/districts/${district.slug}`}>
                    View All in {district.name}
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </div>
            </section>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

// Article Text Component - Enhanced typography for archival reading
function ArticleText({ 
  children, 
  className = '' 
}: { 
  children: React.ReactNode; 
  className?: string;
}) {
  return (
    <div className={`${className}`}>
      <p className="text-foreground/80 text-base md:text-[17px] leading-[1.85] md:leading-[1.9] whitespace-pre-line tracking-[-0.01em]">
        {children}
      </p>
    </div>
  );
}

// Archival Section Component - Soft content block with accent line
function ArchivalSection({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section 
      className="scroll-mt-24 relative bg-muted/20 border border-border/30 rounded-xl p-6 md:p-8" 
      id={title.toLowerCase().replace(/\s+/g, '-')}
    >
      {/* Left accent line */}
      <div className="absolute left-0 top-6 bottom-6 w-1 bg-primary/40 rounded-full" />
      
      <h2 className="text-lg md:text-xl font-semibold mb-5 flex items-center gap-3 text-foreground pl-4">
        <span className="text-muted-foreground">{icon}</span>
        <span>{title}</span>
      </h2>
      <div className="pl-4">
        {children}
      </div>
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
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{label}</p>
        <p className="font-medium text-foreground text-sm mt-0.5">{value}</p>
      </div>
    </div>
  );
}

// Info Card for How to Reach
function InfoCard({ title, content }: { title: string; content: string }) {
  return (
    <div className="p-5 rounded-lg bg-muted/40 border border-border/30">
      <h4 className="font-semibold text-foreground mb-2">{title}</h4>
      <p className="text-sm text-muted-foreground leading-relaxed">{content}</p>
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
    <Card className="border-border/40 bg-muted/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.map((item) => (
          <Link
            key={item.id}
            to={`/districts/${districtSlug}/${categorySlug}/${subcategorySlug || item.subcategory?.slug || 'item'}/${item.slug}`}
            className="flex items-center gap-3 p-2.5 -mx-2 rounded-lg hover:bg-muted transition-colors group"
          >
            {item.hero_image ? (
              <img
                src={item.hero_image}
                alt=""
                className="w-11 h-11 rounded-lg object-cover shrink-0"
                loading="lazy"
              />
            ) : (
              <div className="w-11 h-11 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <Mountain className="h-4 w-4 text-muted-foreground" />
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

// Related Card for grid display
function RelatedCard({
  item,
  districtSlug,
}: {
  item: any;
  districtSlug: string;
}) {
  const categorySlug = item.category?.slug || 'culture';
  const subcategorySlug = item.subcategory?.slug || 'item';

  return (
    <Link
      to={`/districts/${districtSlug}/${categorySlug}/${subcategorySlug}/${item.slug}`}
      className="group block"
    >
      <div className="aspect-[4/3] rounded-lg overflow-hidden bg-muted mb-3">
        {item.hero_image ? (
          <img
            src={item.hero_image}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Mountain className="h-8 w-8 text-muted-foreground" />
          </div>
        )}
      </div>
      <h3 className="font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors text-sm">
        {item.title}
      </h3>
      {item.category?.name && (
        <p className="text-xs text-muted-foreground mt-1">{item.category.name}</p>
      )}
    </Link>
  );
}
