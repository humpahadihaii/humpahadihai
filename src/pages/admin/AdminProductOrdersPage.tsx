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

interface ProductOrderRequest {
  id: string;
  local_product_id: string | null;
  full_name: string;
  email: string;
  phone: string | null;
  city: string | null;
  pincode: string | null;
  quantity: number | null;
  preferred_delivery: string | null;
  message: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
  local_products?: { name: string } | null;
}

const statusOptions = [
  { value: "new", label: "New", color: "bg-blue-100 text-blue-800" },
  { value: "contacted", label: "Contacted", color: "bg-yellow-100 text-yellow-800" },
  { value: "quote_sent", label: "Quote Sent", color: "bg-purple-100 text-purple-800" },
  { value: "payment_pending", label: "Payment Pending", color: "bg-orange-100 text-orange-800" },
  { value: "shipped", label: "Shipped", color: "bg-cyan-100 text-cyan-800" },
  { value: "completed", label: "Completed", color: "bg-green-100 text-green-800" },
  { value: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-800" },
];

const AdminProductOrdersPage = () => {
  const [orders, setOrders] = useState<ProductOrderRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<ProductOrderRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from("product_order_requests")
      .select("*, local_products(name)")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to fetch orders");
      return;
    }
    setOrders(data || []);
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("product_order_requests")
      .update({ status })
      .eq("id", id);

    if (error) {
      toast.error("Failed to update status");
      return;
    }
    toast.success("Status updated");
    fetchOrders();
  };

  const saveAdminNotes = async () => {
    if (!selectedOrder) return;

    const { error } = await supabase
      .from("product_order_requests")
      .update({ admin_notes: adminNotes })
      .eq("id", selectedOrder.id);

    if (error) {
      toast.error("Failed to save notes");
      return;
    }
    toast.success("Notes saved");
    setSelectedOrder(null);
    fetchOrders();
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
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
          <h1 className="text-3xl font-bold">Product Orders</h1>
          <p className="text-muted-foreground">Manage product enquiries and orders</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row gap-4 justify-between">
              <div>
                <CardTitle>All Orders</CardTitle>
                <CardDescription>{filteredOrders.length} orders found</CardDescription>
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
                      <TableHead>Customer</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{order.full_name}</p>
                            <p className="text-sm text-muted-foreground">{order.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>{order.local_products?.name || "-"}</TableCell>
                        <TableCell>{order.quantity || 1}</TableCell>
                        <TableCell>
                          <div>
                            <p>{order.city || "-"}</p>
                            <p className="text-sm text-muted-foreground">{order.pincode || ""}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={order.status}
                            onValueChange={(value) => updateStatus(order.id, value)}
                          >
                            <SelectTrigger className="w-36">
                              <SelectValue>{getStatusBadge(order.status)}</SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {statusOptions.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>{format(new Date(order.created_at), "MMM d, yyyy")}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedOrder(order);
                              setAdminNotes(order.admin_notes || "");
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

        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Order Details</DialogTitle>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Full Name</Label>
                    <p className="font-medium">{selectedOrder.full_name}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Email</Label>
                    <p className="font-medium">{selectedOrder.email}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Phone</Label>
                    <p className="font-medium">{selectedOrder.phone || "-"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">City</Label>
                    <p className="font-medium">{selectedOrder.city || "-"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Pincode</Label>
                    <p className="font-medium">{selectedOrder.pincode || "-"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Product</Label>
                    <p className="font-medium">{selectedOrder.local_products?.name || "-"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Quantity</Label>
                    <p className="font-medium">{selectedOrder.quantity || 1}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Preferred Delivery</Label>
                    <p className="font-medium">{selectedOrder.preferred_delivery || "-"}</p>
                  </div>
                </div>
                {selectedOrder.message && (
                  <div>
                    <Label className="text-muted-foreground">Message</Label>
                    <p className="mt-1 p-3 bg-muted rounded">{selectedOrder.message}</p>
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

export default AdminProductOrdersPage;
