import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Search, Eye, Package, MapPin, ShoppingBag, Calendar, Phone, Mail, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useAdminActivityLogger } from "@/hooks/useAdminActivityLogger";

interface Booking {
  id: string;
  type: string;
  package_id: string | null;
  listing_id: string | null;
  product_id: string | null;
  name: string;
  email: string;
  phone: string;
  start_date: string | null;
  end_date: string | null;
  nights: number | null;
  adults: number | null;
  children: number | null;
  quantity: number | null;
  shipping_address: string | null;
  city: string | null;
  pincode: string | null;
  unit_price: number | null;
  total_price: number | null;
  currency: string;
  status: string;
  payment_status: string;
  notes: string | null;
  admin_notes: string | null;
  source: string | null;
  created_at: string;
  // Joined data
  package_title?: string;
  listing_title?: string;
  product_name?: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-green-100 text-green-800",
  cancelled: "bg-gray-100 text-gray-800",
  rejected: "bg-red-100 text-red-800",
};

const paymentStatusColors: Record<string, string> = {
  unpaid: "bg-gray-100 text-gray-800",
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
};

const typeIcons: Record<string, React.ReactNode> = {
  package: <Package className="h-4 w-4" />,
  listing: <MapPin className="h-4 w-4" />,
  product: <ShoppingBag className="h-4 w-4" />,
};

