import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";
import { AdminToolbar } from "./components/AdminToolbar";
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
import AdminFestivalsPage from "./pages/admin/AdminFestivalsPage";
import AdminGalleryPage from "./pages/admin/AdminGalleryPage";
import AdminSiteImagesPage from "./pages/admin/AdminSiteImagesPage";
import AdminHighlightsPage from "./pages/admin/AdminHighlightsPage";
import AdminDistrictContentPage from "./pages/admin/AdminDistrictContentPage";
import AdminFeaturedHighlightsPage from "./pages/admin/AdminFeaturedHighlightsPage";
import AdminApprovalsPage from "./pages/admin/AdminApprovalsPage";
import AdminRoleManagementPage from "./pages/admin/AdminRoleManagementPage";
import AdminUserManagementPage from "./pages/admin/AdminUserManagementPage";
import PendingApprovalPage from "./pages/PendingApprovalPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AdminToolbar />
        <div className="flex flex-col min-h-screen">
          <Navigation />
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
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/pending-approval" element={<PendingApprovalPage />} />
              <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              <Route path="/admin/content/culture" element={<AdminRoute><AdminCulturePage /></AdminRoute>} />
              <Route path="/admin/content/food" element={<AdminRoute><AdminFoodContentPage /></AdminRoute>} />
              <Route path="/admin/content/travel" element={<AdminRoute><AdminTravelContentPage /></AdminRoute>} />
              <Route path="/admin/content/thoughts" element={<AdminRoute><AdminThoughtsContentPage /></AdminRoute>} />
              <Route path="/admin/community-submissions" element={<AdminRoute><AdminCommunitySubmissionsPage /></AdminRoute>} />
              <Route path="/admin/districts" element={<AdminRoute><AdminDistrictsPage /></AdminRoute>} />
              <Route path="/admin/district-content" element={<AdminRoute><AdminDistrictContentPage /></AdminRoute>} />
              <Route path="/admin/villages" element={<AdminRoute><AdminVillagesPage /></AdminRoute>} />
              <Route path="/admin/hotels" element={<AdminRoute><AdminHotelsPage /></AdminRoute>} />
              <Route path="/admin/festivals" element={<AdminRoute><AdminFestivalsPage /></AdminRoute>} />
              <Route path="/admin/gallery" element={<AdminRoute><AdminGalleryPage /></AdminRoute>} />
              <Route path="/admin/site-images" element={<AdminRoute><AdminSiteImagesPage /></AdminRoute>} />
              <Route path="/admin/highlights" element={<AdminRoute><AdminHighlightsPage /></AdminRoute>} />
              <Route path="/admin/featured-highlights" element={<AdminRoute><AdminFeaturedHighlightsPage /></AdminRoute>} />
              <Route path="/admin/thoughts" element={<AdminRoute><AdminThoughtsPage /></AdminRoute>} />
              <Route path="/admin/submissions" element={<AdminRoute><AdminSubmissionsPage /></AdminRoute>} />
              <Route path="/admin/analytics" element={<AdminRoute><AdminAnalyticsPage /></AdminRoute>} />
              <Route path="/admin/approvals" element={<AdminRoute><AdminApprovalsPage /></AdminRoute>} />
              <Route path="/admin/roles" element={<AdminRoute><AdminRoleManagementPage /></AdminRoute>} />
              <Route path="/admin/users" element={<AdminRoute><AdminUserManagementPage /></AdminRoute>} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
