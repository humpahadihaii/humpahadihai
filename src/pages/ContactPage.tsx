import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Mail, Instagram, Facebook, Youtube, Send, HelpCircle, Camera, Megaphone, Handshake, Shield, Users, Settings, FileText, Scale, AlertTriangle } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

const contactSchema = z.object({
  name: z.string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  email: z.string()
    .trim()
    .email("Invalid email address")
    .max(255, "Email must be less than 255 characters"),
  subject: z.string()
    .trim()
    .max(200, "Subject must be less than 200 characters")
    .optional(),
  message: z.string()
    .trim()
    .min(1, "Message is required")
    .max(2000, "Message must be less than 2000 characters"),
  reason: z.string()
    .trim()
    .min(1, "Please select a reason"),
  location: z.string()
    .trim()
    .max(100, "Location must be less than 100 characters")
    .optional(),
});

const emailContacts = [
  {
    email: "contact@humpahadihaii.in",
    label: "General Enquiries",
    description: "For general questions and feedback about our platform",
    icon: Mail,
    color: "text-primary"
  },
  {
    email: "support@humpahadihaii.in",
    label: "Support & Technical Help",
    description: "Having trouble? Our support team is here to help",
    icon: HelpCircle,
    color: "text-blue-500"
  },
  {
    email: "info@humpahadihaii.in",
    label: "Information & Media Requests",
    description: "Press inquiries, interviews, and media partnerships",
    icon: Send,
    color: "text-emerald-500"
  },
  {
    email: "post@humpahadihaii.in",
    label: "Content Submission",
    description: "Share your photos, videos, and stories from Uttarakhand",
    icon: Camera,
    color: "text-amber-500"
  },
  {
    email: "promotions@humpahadihaii.in",
    label: "Paid Promotions & Advertising",
    description: "Promote your brand to our Pahadi community",
    icon: Megaphone,
    color: "text-rose-500"
  },
  {
    email: "collabs@humpahadihaii.in",
    label: "Brand & Creator Collaborations",
    description: "Partner with us on creative projects and campaigns",
    icon: Handshake,
    color: "text-violet-500"
  },
  {
    email: "copyright@humpahadihaii.in",
    label: "Copyright / Credit / Removal",
    description: "Content ownership, credit requests, or takedown notices",
    icon: Shield,
    color: "text-slate-500"
  },
  {
    email: "team@humpahadihaii.in",
    label: "Team Communication",
    description: "Internal team and contributor communications",
    icon: Users,
    color: "text-teal-500"
  },
  {
    email: "admin@humpahadihaii.in",
    label: "Website & Admin Support",
    description: "Technical administration and website management",
    icon: Settings,
    color: "text-orange-500"
  }
];

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    reason: "",
    location: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validatedData = contactSchema.parse(formData);
      
      const { error } = await supabase
        .from('user_submissions')
        .insert({
          name: validatedData.name,
          email: validatedData.email,
          subject: validatedData.subject,
          message: validatedData.message,
          reason: validatedData.reason,
          location: validatedData.location,
        });

      if (error) throw error;
      
      toast.success("Message sent successfully! We'll get back to you soon.");
      
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
        reason: "",
        location: "",
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error("Failed to send message. Please try again.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="py-16 md:py-24 px-4 bg-gradient-to-b from-primary/10 via-primary/5 to-background">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4">
            Get in Touch
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            We'd love to hear from you! Whether you have questions, stories to share, 
            or want to collaborate — reach out to the right team below.
          </p>
        </div>
      </section>

      {/* Email Directory */}
      <section className="py-12 md:py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              Contact Directory
            </h2>
            <p className="text-muted-foreground">
              Choose the right email for your query to get a faster response
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {emailContacts.map((contact) => {
              const IconComponent = contact.icon;
              return (
                <a
                  key={contact.email}
                  href={`mailto:${contact.email}`}
                  className="group block p-5 rounded-xl border border-border bg-card hover:bg-accent/50 hover:border-primary/30 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-2.5 rounded-lg bg-background border border-border group-hover:border-primary/20 ${contact.color}`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground text-sm mb-1">
                        {contact.label}
                      </h3>
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                        {contact.description}
                      </p>
                      <p className="text-xs font-medium text-primary truncate group-hover:underline">
                        {contact.email}
                      </p>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Form & Social */}
      <section className="py-12 md:py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Contact Form */}
            <div className="lg:col-span-3">
              <Card className="shadow-lg border-border">
                <CardHeader>
                  <CardTitle className="text-xl text-foreground">Send Us a Message</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    For quick queries, fill out this form and we'll respond within 48 hours.
                  </p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Name *</Label>
                        <Input
                          id="name"
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Your full name"
                          className="mt-1.5"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="your.email@example.com"
                          className="mt-1.5"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="reason">Reason for Contact *</Label>
                        <select
                          id="reason"
                          value={formData.reason}
                          onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring mt-1.5"
                          required
                        >
                          <option value="">Select a reason</option>
                          <option value="general">General Inquiry</option>
                          <option value="collaboration">Collaboration</option>
                          <option value="media">Media Inquiry</option>
                          <option value="content">Content Submission</option>
                          <option value="support">Technical Support</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="location">Location (Optional)</Label>
                        <Input
                          id="location"
                          type="text"
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          placeholder="Where are you from?"
                          className="mt-1.5"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        type="text"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        placeholder="What's this about?"
                        className="mt-1.5"
                      />
                    </div>

                    <div>
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Tell us what's on your mind..."
                        rows={5}
                        className="mt-1.5"
                        required
                      />
                    </div>

                    <Button type="submit" size="lg" className="w-full">
                      <Send className="h-4 w-4 mr-2" />
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Social & Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Social Media */}
              <Card className="shadow-md border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-foreground">Follow Us</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <a 
                    href="https://www.instagram.com/hum_pahadi_haii" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors group"
                  >
                    <Instagram className="h-5 w-5 text-pink-500" />
                    <div>
                      <p className="font-medium text-foreground text-sm">@hum_pahadi_haii</p>
                      <p className="text-xs text-muted-foreground">Instagram</p>
                    </div>
                  </a>

                  <a 
                    href="https://www.facebook.com/humpahadihaii"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors group"
                  >
                    <Facebook className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-foreground text-sm">Hum Pahadi Haii</p>
                      <p className="text-xs text-muted-foreground">Facebook</p>
                    </div>
                  </a>

                  <a 
                    href="https://www.youtube.com/channel/UCXAv369YY6a7UYdbgqkhPvw?sub_confirmation=1"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors group"
                  >
                    <Youtube className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium text-foreground text-sm">Hum Pahadi Haii</p>
                      <p className="text-xs text-muted-foreground">YouTube</p>
                    </div>
                  </a>

                  <a 
                    href="https://x.com/HumPahadiHaii"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors group"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    <div>
                      <p className="font-medium text-foreground text-sm">@HumPahadiHaii</p>
                      <p className="text-xs text-muted-foreground">X (Twitter)</p>
                    </div>
                  </a>
                </CardContent>
              </Card>

              {/* Quick Note */}
              <Card className="shadow-md border-border bg-primary/5">
                <CardContent className="pt-5">
                  <div className="flex gap-3">
                    <Mail className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground text-sm mb-1">Response Time</p>
                      <p className="text-xs text-muted-foreground">
                        We typically respond within 24-48 hours. For urgent matters, DM us on Instagram for faster assistance.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Legal Links */}
              <Card className="shadow-md border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-foreground">Legal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link 
                    to="/privacy-policy"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors group"
                  >
                    <FileText className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium text-foreground text-sm group-hover:text-primary transition-colors">Privacy Policy</p>
                      <p className="text-xs text-muted-foreground">How we collect, use, and protect your data</p>
                    </div>
                  </Link>

                  <Link 
                    to="/terms"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors group"
                  >
                    <Scale className="h-5 w-5 text-emerald-500" />
                    <div>
                      <p className="font-medium text-foreground text-sm group-hover:text-primary transition-colors">Terms & Conditions</p>
                      <p className="text-xs text-muted-foreground">Rules and guidelines for using our platform</p>
                    </div>
                  </Link>

                  <Link 
                    to="/disclaimer"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors group"
                  >
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    <div>
                      <p className="font-medium text-foreground text-sm group-hover:text-primary transition-colors">Disclaimer</p>
                      <p className="text-xs text-muted-foreground">Important notices about content and liability</p>
                    </div>
                  </Link>
                </CardContent>
              </Card>

              {/* Collaboration CTA */}
              <Card className="shadow-md border-border">
                <CardContent className="pt-5">
                  <div className="flex gap-3">
                    <Handshake className="h-5 w-5 text-violet-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground text-sm mb-1">Want to Collaborate?</p>
                      <p className="text-xs text-muted-foreground mb-2">
                        We love working with creators, artists, and brands passionate about Uttarakhand.
                      </p>
                      <a 
                        href="mailto:collabs@humpahadihaii.in" 
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        collabs@humpahadihaii.in →
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;