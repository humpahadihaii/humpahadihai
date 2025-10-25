import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Archive, Trash2, Mail } from "lucide-react";

interface Submission {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  reason: string | null;
  location: string | null;
  status: string;
  created_at: string;
  replied_at: string | null;
  archived_at: string | null;
}

const AdminSubmissionsPage = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [filter, setFilter] = useState<"pending" | "replied" | "archived">("pending");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubmissions();
  }, [filter]);

  const fetchSubmissions = async () => {
    setLoading(true);
    let query = supabase
      .from("user_submissions")
      .select("*")
      .order("created_at", { ascending: false });

    if (filter === "archived") {
      query = query.not("archived_at", "is", null);
    } else if (filter === "replied") {
      query = query.not("replied_at", "is", null).is("archived_at", null);
    } else {
      query = query.is("replied_at", null).is("archived_at", null);
    }

    const { data, error } = await query;

    if (error) {
      toast.error("Failed to load submissions");
    } else {
      setSubmissions(data || []);
    }
    setLoading(false);
  };

  const markAsReplied = async (id: string) => {
    const { error } = await supabase
      .from("user_submissions")
      .update({ replied_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      toast.error("Failed to update");
    } else {
      toast.success("Marked as replied");
      fetchSubmissions();
    }
  };

  const archiveSubmission = async (id: string) => {
    const { error } = await supabase
      .from("user_submissions")
      .update({ archived_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      toast.error("Failed to archive");
    } else {
      toast.success("Archived");
      fetchSubmissions();
    }
  };

  const deleteSubmission = async (id: string) => {
    if (!confirm("Are you sure you want to delete this submission?")) return;

    const { error } = await supabase
      .from("user_submissions")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete");
    } else {
      toast.success("Deleted");
      fetchSubmissions();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Contact Submissions</h1>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="mb-6">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="replied">Replied</TabsTrigger>
          <TabsTrigger value="archived">Archived</TabsTrigger>
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        </div>
      ) : submissions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No {filter} submissions found</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {submissions.map((submission) => (
            <Card key={submission.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{submission.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{submission.email}</p>
                    {submission.location && (
                      <p className="text-xs text-muted-foreground">From: {submission.location}</p>
                    )}
                  </div>
                  <div className="flex gap-2 flex-col items-end">
                    {submission.reason && (
                      <Badge variant="secondary">{submission.reason}</Badge>
                    )}
                    <Badge variant="outline">{submission.status}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {submission.subject && (
                  <p className="font-semibold mb-2">Subject: {submission.subject}</p>
                )}
                <p className="mb-4 whitespace-pre-wrap">{submission.message}</p>
                <p className="text-xs text-muted-foreground mb-4">
                  Submitted: {new Date(submission.created_at).toLocaleString()}
                </p>

                <div className="flex gap-2 flex-wrap">
                  {filter === "pending" && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => markAsReplied(submission.id)}
                        className="gap-2"
                      >
                        <Mail className="h-4 w-4" />
                        Mark as Replied
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => archiveSubmission(submission.id)}
                        className="gap-2"
                      >
                        <Archive className="h-4 w-4" />
                        Archive
                      </Button>
                    </>
                  )}
                  {filter === "replied" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => archiveSubmission(submission.id)}
                      className="gap-2"
                    >
                      <Archive className="h-4 w-4" />
                      Archive
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteSubmission(submission.id)}
                    className="gap-2 ml-auto"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminSubmissionsPage;
