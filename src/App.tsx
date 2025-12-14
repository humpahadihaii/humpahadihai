import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnalyticsProvider } from "./components/AnalyticsProvider";
import { SearchProvider, SearchModal } from "./components/search";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";
import { AdminToolbar } from "./components/AdminToolbar";
import { QuickAccessBar } from "./components/QuickAccessBar";
import HomePage from "./pages/HomePage";
import CulturePage from "./pages/CulturePage";
import FoodPage from "./pages/FoodPage";
import TravelPage from "./pages/TravelPage";
import DistrictsPage from "./pages/DistrictsPage";
import DistrictDetailPage from "./pages/DistrictDetailPage";
import VillageDetailPage from "./pages/VillageDetailPage";
import GalleryPage from "./pages/GalleryPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsPage from "./pages/TermsPage";
import DisclaimerPage from "./pages/DisclaimerPage";
import AuthPage from "./pages/AuthPage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminRoute from "./components/AdminRoute";
import AdminDashboardRoute from "./components/AdminDashboardRoute";
import ThoughtsPage from "./pages/ThoughtsPage";
import SubmitThoughtPage from "./pages/SubmitThoughtPage";
import SubmitStoryPage from "./pages/SubmitStoryPage";
import MySubmissionsPage from "./pages/MySubmissionsPage";
import ContentDetailPage from "./pages/ContentDetailPage";
import AdminThoughtsPage from "./pages/AdminThoughtsPage";
import AdminSubmissionsPage from "./pages/AdminSubmissionsPage";
import AdminCommunitySubmissionsPage from "./pages/admin/AdminCommunitySubmissionsPage";
import AdminCulturePage from "./pages/admin/AdminCulturePage";
import AdminFoodContentPage from "./pages/admin/AdminFoodContentPage";
import AdminTravelContentPage from "./pages/admin/AdminTravelContentPage";
import AdminThoughtsContentPage from "./pages/admin/AdminThoughtsContentPage";
import AdminAnalyticsPage from "./pages/admin/AdminAnalyticsPage";
import AdminDistrictsPage from "./pages/admin/AdminDistrictsPage";
import AdminHotelsPage from "./pages/admin/AdminHotelsPage";
import AdminVillagesPage from "./pages/admin/AdminVillagesPage";
import AdminVillageContentPage from "./pages/admin/AdminVillageContentPage";
import AdminVillageEconomyPage from "./pages/admin/AdminVillageEconomyPage";
import AdminFestivalsPage from "./pages/admin/AdminFestivalsPage";
import AdminGalleryPage from "./pages/admin/AdminGalleryPage";
import AdminSiteImagesPage from "./pages/admin/AdminSiteImagesPage";
import AdminHighlightsPage from "./pages/admin/AdminHighlightsPage";
import AdminDistrictContentPage from "./pages/admin/AdminDistrictContentPage";
import AdminFeaturedHighlightsPage from "./pages/admin/AdminFeaturedHighlightsPage";
// AdminApprovalsPage and AdminRoleManagementPage merged into AdminUserManagementPage
import AdminUserManagementPage from "./pages/admin/AdminUserManagementPage";
import AdminSiteSettingsPage from "./pages/admin/AdminSiteSettingsPage";
import AdminStoriesPage from "./pages/admin/AdminStoriesPage";
import AdminEventsPage from "./pages/admin/AdminEventsPage";
import AdminPagesPage from "./pages/admin/AdminPagesPage";
import AdminFooterLinksPage from "./pages/admin/AdminFooterLinksPage";
import AdminContentSectionsPage from "./pages/admin/AdminContentSectionsPage";
import PendingApprovalRoute from "./components/PendingApprovalRoute";
import NotFound from "./pages/NotFound";
import UnauthorizedPage from "./pages/admin/UnauthorizedPage";
// Monetization & New Features
import PromotionsPage from "./pages/PromotionsPage";
import TravelPackagesPage from "./pages/TravelPackagesPage";
import TravelPackageDetailPage from "./pages/TravelPackageDetailPage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import MarketplacePage from "./pages/MarketplacePage";
import ProviderDetailPage from "./pages/ProviderDetailPage";
import ListingDetailPage from "./pages/ListingDetailPage";
import ListYourBusinessPage from "./pages/ListYourBusinessPage";
import MapPage from "./pages/MapPage";
import EventsPage from "./pages/EventsPage";
import EventDetailPage from "./pages/EventDetailPage";
import SearchPage from "./pages/SearchPage";
// Admin Monetization Pages
import AdminPromotionPackagesPage from "./pages/admin/AdminPromotionPackagesPage";
import AdminPromotionRequestsPage from "./pages/admin/AdminPromotionRequestsPage";
import AdminTravelPackagesPage from "./pages/admin/AdminTravelPackagesPage";
import AdminTravelRequestsPage from "./pages/admin/AdminTravelRequestsPage";
import AdminProductCategoriesPage from "./pages/admin/AdminProductCategoriesPage";
import AdminProductsPage from "./pages/admin/AdminProductsPage";
import AdminProductOrdersPage from "./pages/admin/AdminProductOrdersPage";
import AdminAIToolsPage from "./pages/admin/AdminAIToolsPage";
import AdminAISettingsPage from "./pages/admin/AdminAISettingsPage";
import AdminBulkAIPage from "./pages/admin/AdminBulkAIPage";
import AdminPageSettingsPage from "./pages/admin/AdminPageSettingsPage";
import AdminMapSettingsPage from "./pages/admin/AdminMapSettingsPage";
// Admin District Content Pages
import AdminDistrictPlacesPage from "./pages/admin/AdminDistrictPlacesPage";
import AdminDistrictFoodsPage from "./pages/admin/AdminDistrictFoodsPage";
import AdminDistrictFestivalsPage from "./pages/admin/AdminDistrictFestivalsPage";
// Admin Tourism Marketplace Pages
import AdminTourismProvidersPage from "./pages/admin/AdminTourismProvidersPage";
import AdminTourismListingsPage from "./pages/admin/AdminTourismListingsPage";
import AdminTourismInquiriesPage from "./pages/admin/AdminTourismInquiriesPage";
import AdminBookingsPage from "./pages/admin/AdminBookingsPage";
import AdminNotifySettingsPage from "./pages/admin/AdminNotifySettingsPage";
import AdminFeaturedCardsPage from "./pages/admin/AdminFeaturedCardsPage";
import AdminMapPage from "./pages/admin/AdminMapPage";
import AdminMediaImportPage from "./pages/admin/AdminMediaImportPage";
import AdminShareSettingsPage from "./pages/admin/AdminShareSettingsPage";
import AdminSharePreviewPage from "./pages/admin/AdminSharePreviewPage";
import { FloatingShareButton } from "./components/share/FloatingShareButton";
import DestinationGuidePage from "./pages/DestinationGuidePage";
import DestinationPlaceDetailPage from "./pages/DestinationPlaceDetailPage";
import AdminDestinationGuidesPage from "./pages/admin/AdminDestinationGuidesPage";
import AdminDestinationPlacesPage from "./pages/admin/AdminDestinationPlacesPage";
// Cultural Content System
import CulturalCategoryPage from "./pages/CulturalCategoryPage";
import CulturalSubcategoryPage from "./pages/CulturalSubcategoryPage";
import CulturalContentDetailPage from "./pages/CulturalContentDetailPage";
import AdminCulturalCategoriesPage from "./pages/admin/AdminCulturalCategoriesPage";
import AdminCulturalSubcategoriesPage from "./pages/admin/AdminCulturalSubcategoriesPage";
import AdminCulturalContentPage from "./pages/admin/AdminCulturalContentPage";
import AdminFeaturedContentPage from "./pages/admin/AdminFeaturedContentPage";

