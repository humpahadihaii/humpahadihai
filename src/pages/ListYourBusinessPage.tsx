import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Helmet } from "react-helmet";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Building2, CheckCircle, Users, TrendingUp, Globe } from "lucide-react";
import { usePageSettings } from "@/hooks/usePageSettings";

const BUSINESS_TYPES = [
  { value: "homestay", label: "Homestay" },
  { value: "hotel", label: "Hotel" },
  { value: "guesthouse", label: "Guesthouse" },
  { value: "guide", label: "Local Guide" },
  { value: "taxi", label: "Taxi Operator" },
  { value: "trek_operator", label: "Trek Operator" },
  { value: "tour_operator", label: "Tour Operator" },
  { value: "experience", label: "Local Experience" },
  { value: "other", label: "Other" },
];

const ListYourBusinessPage = () => {
  const { data: settings, isLoading: settingsLoading } = usePageSettings("list-your-business");
  const [submitted, setSubmitted] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [formData, setFormData] = useState({
    business_name: "",
    business_type: "",
    district_id: "",
    village_name: "",
    short_description: "",
    detailed_description: "",
    website_url: "",
    social_url: "",
    contact_name: "",
    phone: "",
    email: "",
    price_range: "",
    availability_notes: "",
  });

  const { data: districts = [] } = useQuery({
    queryKey: ["districts-public"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("districts")
        .select("id, name")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      // Create provider with is_active = false, source = intake_form
      const { error } = await supabase.from("tourism_providers").insert([{
        name: formData.business_name,
        type: formData.business_type,
        district_id: formData.district_id || null,
        description: formData.detailed_description || formData.short_description || null,
        website_url: formData.website_url || null,
        contact_name: formData.contact_name || null,
        phone: formData.phone || null,
        email: formData.email || null,
        is_active: false,
        is_verified: false,
        is_sample: false,
        source: "intake_form",
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      setSubmitted(true);
      toast.success("Application submitted successfully!");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to submit. Please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.business_name || !formData.business_type || !formData.contact_name || !formData.email) {
      toast.error("Please fill all required fields");
      return;
    }
    if (!agreed) {
      toast.error("Please agree to the terms");
      return;
    }
    submitMutation.mutate();
  };

  const benefits = [
    { icon: Globe, text: "Reach travelers from around the world" },
    { icon: Users, text: "Connect with authentic travel seekers" },
    { icon: TrendingUp, text: "Grow your local tourism business" },
    { icon: CheckCircle, text: "Free listing for verified providers" },
  ];

  const heroBullets = settings?.hero_bullets || [
    "Free listing for local businesses",
    "Reach authentic travel seekers",
    "Support the local Uttarakhand economy",
    "Get featured in our curated travel packages",
  ];

  if (submitted) {
    return (
      <>
        <Helmet>
          <title>Thank You | Hum Pahadi Haii</title>
        </Helmet>
        <Navigation />
        <main className="min-h-screen bg-background py-20">
          <div className="container mx-auto px-4 text-center max-w-2xl">
            <div className="bg-primary/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Thank You!</h1>
            <p className="text-lg text-muted-foreground mb-8">
              Your business application has been submitted successfully. Our team will review your details 
              and contact you shortly before listing your business on Hum Pahadi Haii.
            </p>
            <Button onClick={() => window.location.href = "/marketplace"}>
              Explore Marketplace
            </Button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{settings?.meta_title || "List Your Business | Hum Pahadi Haii"}</title>
        <meta name="description" content={settings?.meta_description || "Register your homestay, guesthouse, taxi service, or local experience on Hum Pahadi Haii."} />
      </Helmet>
      <Navigation />
      
      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 to-primary/5 py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <Building2 className="h-12 w-12 text-primary mx-auto mb-6" />
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                {settings?.hero_title || "List Your Pahadi Business"}
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                {settings?.hero_subtitle || "Join our growing community of local tourism providers and reach travelers from around the world"}
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                {heroBullets.map((bullet, i) => (
                  <div key={i} className="flex items-center gap-2 bg-background rounded-full px-4 py-2 shadow-sm">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span className="text-sm">{bullet}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Why Partner Section */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-center mb-8">
              {settings?.custom_section_title || "Why Partner With Us?"}
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {benefits.map((benefit, i) => (
                <Card key={i} className="text-center">
                  <CardContent className="pt-6">
                    <benefit.icon className="h-8 w-8 text-primary mx-auto mb-3" />
                    <p className="text-sm font-medium">{benefit.text}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Registration Form */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-2xl">
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Register Your Business</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Business Details */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg border-b pb-2">Business Details</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label>Business Name *</Label>
                        <Input
                          value={formData.business_name}
                          onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                          placeholder="e.g. Himalayan Homestay"
                          required
                        />
                      </div>
                      <div>
                        <Label>Business Type *</Label>
                        <Select 
                          value={formData.business_type} 
                          onValueChange={(v) => setFormData({ ...formData, business_type: v })}
                        >
                          <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                          <SelectContent>
                            {BUSINESS_TYPES.map((t) => (
                              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label>District *</Label>
                        <Select 
                          value={formData.district_id} 
                          onValueChange={(v) => setFormData({ ...formData, district_id: v })}
                        >
                          <SelectTrigger><SelectValue placeholder="Select district" /></SelectTrigger>
                          <SelectContent>
                            {districts.map((d) => (
                              <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Village/Town</Label>
                        <Input
                          value={formData.village_name}
                          onChange={(e) => setFormData({ ...formData, village_name: e.target.value })}
                          placeholder="e.g. Munsiyari"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Short Description</Label>
                      <Input
                        value={formData.short_description}
                        onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                        placeholder="One line about your business"
                      />
                    </div>
                    <div>
                      <Label>Detailed Description</Label>
                      <Textarea
                        value={formData.detailed_description}
                        onChange={(e) => setFormData({ ...formData, detailed_description: e.target.value })}
                        placeholder="Tell travelers about your offerings, unique features, and what makes your service special..."
                        rows={4}
                      />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label>Website URL</Label>
                        <Input
                          value={formData.website_url}
                          onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                          placeholder="https://..."
                        />
                      </div>
                      <div>
                        <Label>Instagram / Facebook URL</Label>
                        <Input
                          value={formData.social_url}
                          onChange={(e) => setFormData({ ...formData, social_url: e.target.value })}
                          placeholder="Social media link"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Contact Details */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg border-b pb-2">Contact Details</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label>Contact Person Name *</Label>
                        <Input
                          value={formData.contact_name}
                          onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                          placeholder="Full name"
                          required
                        />
                      </div>
                      <div>
                        <Label>Phone / WhatsApp *</Label>
                        <Input
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+91 9876543210"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Email *</Label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                  </div>

                  {/* Logistics */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg border-b pb-2">Additional Information</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label>Approximate Price Range</Label>
                        <Input
                          value={formData.price_range}
                          onChange={(e) => setFormData({ ...formData, price_range: e.target.value })}
                          placeholder="e.g. ₹1000-2000 per night"
                        />
                      </div>
                      <div>
                        <Label>Availability Notes</Label>
                        <Input
                          value={formData.availability_notes}
                          onChange={(e) => setFormData({ ...formData, availability_notes: e.target.value })}
                          placeholder="e.g. Open year-round"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Agreement */}
                  <div className="flex items-start gap-3 pt-4">
                    <Checkbox 
                      id="agree" 
                      checked={agreed} 
                      onCheckedChange={(c) => setAgreed(c === true)} 
                    />
                    <label htmlFor="agree" className="text-sm text-muted-foreground leading-relaxed">
                      I confirm that the above information is accurate and I want Hum Pahadi Haii to contact me about listing my business. 
                      I understand my listing will be reviewed before publication.
                    </label>
                  </div>

                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full"
                    disabled={submitMutation.isPending}
                  >
                    {submitMutation.isPending ? "Submitting..." : "Submit Application"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default ListYourBusinessPage;
