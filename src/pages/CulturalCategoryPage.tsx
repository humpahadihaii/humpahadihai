import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Skeleton } from '@/components/ui/skeleton';
import { useContentCategory, useContentSubcategories, useCulturalContents } from '@/hooks/useCulturalContent';
import { ChevronRight, Home } from 'lucide-react';

export default function CulturalCategoryPage() {
  const { districtSlug, categorySlug } = useParams<{
    districtSlug: string;
    categorySlug: string;
  }>();

  const { data, isLoading: categoryLoading } = useContentCategory(districtSlug, categorySlug);
  const { data: subcategories = [], isLoading: subLoading } = useContentSubcategories(
    data?.category?.id,
    true
  );
  const { data: contents = [], isLoading: contentsLoading } = useCulturalContents({
    categoryId: data?.category?.id,
    onlyPublished: true,
  });

  const isLoading = categoryLoading || subLoading || contentsLoading;

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

  if (!data?.category) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Category Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The category you're looking for doesn't exist.
          </p>
          <Link to={`/districts/${districtSlug}`} className="text-primary hover:underline">
            Back to District
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const { category, district } = data;

  // Group contents by subcategory
  const contentsBySubcategory = new Map<string | null, typeof contents>();
  contents.forEach((content) => {
    const key = content.subcategory_id;
    if (!contentsBySubcategory.has(key)) {
      contentsBySubcategory.set(key, []);
    }
    contentsBySubcategory.get(key)!.push(content);
  });

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>
          {category.seo_title || `${category.name} in ${district.name}, Uttarakhand`}
        </title>
        <meta
          name="description"
          content={
            category.seo_description ||
            `Explore ${category.name} from ${district.name}, Uttarakhand. Discover authentic cultural heritage.`
          }
        />
      </Helmet>

      <Navigation />

      {/* Hero Section */}
      <div
        className="relative h-[300px] bg-cover bg-center"
        style={{
          backgroundImage: category.hero_image
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
                <BreadcrumbPage className="text-white">{category.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{category.name}</h1>
          <p className="text-white/90 text-lg">{district.name}, Uttarakhand</p>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        {/* Description */}
        {category.description && (
          <div className="prose max-w-none mb-8">
            <p className="text-lg text-muted-foreground">{category.description}</p>
          </div>
        )}

        {/* Subcategories Grid */}
        {subcategories.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Browse by Category</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {subcategories.map((sub) => {
                const count = contents.filter((c) => c.subcategory_id === sub.id).length;
                return (
                  <Link
                    key={sub.id}
                    to={`/uttarakhand/${districtSlug}/${categorySlug}/${sub.slug}`}
                  >
                    <Card className="h-full hover:shadow-lg transition-shadow group">
                      {sub.hero_image && (
                        <div className="aspect-video overflow-hidden">
                          <img
                            src={sub.hero_image}
                            alt={sub.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                      )}
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold group-hover:text-primary transition-colors">
                            {sub.name}
                          </h3>
                          <Badge variant="secondary">{count}</Badge>
                        </div>
                        {sub.description && (
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                            {sub.description}
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

        {/* All Content */}
        {contents.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-6">
              {subcategories.length > 0 ? 'All Items' : `Explore ${category.name}`}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {contents.map((content) => {
                const sub = subcategories.find((s) => s.id === content.subcategory_id);
                return (
                  <Link
                    key={content.id}
                    to={`/uttarakhand/${districtSlug}/${categorySlug}/${sub?.slug || 'item'}/${content.slug}`}
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
                );
              })}
            </div>
          </section>
        )}

        {contents.length === 0 && subcategories.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No content available yet.</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
