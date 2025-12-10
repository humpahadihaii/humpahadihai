import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Search, Eye, CheckCircle, XCircle, AlertCircle, FileText, Image as ImageIcon } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import type { Database } from "@/integrations/supabase/types";
import { useAdminActivityLogger } from "@/hooks/useAdminActivityLogger";

type CommunitySubmission = Database["public"]["Tables"]["community_submissions"]["Row"];

export default function AdminCommunitySubmissionsPage() {
  const [submissions, setSubmissions] = useState<CommunitySubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<CommunitySubmission | null>(null);
  const [reviewerNotes, setReviewerNotes] = useState("");
  const { logApprove, logReject, logUpdate } = useAdminActivityLogger();

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("community_submissions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching submissions:", error);
      toast.error("Failed to load submissions");
    } else {
      setSubmissions(data || []);
    }
    setLoading(false);
  };

  const handleReview = (submission: CommunitySubmission) => {
    setSelectedSubmission(submission);
    setReviewerNotes(submission.reviewer_notes || "");
    setReviewDialogOpen(true);
  };

  const updateSubmissionStatus = async (newStatus: string) => {
    if (!selectedSubmission) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Authentication required");
      return;
    }

    const { error } = await supabase
      .from("community_submissions")
      .update({
        status: newStatus,
        reviewer_id: user.id,
        reviewer_notes: reviewerNotes,
      })
      .eq("id", selectedSubmission.id);

    if (error) {
      console.error("Update error:", error);
      toast.error(`Failed to update: ${error.message || 'Unknown error'}`, {
        description: error.details || error.hint,
      });
    } else {
      toast.success(`Submission ${newStatus}`);
      fetchSubmissions();
      setReviewDialogOpen(false);
      setSelectedSubmission(null);
      setReviewerNotes("");
    }
  };

  const filteredSubmissions = submissions.filter((sub) => {
    const matchesSearch = sub.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || sub.status === statusFilter;
    const matchesType = typeFilter === "all" || sub.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const countByStatus = (status: string) =>
    submissions.filter((s) => s.status === status).length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Community Submissions</h1>
          <p className="text-muted-foreground">Review and manage user-submitted stories and photos</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{countByStatus("pending")}</div>
              <p className="text-xs text-muted-foreground">Pending Review</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">{countByStatus("approved")}</div>
              <p className="text-xs text-muted-foreground">Approved</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-yellow-600">{countByStatus("needs_changes")}</div>
              <p className="text-xs text-muted-foreground">Needs Changes</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-red-600">{countByStatus("rejected")}</div>
              <p className="text-xs text-muted-foreground">Rejected</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search submissions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="needs_changes">Needs Changes</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="story">Stories</SelectItem>
                  <SelectItem value="photo">Photos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : filteredSubmissions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No submissions found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubmissions.map((submission) => (
                      <TableRow key={submission.id}>
                        <TableCell>
                          {submission.type === "story" ? (
                            <FileText className="h-4 w-4 text-primary" />
                          ) : (
                            <ImageIcon className="h-4 w-4 text-secondary" />
                          )}
                        </TableCell>
                        <TableCell className="font-medium max-w-[200px] truncate">
                          {submission.title}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {submission.target_section}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              submission.status === "approved"
                                ? "default"
                                : submission.status === "rejected"
                                ? "destructive"
                                : "secondary"
                            }
                            className="capitalize"
                          >
                            {submission.status.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(submission.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleReview(submission)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Review
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Review Dialog */}
        <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Review Submission</DialogTitle>
            </DialogHeader>
            {selectedSubmission && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  {selectedSubmission.type === "story" ? (
                    <FileText className="h-5 w-5 text-primary" />
                  ) : (
                    <ImageIcon className="h-5 w-5 text-secondary" />
                  )}
                  <h3 className="text-xl font-semibold">{selectedSubmission.title}</h3>
                </div>

                <div className="flex gap-2">
                  <Badge variant="outline" className="capitalize">
                    {selectedSubmission.target_section}
                  </Badge>
                  <Badge>{selectedSubmission.type}</Badge>
                </div>

                {selectedSubmission.image_url && (
                  <div className="rounded-lg overflow-hidden border">
                    <img
                      src={selectedSubmission.image_url}
                      alt={selectedSubmission.title}
                      className="w-full max-h-96 object-contain"
                    />
                  </div>
                )}

                {selectedSubmission.body && (
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="whitespace-pre-wrap">{selectedSubmission.body}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium">Reviewer Notes</label>
                  <Textarea
                    value={reviewerNotes}
                    onChange={(e) => setReviewerNotes(e.target.value)}
                    rows={4}
                    placeholder="Add notes for the submitter (optional)..."
                  />
                </div>

                <div className="flex gap-2 flex-wrap">
                  <Button
                    onClick={() => updateSubmissionStatus("approved")}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approve
                  </Button>
                  <Button
                    onClick={() => updateSubmissionStatus("needs_changes")}
                    variant="outline"
                    className="border-yellow-600 text-yellow-600 hover:bg-yellow-50"
                  >
                    <AlertCircle className="mr-2 h-4 w-4" />
                    Needs Changes
                  </Button>
                  <Button
                    onClick={() => updateSubmissionStatus("rejected")}
                    variant="destructive"
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                  <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
                    Close
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
