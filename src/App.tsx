import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider, useIsFetching } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnalyticsProvider } from "./components/AnalyticsProvider";
import { CookieConsentProvider } from "./components/cookie";
import { SearchProvider, SearchModal } from "./components/search";
import { ReadingModeProvider } from "./components/ReadingModeToggle";
import ScrollToTop from "./components/ScrollToTop";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";
import { AdminToolbar } from "./components/AdminToolbar";
import { QuickAccessBar } from "./components/QuickAccessBar";
import { FloatingShareButton } from "./components/share/FloatingShareButton";
import { Suspense, lazy, memo, useState, useEffect, useRef, useCallback } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { cn } from "@/lib/utils";

// Critical pages and route guards loaded eagerly for fast initial render
import HomePage from "./pages/HomePage";
import NotFound from "./pages/NotFound";
import AdminRoute from "./components/AdminRoute";
import AdminDashboardRoute from "./components/AdminDashboardRoute";
import PendingApprovalRoute from "./components/PendingApprovalRoute";

// Lazy load all other pages for code splitting
const CulturePage = lazy(() => import("./pages/CulturePage"));
const FoodPage = lazy(() => import("./pages/FoodPage"));
const TravelPage = lazy(() => import("./pages/TravelPage"));
const DistrictsPage = lazy(() => import("./pages/DistrictsPage"));
const DistrictDetailPage = lazy(() => import("./pages/DistrictDetailPage"));
const VillageDetailPage = lazy(() => import("./pages/VillageDetailPage"));
const GalleryPage = lazy(() => import("./pages/GalleryPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const PrivacyPolicyPage = lazy(() => import("./pages/PrivacyPolicyPage"));
const TermsPage = lazy(() => import("./pages/TermsPage"));
const DisclaimerPage = lazy(() => import("./pages/DisclaimerPage"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const ThoughtsPage = lazy(() => import("./pages/ThoughtsPage"));
const SubmitThoughtPage = lazy(() => import("./pages/SubmitThoughtPage"));
const SubmitStoryPage = lazy(() => import("./pages/SubmitStoryPage"));
const MySubmissionsPage = lazy(() => import("./pages/MySubmissionsPage"));
const ContentDetailPage = lazy(() => import("./pages/ContentDetailPage"));
const PromotionsPage = lazy(() => import("./pages/PromotionsPage"));
const TravelPackagesPage = lazy(() => import("./pages/TravelPackagesPage"));
const TravelPackageDetailPage = lazy(() => import("./pages/TravelPackageDetailPage"));
const ProductsPage = lazy(() => import("./pages/ProductsPage"));
const ProductDetailPage = lazy(() => import("./pages/ProductDetailPage"));
const MarketplacePage = lazy(() => import("./pages/MarketplacePage"));
const ProviderDetailPage = lazy(() => import("./pages/ProviderDetailPage"));
const ListingDetailPage = lazy(() => import("./pages/ListingDetailPage"));
const ListYourBusinessPage = lazy(() => import("./pages/ListYourBusinessPage"));
const MapPage = lazy(() => import("./pages/MapPage"));
const EventsPage = lazy(() => import("./pages/EventsPage"));
const EventDetailPage = lazy(() => import("./pages/EventDetailPage"));
const SearchPage = lazy(() => import("./pages/SearchPage"));
const DestinationGuidePage = lazy(() => import("./pages/DestinationGuidePage"));
const DestinationPlaceDetailPage = lazy(() => import("./pages/DestinationPlaceDetailPage"));
const CulturalCategoryPage = lazy(() => import("./pages/CulturalCategoryPage"));
const CulturalSubcategoryPage = lazy(() => import("./pages/CulturalSubcategoryPage"));
const CulturalContentDetailPage = lazy(() => import("./pages/CulturalContentDetailPage"));

// Admin pages - lazy loaded as separate chunk
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const UnauthorizedPage = lazy(() => import("./pages/admin/UnauthorizedPage"));
const AdminThoughtsPage = lazy(() => import("./pages/AdminThoughtsPage"));
const AdminSubmissionsPage = lazy(() => import("./pages/AdminSubmissionsPage"));
const AdminCommunitySubmissionsPage = lazy(() => import("./pages/admin/AdminCommunitySubmissionsPage"));
const AdminCulturePage = lazy(() => import("./pages/admin/AdminCulturePage"));
const AdminFoodContentPage = lazy(() => import("./pages/admin/AdminFoodContentPage"));
const AdminTravelContentPage = lazy(() => import("./pages/admin/AdminTravelContentPage"));
const AdminThoughtsContentPage = lazy(() => import("./pages/admin/AdminThoughtsContentPage"));
const AdminAnalyticsPage = lazy(() => import("./pages/admin/AdminAnalyticsPage"));
const AdminDistrictsPage = lazy(() => import("./pages/admin/AdminDistrictsPage"));
const AdminHotelsPage = lazy(() => import("./pages/admin/AdminHotelsPage"));
const AdminVillagesPage = lazy(() => import("./pages/admin/AdminVillagesPage"));
const AdminVillageContentPage = lazy(() => import("./pages/admin/AdminVillageContentPage"));
const AdminVillageEconomyPage = lazy(() => import("./pages/admin/AdminVillageEconomyPage"));
const AdminFestivalsPage = lazy(() => import("./pages/admin/AdminFestivalsPage"));
const AdminGalleryPage = lazy(() => import("./pages/admin/AdminGalleryPage"));
const AdminSiteImagesPage = lazy(() => import("./pages/admin/AdminSiteImagesPage"));
const AdminHighlightsPage = lazy(() => import("./pages/admin/AdminHighlightsPage"));
const AdminDistrictContentPage = lazy(() => import("./pages/admin/AdminDistrictContentPage"));
const AdminFeaturedHighlightsPage = lazy(() => import("./pages/admin/AdminFeaturedHighlightsPage"));
const AdminUserManagementPage = lazy(() => import("./pages/admin/AdminUserManagementPage"));
const AdminSiteSettingsPage = lazy(() => import("./pages/admin/AdminSiteSettingsPage"));
const AdminStoriesPage = lazy(() => import("./pages/admin/AdminStoriesPage"));
const AdminEventsPage = lazy(() => import("./pages/admin/AdminEventsPage"));
const AdminPagesPage = lazy(() => import("./pages/admin/AdminPagesPage"));
const AdminFooterLinksPage = lazy(() => import("./pages/admin/AdminFooterLinksPage"));
const AdminContentSectionsPage = lazy(() => import("./pages/admin/AdminContentSectionsPage"));
const AdminPromotionPackagesPage = lazy(() => import("./pages/admin/AdminPromotionPackagesPage"));
const AdminPromotionRequestsPage = lazy(() => import("./pages/admin/AdminPromotionRequestsPage"));
const AdminTravelPackagesPage = lazy(() => import("./pages/admin/AdminTravelPackagesPage"));
const AdminTravelRequestsPage = lazy(() => import("./pages/admin/AdminTravelRequestsPage"));
const AdminProductCategoriesPage = lazy(() => import("./pages/admin/AdminProductCategoriesPage"));
const AdminProductsPage = lazy(() => import("./pages/admin/AdminProductsPage"));
const AdminProductOrdersPage = lazy(() => import("./pages/admin/AdminProductOrdersPage"));
const AdminAIToolsPage = lazy(() => import("./pages/admin/AdminAIToolsPage"));
const AdminAISettingsPage = lazy(() => import("./pages/admin/AdminAISettingsPage"));
const AdminBulkAIPage = lazy(() => import("./pages/admin/AdminBulkAIPage"));
const AdminHomepageCTAsPage = lazy(() => import("./pages/admin/AdminHomepageCTAsPage"));
const AdminPageSettingsPage = lazy(() => import("./pages/admin/AdminPageSettingsPage"));
const AdminMapSettingsPage = lazy(() => import("./pages/admin/AdminMapSettingsPage"));
const AdminDistrictPlacesPage = lazy(() => import("./pages/admin/AdminDistrictPlacesPage"));
const AdminDistrictFoodsPage = lazy(() => import("./pages/admin/AdminDistrictFoodsPage"));
const AdminDistrictFestivalsPage = lazy(() => import("./pages/admin/AdminDistrictFestivalsPage"));
const AdminTourismProvidersPage = lazy(() => import("./pages/admin/AdminTourismProvidersPage"));
const AdminTourismListingsPage = lazy(() => import("./pages/admin/AdminTourismListingsPage"));
const AdminTourismInquiriesPage = lazy(() => import("./pages/admin/AdminTourismInquiriesPage"));
const AdminBookingsPage = lazy(() => import("./pages/admin/AdminBookingsPage"));
const AdminNotifySettingsPage = lazy(() => import("./pages/admin/AdminNotifySettingsPage"));
const AdminFeaturedCardsPage = lazy(() => import("./pages/admin/AdminFeaturedCardsPage"));
const AdminMapPage = lazy(() => import("./pages/admin/AdminMapPage"));
const AdminMediaImportPage = lazy(() => import("./pages/admin/AdminMediaImportPage"));
const AdminShareSettingsPage = lazy(() => import("./pages/admin/AdminShareSettingsPage"));
const AdminSharePreviewPage = lazy(() => import("./pages/admin/AdminSharePreviewPage"));
const AdminDestinationGuidesPage = lazy(() => import("./pages/admin/AdminDestinationGuidesPage"));
const AdminDestinationPlacesPage = lazy(() => import("./pages/admin/AdminDestinationPlacesPage"));
const AdminCulturalCategoriesPage = lazy(() => import("./pages/admin/AdminCulturalCategoriesPage"));
const AdminCulturalSubcategoriesPage = lazy(() => import("./pages/admin/AdminCulturalSubcategoriesPage"));
const AdminCulturalContentPage = lazy(() => import("./pages/admin/AdminCulturalContentPage"));
const AdminFeaturedContentPage = lazy(() => import("./pages/admin/AdminFeaturedContentPage"));
const AdminCookieConsentPage = lazy(() => import("./pages/admin/AdminCookieConsentPage"));

// Optimized QueryClient with better caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Non-blocking circular progress indicator - positioned in corner, no overlay
const CircularProgressLoader = memo(({ progress, isVisible }: { progress: number; isVisible: boolean }) => {
  // Hide completely once done
  if (!isVisible || progress >= 100) return null;

  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-[100]",
        "transition-opacity duration-300 ease-out",
        !isVisible && "opacity-0 pointer-events-none"
      )}
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Loading page"
    >
      <div className="relative w-12 h-12 bg-background/90 backdrop-blur-sm rounded-full shadow-lg border border-border/50">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 48 48">
          <circle cx="24" cy="24" r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth={3} />
          <circle
            cx="24"
            cy="24"
            r={radius}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth={3}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-[stroke-dashoffset] duration-150 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[10px] font-semibold text-foreground tabular-nums">{progress}%</span>
        </div>
      </div>
    </div>
  );
});
CircularProgressLoader.displayName = "CircularProgressLoader";

// Hook for hybrid progress tracking
function useHybridProgress() {
  const [progress, setProgress] = useState(5);
  const [isVisible, setIsVisible] = useState(true);
  const [isComplete, setIsComplete] = useState(false);
  const isFetching = useIsFetching();
  const location = useLocation();
  const startTimeRef = useRef(Date.now());
  const frameRef = useRef<number | null>(null);
  const prevPathRef = useRef(location.pathname);

  // Reset on route change
  useEffect(() => {
    if (location.pathname !== prevPathRef.current) {
      prevPathRef.current = location.pathname;
      startTimeRef.current = Date.now();
      setProgress(5);
      setIsVisible(true);
      setIsComplete(false);
    }
  }, [location.pathname]);

  const calculateTarget = useCallback(() => {
    let target = 25; // Route rendered = 25%
    
    // Data fetching status (up to +45%)
    if (isFetching === 0) {
      target += 45;
    } else {
      target += Math.min(20, 45 * (1 - Math.min(isFetching, 5) / 5));
    }
    
    // Time-based fallback (ensures progress never stalls)
    const elapsed = Date.now() - startTimeRef.current;
    const timeBasedMin = Math.min(10 + elapsed / 60, 92);
    target = Math.max(target, timeBasedMin);
    
    // Cap at 95% until data is ready
    return isFetching === 0 ? 100 : Math.min(target, 95);
  }, [isFetching]);

  // Animation loop
  useEffect(() => {
    const animate = () => {
      if (isComplete) return;
      
      const target = calculateTarget();
      setProgress(prev => {
        const remaining = target - prev;
        const step = Math.max(0.4, remaining * 0.07);
        const next = Math.min(prev + step, target);
        
        if (next >= 100) {
          setIsComplete(true);
          return 100;
        }
        return next;
      });
      
      frameRef.current = requestAnimationFrame(animate);
    };
    
    frameRef.current = requestAnimationFrame(animate);
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [calculateTarget, isComplete]);

  // Fade out after completion
  useEffect(() => {
    if (isComplete) {
      const timer = setTimeout(() => setIsVisible(false), 400);
      return () => clearTimeout(timer);
    }
  }, [isComplete]);

  // Fallback: force completion after 8s
  useEffect(() => {
    const fallback = setTimeout(() => {
      setProgress(100);
      setIsComplete(true);
    }, 8000);
    return () => clearTimeout(fallback);
  }, [location.pathname]);

  return { progress: Math.round(progress), isVisible };
}

// Minimal skeleton fallback for Suspense
const SuspenseFallback = memo(() => (
  <div className="min-h-[50vh] flex items-center justify-center">
    <div className="space-y-4 w-full max-w-md px-4">
      <Skeleton className="h-8 w-3/4 mx-auto" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  </div>
));
SuspenseFallback.displayName = "SuspenseFallback";

// Global progress loader component
const GlobalProgressLoader = memo(() => {
  const { progress, isVisible } = useHybridProgress();
  return <CircularProgressLoader progress={progress} isVisible={isVisible} />;
});
GlobalProgressLoader.displayName = "GlobalProgressLoader";

// Component to conditionally render layout based on route
const AppContent = memo(() => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");
  const isAuthRoute = location.pathname === "/login" || location.pathname === "/auth" || location.pathname === "/pending-approval";
  
  return (
    <>
      <ScrollToTop />
      <GlobalProgressLoader />
      <AdminToolbar />
      <div className="flex flex-col min-h-screen">
        {/* Hide Navigation on admin and auth routes */}
        {!isAdminRoute && !isAuthRoute && <Navigation />}
        <main className="flex-grow">
          <Suspense fallback={<SuspenseFallback />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/culture" element={<CulturePage />} />
              <Route path="/culture/:slug" element={<ContentDetailPage contentType="culture" />} />
              <Route path="/food" element={<FoodPage />} />
              <Route path="/food/:slug" element={<ContentDetailPage contentType="food" />} />
              <Route path="/travel" element={<TravelPage />} />
              <Route path="/travel/:slug" element={<ContentDetailPage contentType="travel" />} />
              <Route path="/districts" element={<DistrictsPage />} />
              <Route path="/districts/:slug" element={<DistrictDetailPage />} />
              <Route path="/villages/:slug" element={<VillageDetailPage />} />
              <Route path="/gallery" element={<GalleryPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/disclaimer" element={<DisclaimerPage />} />
              <Route path="/thoughts" element={<ThoughtsPage />} />
              <Route path="/thoughts/:slug" element={<ContentDetailPage contentType="thought" />} />
              <Route path="/submit-thought" element={<SubmitThoughtPage />} />
              <Route path="/submit-story" element={<SubmitStoryPage />} />
              <Route path="/my-submissions" element={<MySubmissionsPage />} />
              {/* Monetization & New Features */}
              <Route path="/promotions" element={<PromotionsPage />} />
              <Route path="/travel-packages" element={<TravelPackagesPage />} />
              <Route path="/travel-packages/:slug" element={<TravelPackageDetailPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/products/:slug" element={<ProductDetailPage />} />
              <Route path="/marketplace" element={<MarketplacePage />} />
              <Route path="/providers/:slug" element={<ProviderDetailPage />} />
              <Route path="/listings/:id" element={<ListingDetailPage />} />
              <Route path="/list-your-business" element={<ListYourBusinessPage />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/events/:slug" element={<EventDetailPage />} />
              <Route path="/search" element={<SearchPage />} />
              {/* Destination Guides */}
              <Route path="/destinations" element={<DistrictsPage />} />
              <Route path="/destinations/:slug" element={<DestinationGuidePage />} />
              <Route path="/destinations/:slug/:placeSlug" element={<DestinationPlaceDetailPage />} />
              {/* Cultural Content System - Multi-level hierarchy */}
              <Route path="/districts/:districtSlug/:categorySlug" element={<CulturalCategoryPage />} />
              <Route path="/districts/:districtSlug/:categorySlug/:subcategorySlug" element={<CulturalSubcategoryPage />} />
              <Route path="/districts/:districtSlug/:categorySlug/:subcategorySlug/:contentSlug" element={<CulturalContentDetailPage />} />
              {/* Auth */}
              <Route path="/login" element={<AuthPage />} />
              <Route path="/auth" element={<Navigate to="/login" replace />} />
              <Route path="/pending-approval" element={<PendingApprovalRoute />} />
              <Route path="/admin/unauthorized" element={<UnauthorizedPage />} />
              <Route path="/admin" element={<AdminDashboardRoute><AdminDashboard /></AdminDashboardRoute>} />
              <Route path="/admin/ai-tools" element={<AdminRoute><AdminAIToolsPage /></AdminRoute>} />
              <Route path="/admin/ai-settings" element={<AdminRoute><AdminAISettingsPage /></AdminRoute>} />
              <Route path="/admin/bulk-ai" element={<AdminRoute><AdminBulkAIPage /></AdminRoute>} />
              <Route path="/admin/homepage-ctas" element={<AdminRoute><AdminHomepageCTAsPage /></AdminRoute>} />
              <Route path="/admin/map-settings" element={<AdminRoute><AdminMapSettingsPage /></AdminRoute>} />
              <Route path="/admin/map" element={<AdminRoute><AdminMapPage /></AdminRoute>} />
              <Route path="/admin/content/culture" element={<AdminRoute><AdminCulturePage /></AdminRoute>} />
              <Route path="/admin/content/food" element={<AdminRoute><AdminFoodContentPage /></AdminRoute>} />
              <Route path="/admin/content/travel" element={<AdminRoute><AdminTravelContentPage /></AdminRoute>} />
              <Route path="/admin/content/thoughts" element={<AdminRoute><AdminThoughtsContentPage /></AdminRoute>} />
              <Route path="/admin/community-submissions" element={<AdminRoute><AdminCommunitySubmissionsPage /></AdminRoute>} />
              <Route path="/admin/districts" element={<AdminRoute><AdminDistrictsPage /></AdminRoute>} />
              <Route path="/admin/district-content" element={<AdminRoute><AdminDistrictContentPage /></AdminRoute>} />
              <Route path="/admin/villages" element={<AdminRoute><AdminVillagesPage /></AdminRoute>} />
              <Route path="/admin/villages/:id/content" element={<AdminRoute><AdminVillageContentPage /></AdminRoute>} />
              <Route path="/admin/villages/:id/economy" element={<AdminRoute><AdminVillageEconomyPage /></AdminRoute>} />
              <Route path="/admin/hotels" element={<AdminRoute><AdminHotelsPage /></AdminRoute>} />
              <Route path="/admin/festivals" element={<AdminRoute><AdminFestivalsPage /></AdminRoute>} />
              <Route path="/admin/gallery" element={<AdminRoute><AdminGalleryPage /></AdminRoute>} />
              <Route path="/admin/site-images" element={<AdminRoute><AdminSiteImagesPage /></AdminRoute>} />
              <Route path="/admin/highlights" element={<AdminRoute><AdminHighlightsPage /></AdminRoute>} />
              <Route path="/admin/featured-highlights" element={<AdminRoute><AdminFeaturedHighlightsPage /></AdminRoute>} />
              <Route path="/admin/featured-cards" element={<AdminRoute><AdminFeaturedCardsPage /></AdminRoute>} />
              <Route path="/admin/featured-content" element={<AdminRoute><AdminFeaturedContentPage /></AdminRoute>} />
              <Route path="/admin/thoughts" element={<AdminRoute><AdminThoughtsPage /></AdminRoute>} />
              <Route path="/admin/submissions" element={<AdminRoute><AdminSubmissionsPage /></AdminRoute>} />
              <Route path="/admin/analytics" element={<AdminRoute><AdminAnalyticsPage /></AdminRoute>} />
              {/* Approvals and Roles now merged into /admin/users */}
              <Route path="/admin/approvals" element={<Navigate to="/admin/users" replace />} />
              <Route path="/admin/roles" element={<Navigate to="/admin/users" replace />} />
              <Route path="/admin/users" element={<AdminRoute><AdminUserManagementPage /></AdminRoute>} />
              <Route path="/admin/site-settings" element={<AdminRoute><AdminSiteSettingsPage /></AdminRoute>} />
              <Route path="/admin/stories" element={<AdminRoute><AdminStoriesPage /></AdminRoute>} />
              <Route path="/admin/events" element={<AdminRoute><AdminEventsPage /></AdminRoute>} />
              <Route path="/admin/pages" element={<AdminRoute><AdminPagesPage /></AdminRoute>} />
              <Route path="/admin/footer-links" element={<AdminRoute><AdminFooterLinksPage /></AdminRoute>} />
              <Route path="/admin/content-sections" element={<AdminRoute><AdminContentSectionsPage /></AdminRoute>} />
              {/* Admin District Content Routes */}
              <Route path="/admin/district-places" element={<AdminRoute><AdminDistrictPlacesPage /></AdminRoute>} />
              <Route path="/admin/district-foods" element={<AdminRoute><AdminDistrictFoodsPage /></AdminRoute>} />
              <Route path="/admin/district-festivals" element={<AdminRoute><AdminDistrictFestivalsPage /></AdminRoute>} />
              {/* Admin Tourism Marketplace Routes */}
              <Route path="/admin/tourism-providers" element={<AdminRoute><AdminTourismProvidersPage /></AdminRoute>} />
              <Route path="/admin/tourism-listings" element={<AdminRoute><AdminTourismListingsPage /></AdminRoute>} />
              <Route path="/admin/tourism-inquiries" element={<AdminRoute><AdminTourismInquiriesPage /></AdminRoute>} />
              {/* Admin Monetization Routes */}
              <Route path="/admin/promotion-packages" element={<AdminRoute><AdminPromotionPackagesPage /></AdminRoute>} />
              <Route path="/admin/promotion-requests" element={<AdminRoute><AdminPromotionRequestsPage /></AdminRoute>} />
              <Route path="/admin/travel-packages" element={<AdminRoute><AdminTravelPackagesPage /></AdminRoute>} />
              <Route path="/admin/travel-requests" element={<AdminRoute><AdminTravelRequestsPage /></AdminRoute>} />
              <Route path="/admin/product-categories" element={<AdminRoute><AdminProductCategoriesPage /></AdminRoute>} />
              <Route path="/admin/products" element={<AdminRoute><AdminProductsPage /></AdminRoute>} />
              <Route path="/admin/product-orders" element={<AdminRoute><AdminProductOrdersPage /></AdminRoute>} />
              <Route path="/admin/page-settings" element={<AdminRoute><AdminPageSettingsPage /></AdminRoute>} />
              <Route path="/admin/bookings" element={<AdminRoute><AdminBookingsPage /></AdminRoute>} />
              <Route path="/admin/notify-settings" element={<AdminRoute><AdminNotifySettingsPage /></AdminRoute>} />
              <Route path="/admin/media-import" element={<AdminRoute><AdminMediaImportPage /></AdminRoute>} />
              <Route path="/admin/share-settings" element={<AdminRoute><AdminShareSettingsPage /></AdminRoute>} />
              <Route path="/admin/share-preview" element={<AdminRoute><AdminSharePreviewPage /></AdminRoute>} />
              {/* Destination Guides Admin */}
              <Route path="/admin/destination-guides" element={<AdminRoute><AdminDestinationGuidesPage /></AdminRoute>} />
              <Route path="/admin/destination-places" element={<AdminRoute><AdminDestinationPlacesPage /></AdminRoute>} />
              {/* Cultural Content Admin */}
              <Route path="/admin/cultural-categories" element={<AdminRoute><AdminCulturalCategoriesPage /></AdminRoute>} />
              <Route path="/admin/cultural-subcategories" element={<AdminRoute><AdminCulturalSubcategoriesPage /></AdminRoute>} />
              <Route path="/admin/cultural-content" element={<AdminRoute><AdminCulturalContentPage /></AdminRoute>} />
              {/* Cookie Consent Admin */}
              <Route path="/admin/cookie-consent" element={<AdminRoute><AdminCookieConsentPage /></AdminRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>
        {/* Hide Footer on admin and auth routes */}
        {!isAdminRoute && !isAuthRoute && <Footer />}
        {/* Floating Share Button only on public pages */}
        {!isAdminRoute && !isAuthRoute && <FloatingShareButton />}
        {/* Quick Access Bar only on public pages */}
        {!isAdminRoute && !isAuthRoute && <QuickAccessBar />}
      </div>
      <SearchModal />
    </>
  );
});
AppContent.displayName = "AppContent";

const App = () => (
  <BrowserRouter>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <ReadingModeProvider>
            <CookieConsentProvider>
              <AnalyticsProvider>
                <SearchProvider>
                  <Toaster />
                  <Sonner />
                  <ErrorBoundary>
                    <AppContent />
                  </ErrorBoundary>
                </SearchProvider>
              </AnalyticsProvider>
            </CookieConsentProvider>
          </ReadingModeProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </BrowserRouter>
);

export default App;
