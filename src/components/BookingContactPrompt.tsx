import { Button } from "@/components/ui/button";
import { Mail, MessageCircle } from "lucide-react";
import { useCMSSettings } from "@/hooks/useCMSSettings";

interface BookingDetails {
  type: "package" | "listing" | "product" | "enquiry";
  itemName: string;
  name: string;
  email: string;
  phone?: string;
  startDate?: string;
  endDate?: string;
  adults?: number;
  children?: number;
  quantity?: number;
  notes?: string;
  city?: string;
  pincode?: string;
  shippingAddress?: string;
}

interface BookingContactPromptProps {
  booking: BookingDetails;
}

const getTypeLabel = (type: BookingDetails["type"]): string => {
  switch (type) {
    case "package": return "Travel Package Booking";
    case "listing": return "Marketplace Booking";
    case "product": return "Product Order";
    case "enquiry": return "Enquiry";
    default: return "Booking";
  }
};

const formatDates = (booking: BookingDetails): string => {
  const parts: string[] = [];
  if (booking.startDate) parts.push(`Start: ${booking.startDate}`);
  if (booking.endDate) parts.push(`End: ${booking.endDate}`);
  return parts.length > 0 ? parts.join("\n") : "Not specified";
};

const cleanWhatsAppNumber = (number: string): string => {
  return number.replace(/[^0-9]/g, "");
};

export function BookingContactPrompt({ booking }: BookingContactPromptProps) {
  const { data: settings } = useCMSSettings();
  
  // Use email_contact or email_support from CMS settings
  const adminEmail = settings?.email_contact || settings?.email_support;
  
  // Get WhatsApp number from site_settings
  const adminWhatsApp = settings?.whatsapp_number;
  
  const typeLabel = getTypeLabel(booking.type);
  
  // Build email content
  const buildEmailLink = () => {
    if (!adminEmail) return null;
    
    const subject = encodeURIComponent(
      `${typeLabel} – ${booking.itemName}`
    );
    
    const guestInfo = booking.type !== "product" 
      ? `\nGuests:\nAdults: ${booking.adults ?? 1}\nChildren: ${booking.children ?? 0}` 
      : "";
    
    const productInfo = booking.type === "product"
      ? `\nQuantity: ${booking.quantity ?? 1}${booking.shippingAddress ? `\nShipping Address: ${booking.shippingAddress}` : ""}${booking.city ? `\nCity: ${booking.city}` : ""}${booking.pincode ? `\nPincode: ${booking.pincode}` : ""}`
      : "";
    
    const body = encodeURIComponent(
`Namaste Hum Pahadi Haii Team,

I just submitted a ${typeLabel.toLowerCase()} on your website. Here are my details:

Name: ${booking.name}
Email: ${booking.email}
Phone/WhatsApp: ${booking.phone || "-"}

Type: ${typeLabel}
Item: ${booking.itemName}

Dates:
${formatDates(booking)}
${guestInfo}${productInfo}

Additional notes:
${booking.notes || "N/A"}

Please confirm my ${typeLabel.toLowerCase()} and share the next steps.

Thank you!
${booking.name}`.trim()
    );
    
    return `mailto:${adminEmail}?subject=${subject}&body=${body}`;
  };
  
  // Build WhatsApp link
  const buildWhatsAppLink = () => {
    if (!adminWhatsApp) return null;
    
    const cleanNumber = cleanWhatsAppNumber(adminWhatsApp);
    
    const guestInfo = booking.type !== "product" 
      ? `\nGuests: ${booking.adults ?? 1} Adults, ${booking.children ?? 0} Children` 
      : "";
    
    const productInfo = booking.type === "product"
      ? `\nQuantity: ${booking.quantity ?? 1}`
      : "";
    
    const text = encodeURIComponent(
`Namaste Hum Pahadi Haii Team,

I just submitted a ${typeLabel.toLowerCase()} on your website.

Name: ${booking.name}
Phone: ${booking.phone || "-"}

Type: ${typeLabel}
Item: ${booking.itemName}

Dates: ${formatDates(booking).replace("\n", ", ")}
${guestInfo}${productInfo}

Notes: ${booking.notes || "N/A"}

Please confirm my ${typeLabel.toLowerCase()}.`.trim()
    );
    
    return `https://wa.me/${cleanNumber}?text=${text}`;
  };
  
  const emailLink = buildEmailLink();
  const whatsAppLink = buildWhatsAppLink();
  
  // If neither contact option is configured, don't show the section
  if (!emailLink && !whatsAppLink) {
    return null;
  }
  
  return (
    <div className="mt-6 pt-4 border-t border-border">
      <p className="text-sm text-muted-foreground mb-3 text-center">
        For faster confirmation, you can also contact us directly:
      </p>
      <div className="flex flex-col sm:flex-row gap-2 justify-center">
        {emailLink && (
          <Button variant="outline" asChild className="gap-2">
            <a href={emailLink}>
              <Mail className="h-4 w-4" />
              Email Hum Pahadi Haii
            </a>
          </Button>
        )}
        {whatsAppLink && (
          <Button 
            variant="default" 
            className="gap-2 bg-green-600 hover:bg-green-700"
            onClick={() => window.open(whatsAppLink, "_blank")}
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp Hum Pahadi Haii
          </Button>
        )}
      </div>
    </div>
  );
}