export default function AdminBookingsPage() {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { logUpdate } = useAdminActivityLogger();

  const fetchBookings = async () => {
    setLoading(true);
    try {
      // Fetch bookings
      const { data: bookingsData, error } = await supabase
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch related data
      const packageIds = bookingsData?.filter(b => b.package_id).map(b => b.package_id) || [];
      const listingIds = bookingsData?.filter(b => b.listing_id).map(b => b.listing_id) || [];
      const productIds = bookingsData?.filter(b => b.product_id).map(b => b.product_id) || [];

      const [packagesRes, listingsRes, productsRes] = await Promise.all([
        packageIds.length > 0 
          ? supabase.from("travel_packages").select("id, title").in("id", packageIds)
          : Promise.resolve({ data: [] }),
        listingIds.length > 0
          ? supabase.from("tourism_listings").select("id, title").in("id", listingIds)
          : Promise.resolve({ data: [] }),
        productIds.length > 0
          ? supabase.from("local_products").select("id, name").in("id", productIds)
          : Promise.resolve({ data: [] }),
      ]);

      const packagesMap = new Map<string, string>();
      packagesRes.data?.forEach(p => packagesMap.set(p.id, p.title));
      
      const listingsMap = new Map<string, string>();
      listingsRes.data?.forEach(l => listingsMap.set(l.id, l.title));
      
      const productsMap = new Map<string, string>();
      productsRes.data?.forEach(p => productsMap.set(p.id, p.name));

      const enrichedBookings: Booking[] = bookingsData?.map(booking => ({
        ...booking,
        package_title: booking.package_id ? packagesMap.get(booking.package_id) : undefined,
        listing_title: booking.listing_id ? listingsMap.get(booking.listing_id) : undefined,
        product_name: booking.product_id ? productsMap.get(booking.product_id) : undefined,
      })) || [];

      setBookings(enrichedBookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast({
        title: "Error",
        description: "Failed to load bookings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.phone.includes(searchQuery);
    
    const matchesType = typeFilter === "all" || booking.type === typeFilter;
    const matchesStatus = statusFilter === "all" || booking.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const getItemName = (booking: Booking) => {
    return booking.package_title || booking.listing_title || booking.product_name || "Unknown";
  };

  const handleUpdateBooking = async (bookingId: string, updates: Partial<Booking>) => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from("bookings")
        .update(updates)
        .eq("id", bookingId);

      if (error) throw error;

      toast({
        title: "Booking Updated",
        description: "The booking has been updated successfully.",
      });

      const booking = bookings.find(b => b.id === bookingId);
      logUpdate("booking", bookingId, `${booking?.name || "Booking"} → ${updates.status || "updated"}`);

      fetchBookings();
      if (selectedBooking?.id === bookingId) {
        setSelectedBooking({ ...selectedBooking, ...updates });
      }
    } catch (error) {
      console.error("Error updating booking:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update the booking",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const BookingDetailModal = () => {
    const [adminNotes, setAdminNotes] = useState(selectedBooking?.admin_notes || "");
    const [status, setStatus] = useState(selectedBooking?.status || "pending");
    const [paymentStatus, setPaymentStatus] = useState(selectedBooking?.payment_status || "unpaid");

    useEffect(() => {
      if (selectedBooking) {
        setAdminNotes(selectedBooking.admin_notes || "");
        setStatus(selectedBooking.status);
        setPaymentStatus(selectedBooking.payment_status);
      }
    }, [selectedBooking]);

    if (!selectedBooking) return null;

    return (
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {typeIcons[selectedBooking.type]}
              Booking Details
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Item Info */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {selectedBooking.type === "package" ? "Package" : 
                   selectedBooking.type === "listing" ? "Listing" : "Product"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold">{getItemName(selectedBooking)}</p>
                <p className="text-sm text-muted-foreground">Source: {selectedBooking.source}</p>
              </CardContent>
            </Card>

            {/* Customer Info */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Customer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedBooking.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${selectedBooking.email}`} className="text-primary hover:underline">
                    {selectedBooking.email}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a href={`tel:${selectedBooking.phone}`} className="text-primary hover:underline">
                    {selectedBooking.phone}
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Booking Details */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Booking Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {selectedBooking.start_date && (
                    <div>
                      <span className="text-muted-foreground">Start Date:</span>
                      <p className="font-medium">{format(new Date(selectedBooking.start_date), "PPP")}</p>
                    </div>
                  )}
                  {selectedBooking.end_date && (
                    <div>
                      <span className="text-muted-foreground">End Date:</span>
                      <p className="font-medium">{format(new Date(selectedBooking.end_date), "PPP")}</p>
                    </div>
                  )}
                  {selectedBooking.nights && (
                    <div>
                      <span className="text-muted-foreground">Nights:</span>
                      <p className="font-medium">{selectedBooking.nights}</p>
                    </div>
                  )}
                  {(selectedBooking.adults || selectedBooking.children) && (
                    <div>
                      <span className="text-muted-foreground">Travellers:</span>
                      <p className="font-medium">
                        {selectedBooking.adults} Adults, {selectedBooking.children} Children
                      </p>
                    </div>
                  )}
                  {selectedBooking.quantity && selectedBooking.type === "product" && (
                    <div>
                      <span className="text-muted-foreground">Quantity:</span>
                      <p className="font-medium">{selectedBooking.quantity}</p>
                    </div>
                  )}
                  {selectedBooking.shipping_address && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Shipping Address:</span>
                      <p className="font-medium">
                        {selectedBooking.shipping_address}
                        {selectedBooking.city && `, ${selectedBooking.city}`}
                        {selectedBooking.pincode && ` - ${selectedBooking.pincode}`}
                      </p>
                    </div>
                  )}
                </div>

                {selectedBooking.notes && (
                  <div className="mt-4">
                    <span className="text-muted-foreground text-sm">Customer Notes:</span>
                    <p className="mt-1 p-2 bg-muted rounded-md text-sm">{selectedBooking.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pricing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <span>Total Price</span>
                  <span className="text-xl font-semibold text-primary">
                    {selectedBooking.total_price 
                      ? `₹${selectedBooking.total_price.toLocaleString()}`
                      : "To be confirmed"}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Status Management */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Status Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Booking Status</Label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Payment Status</Label>
                    <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unpaid">Unpaid</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Admin Notes</Label>
                  <Textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Internal notes about this booking..."
                    rows={3}
                  />
                </div>

                <Button 
                  onClick={() => handleUpdateBooking(selectedBooking.id, {
                    status,
                    payment_status: paymentStatus,
                    admin_notes: adminNotes,
                  })}
                  disabled={isUpdating}
                  className="w-full"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Timestamps */}
            <div className="text-xs text-muted-foreground">
              Created: {format(new Date(selectedBooking.created_at), "PPpp")}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Bookings</h1>
          <p className="text-muted-foreground">
            Manage all booking requests from packages, marketplace, and shop
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Bookings</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{bookings.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Pending</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-yellow-600">
                {bookings.filter(b => b.status === "pending").length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Confirmed</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">
                {bookings.filter(b => b.status === "confirmed").length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>This Month</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {bookings.filter(b => {
                  const bookingDate = new Date(b.created_at);
                  const now = new Date();
                  return bookingDate.getMonth() === now.getMonth() && 
                         bookingDate.getFullYear() === now.getFullYear();
                }).length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="package">Packages</SelectItem>
              <SelectItem value="listing">Listings</SelectItem>
              <SelectItem value="product">Products</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Bookings Table */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredBookings.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No bookings found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {typeIcons[booking.type]}
                        <span className="capitalize">{booking.type}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[200px] truncate font-medium">
                        {getItemName(booking)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{booking.name}</p>
                        <p className="text-sm text-muted-foreground">{booking.phone}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(booking.created_at), "MMM d, yyyy")}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[booking.status]}>
                        {booking.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={paymentStatusColors[booking.payment_status]}>
                        {booking.payment_status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedBooking(booking);
                          setIsDetailOpen(true);
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
      </div>

      <BookingDetailModal />
    </AdminLayout>
  );
}