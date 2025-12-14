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
import { BottomNavigation } from "./components/BottomNavigation";
import { FloatingShareButton } from "./components/share/FloatingShareButton";
import { Suspense, lazy, memo, useState, useEffect, useRef, useCallback, ComponentType } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { cn } from "@/lib/utils";

// Retry wrapper for dynamic imports - handles stale chunk failures
function lazyWithRetry<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  retries = 1 // Reduced retries for faster failure
): React.LazyExoticComponent<T> {
  return lazy(async () => {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await importFn();
      } catch (error) {
        const isChunkError = error instanceof Error && 
          /Loading chunk|Failed to fetch dynamically imported module/.test(error.message);
        
        if (isChunkError && attempt < retries) {
          // Short wait then retry
          await new Promise(resolve => setTimeout(resolve, 300));
          continue;
        }
        
        // Final attempt failed - reload if chunk error
        if (isChunkError) {
          const reloadKey = 'chunk_reload_attempted';
          if (!sessionStorage.getItem(reloadKey)) {
            sessionStorage.setItem(reloadKey, 'true');
            window.location.reload();
          }
        }
        throw error;
      }
    }
    throw new Error('Failed to load module after retries');
  });
}

// Critical pages and route guards loaded eagerly for fast initial render
import HomePage from "./pages/HomePage";
import NotFound from "./pages/NotFound";
import AdminRoute from "./components/AdminRoute";
import AdminDashboardRoute from "./components/AdminDashboardRoute";
import PendingApprovalRoute from "./components/PendingApprovalRoute";

// Lazy load all other pages for code splitting with retry logic
const CulturePage = lazyWithRetry(() => import("./pages/CulturePage"));
const FoodPage = lazyWithRetry(() => import("./pages/FoodPage"));
const TravelPage = lazyWithRetry(() => import("./pages/TravelPage"));
const DistrictsPage = lazyWithRetry(() => import("./pages/DistrictsPage"));
const DistrictDetailPage = lazyWithRetry(() => import("./pages/DistrictDetailPage"));
const VillageDetailPage = lazyWithRetry(() => import("./pages/VillageDetailPage"));
const GalleryPage = lazyWithRetry(() => import("./pages/GalleryPage"));
const AboutPage = lazyWithRetry(() => import("./pages/AboutPage"));
const ContactPage = lazyWithRetry(() => import("./pages/ContactPage"));
const PrivacyPolicyPage = lazyWithRetry(() => import("./pages/PrivacyPolicyPage"));
const TermsPage = lazyWithRetry(() => import("./pages/TermsPage"));
const DisclaimerPage = lazyWithRetry(() => import("./pages/DisclaimerPage"));
const AuthPage = lazyWithRetry(() => import("./pages/AuthPage"));
const ThoughtsPage = lazyWithRetry(() => import("./pages/ThoughtsPage"));
const SubmitThoughtPage = lazyWithRetry(() => import("./pages/SubmitThoughtPage"));
const SubmitStoryPage = lazyWithRetry(() => import("./pages/SubmitStoryPage"));
const MySubmissionsPage = lazyWithRetry(() => import("./pages/MySubmissionsPage"));
const ContentDetailPage = lazyWithRetry(() => import("./pages/ContentDetailPage"));
const PromotionsPage = lazyWithRetry(() => import("./pages/PromotionsPage"));
const TravelPackagesPage = lazyWithRetry(() => import("./pages/TravelPackagesPage"));
const TravelPackageDetailPage = lazyWithRetry(() => import("./pages/TravelPackageDetailPage"));
const ProductsPage = lazyWithRetry(() => import("./pages/ProductsPage"));
const ProductDetailPage = lazyWithRetry(() => import("./pages/ProductDetailPage"));
const MarketplacePage = lazyWithRetry(() => import("./pages/MarketplacePage"));
const ProviderDetailPage = lazyWithRetry(() => import("./pages/ProviderDetailPage"));
const ListingDetailPage = lazyWithRetry(() => import("./pages/ListingDetailPage"));
const ListYourBusinessPage = lazyWithRetry(() => import("./pages/ListYourBusinessPage"));
const MapPage = lazyWithRetry(() => import("./pages/MapPage"));
const EventsPage = lazyWithRetry(() => import("./pages/EventsPage"));
const EventDetailPage = lazyWithRetry(() => import("./pages/EventDetailPage"));
const SearchPage = lazyWithRetry(() => import("./pages/SearchPage"));
const DestinationGuidePage = lazyWithRetry(() => import("./pages/DestinationGuidePage"));
const DestinationPlaceDetailPage = lazyWithRetry(() => import("./pages/DestinationPlaceDetailPage"));
const CulturalCategoryPage = lazyWithRetry(() => import("./pages/CulturalCategoryPage"));
const CulturalSubcategoryPage = lazyWithRetry(() => import("./pages/CulturalSubcategoryPage"));
const CulturalContentDetailPage = lazyWithRetry(() => import("./pages/CulturalContentDetailPage"));
const PlaceGuidePage = lazyWithRetry(() => import("./pages/PlaceGuidePage"));

