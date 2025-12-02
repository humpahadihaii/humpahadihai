import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FileText, Image, Plus, ExternalLink } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type CommunitySubmission = Database["public"]["Tables"]["community_submissions"]["Row"];

const MySubmissionsPage = () => {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<CommunitySubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthAndFetch();
  }, []);

  const checkAuthAndFetch = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please sign in to view your submissions");
      navigate("/auth");
      return;
    }
    setIsAuthenticated(true);
    await fetchSubmissions(user.id);
  };

  const fetchSubmissions = async (userId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("community_submissions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching submissions:", error);
      toast.error("Failed to load submissions");
    } else {
      setSubmissions(data || []);
    }
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-500";
      case "rejected":
        return "bg-red-500";
      case "needs_changes":
        return "bg-yellow-500";
      default:
        return "bg-blue-500";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "approved":
        return "Approved & Published";
      case "rejected":
        return "Rejected";
      case "needs_changes":
        return "Needs Changes";
      default:
        return "Under Review";
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-12 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-primary mb-2">My Submissions</h1>
            <p className="text-muted-foreground">Track the status of your stories and photos</p>
          </div>
          <Button asChild>
            <Link to="/submit-story">
              <Plus className="mr-2 h-4 w-4" />
              New Submission
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        ) : submissions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-lg text-muted-foreground mb-4">
                You haven't submitted anything yet.
              </p>
              <Button asChild>
                <Link to="/submit-story">Submit Your First Story</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {submissions.map((submission) => (
              <Card key={submission.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {submission.type === "story" ? (
                          <FileText className="h-5 w-5 text-primary" />
                        ) : (
                          <Image className="h-5 w-5 text-secondary" />
                        )}
                        <CardTitle className="text-xl">{submission.title}</CardTitle>
                      </div>
                      <CardDescription className="flex items-center gap-2">
                        <Badge variant="outline" className="capitalize">
                          {submission.target_section}
                        </Badge>
                        <span>•</span>
                        <span>{new Date(submission.created_at).toLocaleDateString()}</span>
                      </CardDescription>
                    </div>
                    <Badge className={`${getStatusColor(submission.status)} text-white`}>
                      {getStatusLabel(submission.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {submission.body && (
                    <p className="text-muted-foreground mb-4 line-clamp-2">{submission.body}</p>
                  )}
                  
                  {submission.reviewer_notes && (
                    <div className="bg-muted p-4 rounded-lg mb-4">
                      <p className="text-sm font-semibold mb-1">Reviewer Notes:</p>
                      <p className="text-sm text-muted-foreground">{submission.reviewer_notes}</p>
                    </div>
                  )}

                  {submission.status === "approved" && (
                    <div className="flex gap-2">
                      {submission.linked_content_item_id && (
                        <Button size="sm" variant="outline" asChild>
                          <a href={`/${submission.target_section}`} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="mr-2 h-3 w-3" />
                            View Published
                          </a>
                        </Button>
                      )}
                      {submission.linked_gallery_item_id && (
                        <Button size="sm" variant="outline" asChild>
                          <a href="/gallery" target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="mr-2 h-3 w-3" />
                            View in Gallery
                          </a>
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MySubmissionsPage;
