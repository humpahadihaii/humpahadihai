import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Mail, Instagram, Facebook, Youtube } from "lucide-react";
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
});

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
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
          message: validatedData.subject 
            ? `${validatedData.subject}\n\n${validatedData.message}` 
            : validatedData.message,
        });

      if (error) throw error;
      
      toast.success("Message sent successfully! We'll get back to you soon.");
      
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
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
    <div className="min-h-screen">
      {/* Hero */}
      <section className="py-20 px-4 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-primary mb-6">Get in Touch</h1>
          <p className="text-xl text-foreground/80">
            We'd love to hear from you. Share your stories, suggestions, or collaborations.
          </p>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <Card className="shadow-xl">
                <CardHeader>
                  <CardTitle className="text-2xl text-primary">Send Us a Message</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Your full name"
                        className="mt-2"
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
                        className="mt-2"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        type="text"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        placeholder="What's this about?"
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Tell us what's on your mind..."
                        rows={6}
                        className="mt-2"
                        required
                      />
                    </div>

                    <Button type="submit" size="lg" className="w-full bg-primary hover:bg-primary/90">
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Contact Info & Social */}
            <div className="space-y-8">
              {/* Social Media */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl text-primary">Connect With Us</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <a 
                    href="https://instagram.com/hum_pahadi_haii" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 rounded-lg hover:bg-muted transition-colors group"
                  >
                    <Instagram className="h-8 w-8 text-secondary group-hover:scale-110 transition-transform" />
                    <div>
                      <p className="font-bold text-foreground">Instagram</p>
                      <p className="text-sm text-muted-foreground">@hum_pahadi_haii</p>
                    </div>
                  </a>

                  <a 
                    href="#"
                    className="flex items-center gap-4 p-4 rounded-lg hover:bg-muted transition-colors group"
                  >
                    <Facebook className="h-8 w-8 text-accent group-hover:scale-110 transition-transform" />
                    <div>
                      <p className="font-bold text-foreground">Facebook</p>
                      <p className="text-sm text-muted-foreground">Hum Pahadi Haii</p>
                    </div>
                  </a>

                  <a 
                    href="#"
                    className="flex items-center gap-4 p-4 rounded-lg hover:bg-muted transition-colors group"
                  >
                    <Youtube className="h-8 w-8 text-secondary group-hover:scale-110 transition-transform" />
                    <div>
                      <p className="font-bold text-foreground">YouTube</p>
                      <p className="text-sm text-muted-foreground">Hum Pahadi Haii</p>
                    </div>
                  </a>

                  <a 
                    href="mailto:contact@humpahadi.com"
                    className="flex items-center gap-4 p-4 rounded-lg hover:bg-muted transition-colors group"
                  >
                    <Mail className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
                    <div>
                      <p className="font-bold text-foreground">Email</p>
                      <p className="text-sm text-muted-foreground">contact@humpahadi.com</p>
                    </div>
                  </a>
                </CardContent>
              </Card>

              {/* Collaboration */}
              <Card className="shadow-lg bg-gradient-to-br from-primary/5 to-accent/5">
                <CardHeader>
                  <CardTitle className="text-2xl text-primary">Collaborations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-foreground/80">
                  <p>We're open to collaborations with:</p>
                  <ul className="list-disc list-inside space-y-2 ml-2">
                    <li>Cultural organizations and heritage groups</li>
                    <li>Traditional artisans and craftspeople</li>
                    <li>Food bloggers and culinary experts</li>
                    <li>Travel writers and photographers</li>
                    <li>Researchers studying Himalayan culture</li>
                    <li>Tourism boards and ethical travel companies</li>
                  </ul>
                  <p className="pt-2 font-medium">
                    Have an idea? Let's work together to celebrate Uttarakhand!
                  </p>
                </CardContent>
              </Card>

              {/* Newsletter */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl text-primary">Newsletter (Coming Soon)</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground/80 mb-4">
                    Subscribe to receive monthly updates on Pahadi culture, festivals, recipes, and travel tips.
                  </p>
                  <div className="flex gap-2">
                    <Input type="email" placeholder="Enter your email" disabled />
                    <Button disabled>Subscribe</Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Newsletter feature launching soon!</p>
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