// Admin pages - lazy loaded with retry logic
const AdminDashboard = lazyWithRetry(() => import("./pages/AdminDashboard"));
const UnauthorizedPage = lazyWithRetry(() => import("./pages/admin/UnauthorizedPage"));
const AdminThoughtsPage = lazyWithRetry(() => import("./pages/AdminThoughtsPage"));
const AdminSubmissionsPage = lazyWithRetry(() => import("./pages/AdminSubmissionsPage"));
const AdminCommunitySubmissionsPage = lazyWithRetry(() => import("./pages/admin/AdminCommunitySubmissionsPage"));
const AdminCulturePage = lazyWithRetry(() => import("./pages/admin/AdminCulturePage"));
const AdminFoodContentPage = lazyWithRetry(() => import("./pages/admin/AdminFoodContentPage"));
const AdminTravelContentPage = lazyWithRetry(() => import("./pages/admin/AdminTravelContentPage"));
const AdminThoughtsContentPage = lazyWithRetry(() => import("./pages/admin/AdminThoughtsContentPage"));
const AdminAnalyticsPage = lazyWithRetry(() => import("./pages/admin/AdminAnalyticsPage"));
const AdminDistrictsPage = lazyWithRetry(() => import("./pages/admin/AdminDistrictsPage"));
const AdminHotelsPage = lazyWithRetry(() => import("./pages/admin/AdminHotelsPage"));
const AdminVillagesPage = lazyWithRetry(() => import("./pages/admin/AdminVillagesPage"));
const AdminVillageContentPage = lazyWithRetry(() => import("./pages/admin/AdminVillageContentPage"));
const AdminVillageEconomyPage = lazyWithRetry(() => import("./pages/admin/AdminVillageEconomyPage"));
const AdminFestivalsPage = lazyWithRetry(() => import("./pages/admin/AdminFestivalsPage"));
const AdminGalleryPage = lazyWithRetry(() => import("./pages/admin/AdminGalleryPage"));
const AdminSiteImagesPage = lazyWithRetry(() => import("./pages/admin/AdminSiteImagesPage"));
const AdminHighlightsPage = lazyWithRetry(() => import("./pages/admin/AdminHighlightsPage"));
const AdminDistrictContentPage = lazyWithRetry(() => import("./pages/admin/AdminDistrictContentPage"));
const AdminFeaturedHighlightsPage = lazyWithRetry(() => import("./pages/admin/AdminFeaturedHighlightsPage"));
const AdminUserManagementPage = lazyWithRetry(() => import("./pages/admin/AdminUserManagementPage"));
const AdminSiteSettingsPage = lazyWithRetry(() => import("./pages/admin/AdminSiteSettingsPage"));
const AdminStoriesPage = lazyWithRetry(() => import("./pages/admin/AdminStoriesPage"));
const AdminEventsPage = lazyWithRetry(() => import("./pages/admin/AdminEventsPage"));
const AdminPagesPage = lazyWithRetry(() => import("./pages/admin/AdminPagesPage"));
const AdminFooterLinksPage = lazyWithRetry(() => import("./pages/admin/AdminFooterLinksPage"));
const AdminContentSectionsPage = lazyWithRetry(() => import("./pages/admin/AdminContentSectionsPage"));
const AdminPromotionPackagesPage = lazyWithRetry(() => import("./pages/admin/AdminPromotionPackagesPage"));
const AdminPromotionRequestsPage = lazyWithRetry(() => import("./pages/admin/AdminPromotionRequestsPage"));
const AdminTravelPackagesPage = lazyWithRetry(() => import("./pages/admin/AdminTravelPackagesPage"));
const AdminTravelRequestsPage = lazyWithRetry(() => import("./pages/admin/AdminTravelRequestsPage"));
const AdminProductCategoriesPage = lazyWithRetry(() => import("./pages/admin/AdminProductCategoriesPage"));
const AdminProductsPage = lazyWithRetry(() => import("./pages/admin/AdminProductsPage"));
const AdminProductOrdersPage = lazyWithRetry(() => import("./pages/admin/AdminProductOrdersPage"));
const AdminAIToolsPage = lazyWithRetry(() => import("./pages/admin/AdminAIToolsPage"));
const AdminAISettingsPage = lazyWithRetry(() => import("./pages/admin/AdminAISettingsPage"));
const AdminBulkAIPage = lazyWithRetry(() => import("./pages/admin/AdminBulkAIPage"));
const AdminHomepageCTAsPage = lazyWithRetry(() => import("./pages/admin/AdminHomepageCTAsPage"));
const AdminPageSettingsPage = lazyWithRetry(() => import("./pages/admin/AdminPageSettingsPage"));
const AdminMapSettingsPage = lazyWithRetry(() => import("./pages/admin/AdminMapSettingsPage"));
const AdminDistrictPlacesPage = lazyWithRetry(() => import("./pages/admin/AdminDistrictPlacesPage"));
const AdminDistrictFoodsPage = lazyWithRetry(() => import("./pages/admin/AdminDistrictFoodsPage"));
const AdminDistrictFestivalsPage = lazyWithRetry(() => import("./pages/admin/AdminDistrictFestivalsPage"));
const AdminTourismProvidersPage = lazyWithRetry(() => import("./pages/admin/AdminTourismProvidersPage"));
const AdminTourismListingsPage = lazyWithRetry(() => import("./pages/admin/AdminTourismListingsPage"));
const AdminTourismInquiriesPage = lazyWithRetry(() => import("./pages/admin/AdminTourismInquiriesPage"));
const AdminBookingsPage = lazyWithRetry(() => import("./pages/admin/AdminBookingsPage"));
const AdminNotifySettingsPage = lazyWithRetry(() => import("./pages/admin/AdminNotifySettingsPage"));
const AdminFeaturedCardsPage = lazyWithRetry(() => import("./pages/admin/AdminFeaturedCardsPage"));
const AdminMapPage = lazyWithRetry(() => import("./pages/admin/AdminMapPage"));
const AdminMediaImportPage = lazyWithRetry(() => import("./pages/admin/AdminMediaImportPage"));
const AdminShareSettingsPage = lazyWithRetry(() => import("./pages/admin/AdminShareSettingsPage"));
const AdminSharePreviewPage = lazyWithRetry(() => import("./pages/admin/AdminSharePreviewPage"));
const AdminDestinationGuidesPage = lazyWithRetry(() => import("./pages/admin/AdminDestinationGuidesPage"));
const AdminDestinationPlacesPage = lazyWithRetry(() => import("./pages/admin/AdminDestinationPlacesPage"));
const AdminCulturalCategoriesPage = lazyWithRetry(() => import("./pages/admin/AdminCulturalCategoriesPage"));
const AdminCulturalSubcategoriesPage = lazyWithRetry(() => import("./pages/admin/AdminCulturalSubcategoriesPage"));
const AdminCulturalContentPage = lazyWithRetry(() => import("./pages/admin/AdminCulturalContentPage"));
const AdminFeaturedContentPage = lazyWithRetry(() => import("./pages/admin/AdminFeaturedContentPage"));
const AdminCookieConsentPage = lazyWithRetry(() => import("./pages/admin/AdminCookieConsentPage"));
const AdminRoleManagementPage = lazyWithRetry(() => import("./pages/admin/AdminRoleManagementPage"));
const AdminApprovalsPage = lazyWithRetry(() => import("./pages/admin/AdminApprovalsPage"));
const AdminContentPage = lazyWithRetry(() => import("./pages/admin/AdminContentPage"));
const PendingApprovalPage = lazyWithRetry(() => import("./pages/PendingApprovalPage"));
const CMSPageView = lazyWithRetry(() => import("./pages/CMSPageView"));

// Optimized QueryClient with aggressive caching for faster loads
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000, // 10 minutes - longer cache
      gcTime: 60 * 60 * 1000, // 1 hour
      retry: 0, // No retries for faster failure
      refetchOnWindowFocus: false,
      refetchOnMount: false, // Don't refetch if data exists
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

// Minimal skeleton fallback for Suspense - reduced height for faster perceived load
const SuspenseFallback = memo(() => (
  <div className="min-h-[30vh] flex items-center justify-center">
    <div className="space-y-3 w-full max-w-sm px-4">
      <Skeleton className="h-6 w-2/3 mx-auto" />
      <Skeleton className="h-3 w-full" />
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
              {/* Route Explorer - Place Guides */}
              <Route path="/routes/:categorySlug/:districtSlug/:placeSlug" element={<PlaceGuidePage />} />
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
        {/* Bottom Navigation only on public pages (mobile) */}
        {!isAdminRoute && !isAuthRoute && <BottomNavigation />}
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
