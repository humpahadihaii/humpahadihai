import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Skeleton } from '@/components/ui/skeleton';
import { useContentSubcategory, useCulturalContents } from '@/hooks/useCulturalContent';
import { ChevronRight, Home } from 'lucide-react';

export default function CulturalSubcategoryPage() {
  const { districtSlug, categorySlug, subcategorySlug } = useParams<{
    districtSlug: string;
    categorySlug: string;
    subcategorySlug: string;
  }>();

  const { data, isLoading: subLoading } = useContentSubcategory(
    districtSlug,
    categorySlug,
    subcategorySlug
  );

  const { data: contents = [], isLoading: contentsLoading } = useCulturalContents({
    subcategoryId: data?.subcategory?.id,
    onlyPublished: true,
  });

  const isLoading = subLoading || contentsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-64 w-full rounded-lg mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48 rounded-lg" />
            ))}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!data?.subcategory) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Subcategory Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The subcategory you're looking for doesn't exist.
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

  const { subcategory, category, district } = data;

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>
          {subcategory.seo_title ||
            `${subcategory.name} - ${category.name} in ${district.name}, Uttarakhand`}
        </title>
        <meta
          name="description"
          content={
            subcategory.seo_description ||
            `Explore ${subcategory.name} from ${district.name}. Part of ${category.name} cultural heritage.`
          }
        />
      </Helmet>

      <Navigation />

      {/* Hero Section */}
      <div
        className="relative h-[300px] bg-cover bg-center"
        style={{
          backgroundImage: subcategory.hero_image
            ? `url(${subcategory.hero_image})`
            : category.hero_image
            ? `url(${category.hero_image})`
            : 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary)/0.8) 100%)',
        }}
      >
        <div className="absolute inset-0 bg-black/50" />
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
                  <Link to="/districts" className="text-white/80 hover:text-white">
                    Uttarakhand
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
              <BreadcrumbSeparator className="text-white/60" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-white">{subcategory.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{subcategory.name}</h1>
          <p className="text-white/90 text-lg">
            {category.name} • {district.name}, Uttarakhand
          </p>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        {/* Description */}
        {subcategory.description && (
          <div className="prose max-w-none mb-8">
            <p className="text-lg text-muted-foreground">{subcategory.description}</p>
          </div>
        )}

        {/* Content Grid */}
        {contents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {contents.map((content) => (
              <Link
                key={content.id}
                to={`/uttarakhand/${districtSlug}/${categorySlug}/${subcategorySlug}/${content.slug}`}
              >
                <Card className="h-full hover:shadow-lg transition-shadow group overflow-hidden">
                  {content.hero_image && (
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={content.hero_image}
                        alt={content.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <CardContent className="p-4">
                    <h3 className="font-semibold group-hover:text-primary transition-colors line-clamp-1">
                      {content.title}
                    </h3>
                    {content.short_intro && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {content.short_intro}
                      </p>
                    )}
                    <div className="flex items-center mt-3 text-sm text-primary">
                      <span>Learn more</span>
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No content available yet.</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
