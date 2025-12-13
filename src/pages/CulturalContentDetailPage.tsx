import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
} from 'lucide-react';

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

  // Fetch related content
  const { data: relatedContents = [] } = useCulturalContents({
    categoryId: data?.category?.id,
    onlyPublished: true,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-96 w-full rounded-lg mb-8" />
          <Skeleton className="h-48 w-full rounded-lg" />
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
          <h1 className="text-2xl font-bold mb-4">Content Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The content you're looking for doesn't exist.
          </p>
          <Link
            to={`/uttarakhand/${districtSlug}/${categorySlug}`}
            className="text-primary hover:underline"
          >
            Back to Category
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const { content, category, subcategory, district } = data;
  const related = relatedContents
    .filter((c) => c.id !== content.id)
    .slice(0, 4);

  const faqs = Array.isArray(content.faqs) ? content.faqs : [];
  const ingredients = Array.isArray(content.ingredients) ? content.ingredients : [];
  const thingsToDo = content.things_to_do || [];

  // Generate JSON-LD schema
  const schema = {
    '@context': 'https://schema.org',
    '@type': category.slug === 'local-food' ? 'Recipe' : 'Article',
    name: content.title,
    description: content.short_intro || content.seo_description,
    image: content.hero_image,
    ...(category.slug === 'local-food' && {
      recipeIngredient: ingredients,
      recipeInstructions: content.preparation_method,
    }),
    ...(faqs.length > 0 && {
      mainEntity: faqs.map((faq: any) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    }),
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>
          {content.seo_title ||
            `${content.title} - ${subcategory?.name || category.name} in ${district.name}`}
        </title>
        <meta
          name="description"
          content={content.seo_description || content.short_intro || ''}
        />
        <meta property="og:title" content={content.title} />
        <meta property="og:description" content={content.short_intro || ''} />
        {content.hero_image && <meta property="og:image" content={content.hero_image} />}
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      </Helmet>

      <Navigation />
      <FloatingShareButton />

      {/* Hero Section */}
      <div
        className="relative h-[400px] bg-cover bg-center"
        style={{
          backgroundImage: content.hero_image
            ? `url(${content.hero_image})`
            : 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary)/0.8) 100%)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="relative container mx-auto px-4 h-full flex flex-col justify-end pb-8">
          <Breadcrumb className="mb-4">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/" className="text-white/80 hover:text-white flex items-center">
                    <Home className="h-4 w-4" />
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-white/60" />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to={`/districts/${district.slug}`} className="text-white/80 hover:text-white">
                    {district.name}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-white/60" />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link
                    to={`/uttarakhand/${district.slug}/${category.slug}`}
                    className="text-white/80 hover:text-white"
                  >
                    {category.name}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              {subcategory && (
                <>
                  <BreadcrumbSeparator className="text-white/60" />
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link
                        to={`/uttarakhand/${district.slug}/${category.slug}/${subcategory.slug}`}
                        className="text-white/80 hover:text-white"
                      >
                        {subcategory.name}
                      </Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                </>
              )}
              <BreadcrumbSeparator className="text-white/60" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-white">{content.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="flex items-center gap-2 mb-2">
            {content.is_featured && (
              <Badge className="bg-yellow-500 text-black">
                <Star className="h-3 w-3 mr-1" />
                Featured
              </Badge>
            )}
            {subcategory && <Badge variant="secondary">{subcategory.name}</Badge>}
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3">
            {content.title}
          </h1>
          {content.short_intro && (
            <p className="text-white/90 text-lg max-w-3xl">{content.short_intro}</p>
          )}
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Cultural Significance */}
            {content.cultural_significance && (
              <section>
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Star className="h-5 w-5 text-primary" />
                  Cultural Significance
                </h2>
                <div className="prose max-w-none text-muted-foreground">
                  <p>{content.cultural_significance}</p>
                </div>
              </section>
            )}

            {/* Origin & History */}
            {content.origin_history && (
              <section>
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Origin & History
                </h2>
                <div className="prose max-w-none text-muted-foreground">
                  <p>{content.origin_history}</p>
                </div>
              </section>
            )}

            {/* Ingredients (for food) */}
            {ingredients.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Utensils className="h-5 w-5 text-primary" />
                  Ingredients
                </h2>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {ingredients.map((ingredient: string, index: number) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-primary" />
                      {ingredient}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Preparation Method */}
            {content.preparation_method && (
              <section>
                <h2 className="text-2xl font-bold mb-4">Traditional Preparation</h2>
                <div className="prose max-w-none text-muted-foreground">
                  <p className="whitespace-pre-line">{content.preparation_method}</p>
                </div>
              </section>
            )}

            {/* Taste Description */}
            {content.taste_description && (
              <section>
                <h2 className="text-2xl font-bold mb-4">Taste & Texture</h2>
                <div className="prose max-w-none text-muted-foreground">
                  <p>{content.taste_description}</p>
                </div>
              </section>
            )}

            {/* Things to Do */}
            {thingsToDo.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold mb-4">Things to Do</h2>
                <ul className="space-y-2">
                  {thingsToDo.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <ChevronRight className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Historical / Spiritual Significance */}
            {(content.historical_significance || content.spiritual_significance) && (
              <section>
                {content.historical_significance && (
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold mb-4">Historical Significance</h2>
                    <div className="prose max-w-none text-muted-foreground">
                      <p>{content.historical_significance}</p>
                    </div>
                  </div>
                )}
                {content.spiritual_significance && (
                  <div>
                    <h2 className="text-2xl font-bold mb-4">Spiritual Significance</h2>
                    <div className="prose max-w-none text-muted-foreground">
                      <p>{content.spiritual_significance}</p>
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* Local Customs */}
            {content.local_customs && (
              <section>
                <h2 className="text-2xl font-bold mb-4">Local Customs & Rituals</h2>
                <div className="prose max-w-none text-muted-foreground">
                  <p>{content.local_customs}</p>
                </div>
              </section>
            )}

            {/* Do's and Don'ts */}
            {content.dos_and_donts && (
              <section>
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-primary" />
                  Do's & Don'ts
                </h2>
                <div className="prose max-w-none text-muted-foreground">
                  <p className="whitespace-pre-line">{content.dos_and_donts}</p>
                </div>
              </section>
            )}

            {/* Fun Facts */}
            {content.fun_facts && (
              <section>
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  Fun Facts & Folklore
                </h2>
                <div className="prose max-w-none text-muted-foreground">
                  <p className="whitespace-pre-line">{content.fun_facts}</p>
                </div>
              </section>
            )}

            {/* FAQs */}
            {faqs.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq: any, index: number) => (
                    <AccordionItem key={index} value={`faq-${index}`}>
                      <AccordionTrigger className="text-left">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent>
                        <p className="text-muted-foreground">{faq.answer}</p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Quick Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {content.price_range && (
                  <div className="flex items-center gap-3">
                    <IndianRupee className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Price Range</p>
                      <p className="font-medium">{content.price_range}</p>
                    </div>
                  </div>
                )}
                {content.timings && (
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Timings</p>
                      <p className="font-medium">{content.timings}</p>
                    </div>
                  </div>
                )}
                {content.entry_fee && (
                  <div className="flex items-center gap-3">
                    <IndianRupee className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Entry Fee</p>
                      <p className="font-medium">{content.entry_fee}</p>
                    </div>
                  </div>
                )}
                {content.shelf_life_tips && (
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground">Shelf Life & Travel Tips</p>
                      <p className="font-medium text-sm">{content.shelf_life_tips}</p>
                    </div>
                  </div>
                )}
                {content.consumption_occasions && (
                  <div className="pt-2 border-t">
                    <p className="text-sm text-muted-foreground mb-1">Best Enjoyed</p>
                    <p className="text-sm">{content.consumption_occasions}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Location Card */}
            {content.google_maps_url && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Location
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full">
                    <a href={content.google_maps_url} target="_blank" rel="noopener noreferrer">
                      View on Google Maps
                    </a>
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Share Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Share2 className="h-5 w-5" />
                  Share
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Share this with friends and family!
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: content.title,
                        text: content.short_intro || '',
                        url: window.location.href,
                      });
                    }
                  }}
                >
                  Share Now
                </Button>
              </CardContent>
            </Card>
          </aside>
        </div>

        {/* Related Content */}
        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold mb-6">
              More from {subcategory?.name || category.name}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {related.map((item) => {
                const itemSubcat =
                  item.subcategory_id === subcategory?.id ? subcategory : null;
                return (
                  <Link
                    key={item.id}
                    to={`/uttarakhand/${districtSlug}/${categorySlug}/${itemSubcat?.slug || subcategorySlug || 'item'}/${item.slug}`}
                  >
                    <Card className="h-full hover:shadow-lg transition-shadow group overflow-hidden">
                      {item.hero_image && (
                        <div className="aspect-video overflow-hidden">
                          <img
                            src={item.hero_image}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            loading="lazy"
                          />
                        </div>
                      )}
                      <CardContent className="p-4">
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
              })}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
