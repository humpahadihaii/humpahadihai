import { Card, CardContent } from "@/components/ui/card";
import { Shield, Lock, Eye, Database, Mail, Clock } from "lucide-react";

const PrivacyPolicyPage = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="py-16 md:py-20 px-4 bg-gradient-to-b from-primary/10 via-primary/5 to-background">
        <div className="container mx-auto max-w-4xl text-center">
          <Shield className="h-16 w-16 text-primary mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Privacy Policy
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your privacy matters to us. This policy explains how we collect, use, and protect your personal information.
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            Last updated: December 2024
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 md:py-16 px-4">
        <div className="container mx-auto max-w-4xl space-y-8">
          <Card>
            <CardContent className="pt-6 space-y-6">
              <div className="flex items-start gap-4">
                <Database className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-2">Information We Collect</h2>
                  <p className="text-muted-foreground mb-4">
                    We collect information you provide directly to us, including:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2">
                    <li>Name and email address when you contact us or subscribe to our newsletter</li>
                    <li>Content you submit, such as photos, stories, and comments</li>
                    <li>Account information if you create an account (for contributors/admins)</li>
                    <li>Location information (optional, when you share your village or region)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-6">
              <div className="flex items-start gap-4">
                <Eye className="h-6 w-6 text-emerald-500 flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-2">How We Use Your Information</h2>
                  <p className="text-muted-foreground mb-4">
                    We use the information we collect to:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2">
                    <li>Respond to your inquiries and provide customer support</li>
                    <li>Publish content you submit (with your permission)</li>
                    <li>Send newsletters and updates about Uttarakhand culture and heritage</li>
                    <li>Improve our website and services</li>
                    <li>Analyze usage patterns to enhance user experience</li>
                    <li>Comply with legal obligations</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-6">
              <div className="flex items-start gap-4">
                <Lock className="h-6 w-6 text-amber-500 flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-2">Data Security</h2>
                  <p className="text-muted-foreground">
                    We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes encryption of data in transit and at rest, regular security audits, and access controls for our team members.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-6">
              <div className="flex items-start gap-4">
                <Clock className="h-6 w-6 text-blue-500 flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-2">Data Retention</h2>
                  <p className="text-muted-foreground">
                    We retain your personal information only for as long as necessary to fulfill the purposes for which it was collected, including to satisfy any legal, accounting, or reporting requirements. Contact form submissions are retained for up to 2 years. Published content remains available unless you request its removal.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-2">Your Rights</h2>
                <p className="text-muted-foreground mb-4">
                  You have the right to:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Access the personal information we hold about you</li>
                  <li>Request correction of inaccurate information</li>
                  <li>Request deletion of your information</li>
                  <li>Opt out of marketing communications</li>
                  <li>Request removal of content you have submitted</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-6">
              <div className="flex items-start gap-4">
                <Mail className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-2">Contact Us</h2>
                  <p className="text-muted-foreground">
                    If you have any questions about this Privacy Policy or our data practices, please contact us at:
                  </p>
                  <a 
                    href="mailto:contact@humpahadihaii.in" 
                    className="text-primary font-medium hover:underline mt-2 inline-block"
                  >
                    contact@humpahadihaii.in
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default PrivacyPolicyPage;