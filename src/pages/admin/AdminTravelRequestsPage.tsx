import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Eye, Search } from "lucide-react";
import { format } from "date-fns";

interface TravelBookingRequest {
  id: string;
  travel_package_id: string | null;
  full_name: string;
  email: string;
  phone: string | null;
  preferred_start_date: string | null;
  month_or_season: string | null;
  number_of_travellers: number | null;
  city: string | null;
  message: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
  travel_packages?: { title: string } | null;
}

const statusOptions = [
  { value: "new", label: "New", color: "bg-blue-100 text-blue-800" },
  { value: "contacted", label: "Contacted", color: "bg-yellow-100 text-yellow-800" },
  { value: "quote_sent", label: "Quote Sent", color: "bg-purple-100 text-purple-800" },
  { value: "payment_pending", label: "Payment Pending", color: "bg-orange-100 text-orange-800" },
  { value: "confirmed", label: "Confirmed", color: "bg-green-100 text-green-800" },
  { value: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-800" },
];

const AdminTravelRequestsPage = () => {
  const [requests, setRequests] = useState<TravelBookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedRequest, setSelectedRequest] = useState<TravelBookingRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState("");

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    const { data, error } = await supabase
      .from("travel_booking_requests")
      .select("*, travel_packages(title)")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to fetch requests");
      return;
    }
    setRequests(data || []);
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("travel_booking_requests")
      .update({ status })
      .eq("id", id);

    if (error) {
      toast.error("Failed to update status");
      return;
    }
    toast.success("Status updated");
    fetchRequests();
  };

  const saveAdminNotes = async () => {
    if (!selectedRequest) return;

    const { error } = await supabase
      .from("travel_booking_requests")
      .update({ admin_notes: adminNotes })
      .eq("id", selectedRequest.id);

    if (error) {
      toast.error("Failed to save notes");
      return;
    }
    toast.success("Notes saved");
    setSelectedRequest(null);
    fetchRequests();
  };

  const filteredRequests = requests.filter((req) => {
    const matchesSearch =
      req.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || req.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const option = statusOptions.find((opt) => opt.value === status);
    return option ? (
      <span className={`px-2 py-1 rounded text-xs ${option.color}`}>{option.label}</span>
    ) : (
      <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-800">{status}</span>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Travel Booking Requests</h1>
          <p className="text-muted-foreground">Manage travel enquiries</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row gap-4 justify-between">
              <div>
                <CardTitle>All Requests</CardTitle>
                <CardDescription>{filteredRequests.length} requests found</CardDescription>
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 w-64"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {statusOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Package</TableHead>
                      <TableHead>Travellers</TableHead>
                      <TableHead>Date/Season</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRequests.map((req) => (
                      <TableRow key={req.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{req.full_name}</p>
                            <p className="text-sm text-muted-foreground">{req.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>{req.travel_packages?.title || "-"}</TableCell>
                        <TableCell>{req.number_of_travellers || 1}</TableCell>
                        <TableCell>
                          {req.preferred_start_date 
                            ? format(new Date(req.preferred_start_date), "MMM d, yyyy")
                            : req.month_or_season || "-"}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={req.status}
                            onValueChange={(value) => updateStatus(req.id, value)}
                          >
                            <SelectTrigger className="w-36">
                              <SelectValue>{getStatusBadge(req.status)}</SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {statusOptions.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>{format(new Date(req.created_at), "MMM d, yyyy")}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedRequest(req);
                              setAdminNotes(req.admin_notes || "");
                            }}
                          >
                            <Eye className="h-4 w-4" />
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

        <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Booking Request Details</DialogTitle>
            </DialogHeader>
            {selectedRequest && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Full Name</Label>
                    <p className="font-medium">{selectedRequest.full_name}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Email</Label>
                    <p className="font-medium">{selectedRequest.email}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Phone</Label>
                    <p className="font-medium">{selectedRequest.phone || "-"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">City</Label>
                    <p className="font-medium">{selectedRequest.city || "-"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Package</Label>
                    <p className="font-medium">{selectedRequest.travel_packages?.title || "-"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Travellers</Label>
                    <p className="font-medium">{selectedRequest.number_of_travellers || 1}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Preferred Date</Label>
                    <p className="font-medium">
                      {selectedRequest.preferred_start_date 
                        ? format(new Date(selectedRequest.preferred_start_date), "MMMM d, yyyy")
                        : "-"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Month/Season</Label>
                    <p className="font-medium">{selectedRequest.month_or_season || "-"}</p>
                  </div>
                </div>
                {selectedRequest.message && (
                  <div>
                    <Label className="text-muted-foreground">Message</Label>
                    <p className="mt-1 p-3 bg-muted rounded">{selectedRequest.message}</p>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="admin_notes">Admin Notes</Label>
                  <Textarea
                    id="admin_notes"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={4}
                  />
                  <Button onClick={saveAdminNotes}>Save Notes</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminTravelRequestsPage;