const queryClient = new QueryClient();

// Component to conditionally render layout based on route
const AppContent = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");
  const isAuthRoute = location.pathname === "/login" || location.pathname === "/auth" || location.pathname === "/pending-approval";
  
  return (
    <>
      <AdminToolbar />
      <div className="flex flex-col min-h-screen">
        {/* Hide Navigation on admin and auth routes */}
        {!isAdminRoute && !isAuthRoute && <Navigation />}
        <main className="flex-grow">
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
            <Route path="/admin/destination-guides/:destinationId/places" element={<AdminRoute><AdminDestinationPlacesPage /></AdminRoute>} />
            {/* Cultural Content Admin */}
            <Route path="/admin/cultural-categories" element={<AdminRoute><AdminCulturalCategoriesPage /></AdminRoute>} />
            <Route path="/admin/cultural-subcategories" element={<AdminRoute><AdminCulturalSubcategoriesPage /></AdminRoute>} />
            <Route path="/admin/cultural-content" element={<AdminRoute><AdminCulturalContentPage /></AdminRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        {!isAdminRoute && !isAuthRoute && <Footer />}
        {!isAdminRoute && !isAuthRoute && <QuickAccessBar />}
        {!isAdminRoute && !isAuthRoute && <FloatingShareButton />}
      </div>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AnalyticsProvider>
          <SearchProvider>
            <AppContent />
            <SearchModal />
          </SearchProvider>
        </AnalyticsProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
