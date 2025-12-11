import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2, CheckCircle, Users, Baby, AlertCircle } from "lucide-react";
import { format, differenceInDays, startOfDay, isBefore } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PostBookingNotify } from "@/components/PostBookingNotify";
import { trackBookingSummary } from "@/lib/internalTracker";

type BookingType = "package" | "listing" | "product";

interface BookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: BookingType;
  item: {
    id: string;
    title: string;
    price?: number;
    duration_days?: number;
    category?: string;
    district?: string;
  };
  source: string;
}

export function BookingModal({ open, onOpenChange, type, item, source }: BookingModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    adults: 1,
    children: 0,
    quantity: 1,
    shippingAddress: "",
    city: "",
    pincode: "",
    notes: "",
  });

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setIsSuccess(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        startDate: undefined,
        endDate: undefined,
        adults: 1,
        children: 0,
        quantity: 1,
        shippingAddress: "",
        city: "",
        pincode: "",
        notes: "",
      });
    }
  }, [open]);

  // Auto-calculate end date for packages with duration
  useEffect(() => {
    if (type === "package" && item.duration_days && formData.startDate) {
      const endDate = new Date(formData.startDate);
      endDate.setDate(endDate.getDate() + item.duration_days - 1);
      setFormData(prev => ({ ...prev, endDate }));
    }
  }, [formData.startDate, item.duration_days, type]);

  // Get today's date with time stripped for consistent comparison
  const today = useMemo(() => startOfDay(new Date()), []);

  const nights = formData.startDate && formData.endDate 
    ? differenceInDays(formData.endDate, formData.startDate)
    : undefined;

  // Date validation errors
  const dateErrors = useMemo(() => {
    const errors: { startDate?: string; endDate?: string } = {};
    
    if (formData.startDate && isBefore(startOfDay(formData.startDate), today)) {
      errors.startDate = "Please select a date from today onwards.";
    }
    
    if (formData.endDate) {
      if (isBefore(startOfDay(formData.endDate), today)) {
        errors.endDate = "Please select a date from today onwards.";
      } else if (formData.startDate && isBefore(formData.endDate, formData.startDate)) {
        errors.endDate = "End date cannot be earlier than start date.";
      }
    }
    
    return errors;
  }, [formData.startDate, formData.endDate, today]);

  const hasDateErrors = Object.keys(dateErrors).length > 0;

  const calculateTotalPrice = () => {
    if (!item.price) return undefined;
    
    if (type === "product") {
      return item.price * formData.quantity;
    }
    
    if (type === "listing" && nights && nights > 0) {
      return item.price * nights * (formData.adults + formData.children * 0.5);
    }
    
    if (type === "package") {
      return item.price * (formData.adults + formData.children * 0.5);
    }
    
    return item.price;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.phone) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const bookingData: Record<string, unknown> = {
        type,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        notes: formData.notes || null,
        source,
        user_id: user?.id || null,
        unit_price: item.price || null,
        total_price: calculateTotalPrice() || null,
        currency: "INR",
        status: "pending",
        payment_status: "unpaid",
      };

      // Add type-specific fields
      if (type === "package") {
        bookingData.package_id = item.id;
        bookingData.start_date = formData.startDate ? format(formData.startDate, "yyyy-MM-dd") : null;
        bookingData.end_date = formData.endDate ? format(formData.endDate, "yyyy-MM-dd") : null;
        bookingData.nights = nights || item.duration_days || null;
        bookingData.adults = formData.adults;
        bookingData.children = formData.children;
      } else if (type === "listing") {
        bookingData.listing_id = item.id;
        bookingData.start_date = formData.startDate ? format(formData.startDate, "yyyy-MM-dd") : null;
        bookingData.end_date = formData.endDate ? format(formData.endDate, "yyyy-MM-dd") : null;
        bookingData.nights = nights || null;
        bookingData.adults = formData.adults;
        bookingData.children = formData.children;
      } else if (type === "product") {
        bookingData.product_id = item.id;
        bookingData.quantity = formData.quantity;
        bookingData.shipping_address = formData.shippingAddress || null;
        bookingData.city = formData.city || null;
        bookingData.pincode = formData.pincode || null;
      }

      const { data: bookingResult, error } = await supabase
        .from("bookings")
        .insert(bookingData as never)
        .select('id')
        .single();

      if (error) throw error;

      // Track with internal analytics (privacy-friendly)
      trackBookingSummary({
        packageId: type === "package" ? item.id : undefined,
        listingId: type === "listing" ? item.id : undefined,
        productId: type === "product" ? item.id : undefined,
        bookingType: type,
        url: window.location.href,
      });

      setIsSuccess(true);
      toast({
        title: "Booking Submitted!",
        description: "We'll contact you shortly to confirm your booking.",
      });
    } catch (error: unknown) {
      console.error("Booking error:", error);
      toast({
        title: "Booking Failed",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStay = type === "listing" && (item.category === "stay" || item.category === "homestay");
  const showDateFields = type === "package" || type === "listing";
  const showTravellerFields = type === "package" || type === "listing";
  const showProductFields = type === "product";

  if (isSuccess) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <CheckCircle className="h-16 w-16 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {type === "product" ? "Order Submitted!" : "Booking Submitted!"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {type === "product" 
                ? "Thank you! Your order request has been received. We'll confirm via WhatsApp/phone soon."
                : "Thank you! Your booking request has been received. We will contact you soon to confirm."}
            </p>
            
            <PostBookingNotify
              booking={{
                type,
                itemName: item.title,
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                startDate: formData.startDate ? format(formData.startDate, "PPP") : undefined,
                endDate: formData.endDate ? format(formData.endDate, "PPP") : undefined,
                adults: formData.adults,
                children: formData.children,
                quantity: formData.quantity,
                notes: formData.notes,
                city: formData.city,
                pincode: formData.pincode,
                shippingAddress: formData.shippingAddress,
              }}
            />
            
            <Button onClick={() => onOpenChange(false)} className="mt-4">Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {type === "product" ? "Order" : "Book"}: {item.title}
          </DialogTitle>
          <DialogDescription>
            {item.district && `${item.district} • `}
            {item.duration_days && `${item.duration_days} Days`}
            {item.price && ` • Starting ₹${item.price.toLocaleString()}`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Contact Information */}
          <div className="space-y-3">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Your name"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="your@email.com"
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+91 9876543210"
                  required
                />
              </div>
            </div>
          </div>

          {/* Date Fields */}
          {showDateFields && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>{isStay ? "Check-in Date" : "Start Date"}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.startDate && "text-muted-foreground",
                        dateErrors.startDate && "border-destructive"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.startDate ? format(formData.startDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.startDate}
                      onSelect={(date) => setFormData(prev => ({ ...prev, startDate: date }))}
                      disabled={(date) => isBefore(startOfDay(date), today)}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                {dateErrors.startDate && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {dateErrors.startDate}
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <Label>{isStay ? "Check-out Date" : "End Date"}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.endDate && "text-muted-foreground",
                        dateErrors.endDate && "border-destructive"
                      )}
                      disabled={type === "package" && !!item.duration_days}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.endDate ? format(formData.endDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.endDate}
                      onSelect={(date) => setFormData(prev => ({ ...prev, endDate: date }))}
                      disabled={(date) => {
                        const minDate = formData.startDate ? startOfDay(formData.startDate) : today;
                        return isBefore(startOfDay(date), minDate);
                      }}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                {dateErrors.endDate && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {dateErrors.endDate}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Traveller Fields */}
          {showTravellerFields && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="adults" className="flex items-center gap-1">
                  <Users className="h-4 w-4" /> Adults
                </Label>
                <Input
                  id="adults"
                  type="number"
                  min={1}
                  max={20}
                  value={formData.adults}
                  onChange={(e) => setFormData(prev => ({ ...prev, adults: parseInt(e.target.value) || 1 }))}
                />
              </div>
              <div>
                <Label htmlFor="children" className="flex items-center gap-1">
                  <Baby className="h-4 w-4" /> Children
                </Label>
                <Input
                  id="children"
                  type="number"
                  min={0}
                  max={10}
                  value={formData.children}
                  onChange={(e) => setFormData(prev => ({ ...prev, children: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>
          )}

          {/* Product Fields */}
          {showProductFields && (
            <div className="space-y-3">
              <div>
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min={1}
                  max={100}
                  value={formData.quantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                />
              </div>
              <div>
                <Label htmlFor="shippingAddress">Shipping Address</Label>
                <Textarea
                  id="shippingAddress"
                  value={formData.shippingAddress}
                  onChange={(e) => setFormData(prev => ({ ...prev, shippingAddress: e.target.value }))}
                  placeholder="Full address for delivery"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="City"
                  />
                </div>
                <div>
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input
                    id="pincode"
                    value={formData.pincode}
                    onChange={(e) => setFormData(prev => ({ ...prev, pincode: e.target.value }))}
                    placeholder="Pincode"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Special Requests / Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Any special requirements or questions..."
              rows={2}
            />
          </div>

          {/* Price Summary */}
          {calculateTotalPrice() && (
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Estimated Total</span>
                <span className="text-lg font-semibold text-primary">
                  ₹{calculateTotalPrice()?.toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Final price will be confirmed by our team
              </p>
            </div>
          )}

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={isSubmitting || hasDateErrors}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              type === "product" ? "Submit Order Request" : "Submit Booking Request"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}