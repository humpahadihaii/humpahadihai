import { Card, CardContent } from "@/components/ui/card";
import { Scale, FileCheck, Users, AlertCircle, Ban, Gavel } from "lucide-react";

const TermsPage = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="py-16 md:py-20 px-4 bg-gradient-to-b from-primary/10 via-primary/5 to-background">
        <div className="container mx-auto max-w-4xl text-center">
          <Scale className="h-16 w-16 text-emerald-500 mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Terms & Conditions
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Please read these terms carefully before using our website and services.
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
                <FileCheck className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-2">Acceptance of Terms</h2>
                  <p className="text-muted-foreground">
                    By accessing and using Hum Pahadi Haii (humpahadihaii.in), you accept and agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our website. We reserve the right to modify these terms at any time, and your continued use of the website constitutes acceptance of any changes.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-6">
              <div className="flex items-start gap-4">
                <Users className="h-6 w-6 text-blue-500 flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-2">User Conduct</h2>
                  <p className="text-muted-foreground mb-4">
                    When using our website, you agree to:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2">
                    <li>Provide accurate and truthful information when submitting content or contacting us</li>
                    <li>Respect the cultural heritage and traditions represented on our platform</li>
                    <li>Not post content that is offensive, defamatory, or infringes on others' rights</li>
                    <li>Not attempt to gain unauthorized access to our systems or data</li>
                    <li>Not use automated tools to scrape or download content without permission</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-6">
              <div className="flex items-start gap-4">
                <Gavel className="h-6 w-6 text-amber-500 flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-2">Content Ownership & Usage</h2>
                  <p className="text-muted-foreground mb-4">
                    Regarding content on our website:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2">
                    <li>All original content created by Hum Pahadi Haii is our intellectual property</li>
                    <li>User-submitted content remains the property of the original creator</li>
                    <li>By submitting content, you grant us a non-exclusive license to use, display, and share it on our platform</li>
                    <li>We will always provide proper credit to content creators where applicable</li>
                    <li>You may not reproduce, distribute, or use our content commercially without written permission</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-6">
              <div className="flex items-start gap-4">
                <AlertCircle className="h-6 w-6 text-rose-500 flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-2">Content Moderation</h2>
                  <p className="text-muted-foreground">
                    We reserve the right to review, edit, or remove any user-submitted content that violates these terms or is deemed inappropriate for our platform. All submissions go through a moderation process before being published. We may reject content without providing specific reasons, though we strive to communicate with contributors when possible.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-6">
              <div className="flex items-start gap-4">
                <Ban className="h-6 w-6 text-slate-500 flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-2">Prohibited Activities</h2>
                  <p className="text-muted-foreground mb-4">
                    The following activities are strictly prohibited:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2">
                    <li>Posting false, misleading, or defamatory content about Uttarakhand's culture or people</li>
                    <li>Sharing content that promotes hatred, discrimination, or violence</li>
                    <li>Submitting content you do not have rights to share</li>
                    <li>Using our platform for commercial advertising without prior approval</li>
                    <li>Impersonating others or misrepresenting your affiliation</li>
                    <li>Attempting to disrupt or damage our website or servers</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold text-foreground mb-2">Limitation of Liability</h2>
              <p className="text-muted-foreground">
                Hum Pahadi Haii is provided "as is" without warranties of any kind. We are not liable for any damages arising from your use of our website or reliance on information provided. We do not guarantee the accuracy, completeness, or timeliness of all content, particularly user-submitted material. Travel information should be verified independently before making travel plans.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold text-foreground mb-2">Contact</h2>
              <p className="text-muted-foreground">
                For questions about these Terms & Conditions, please contact us at:
              </p>
              <a 
                href="mailto:contact@humpahadihaii.in" 
                className="text-primary font-medium hover:underline mt-2 inline-block"
              >
                contact@humpahadihaii.in
              </a>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default TermsPage;