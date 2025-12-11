import { Button } from "@/components/ui/button";
import { Mail, MessageCircle, Check, X } from "lucide-react";
import { usePublicNotifyConfig, PublicNotifyConfig } from "@/hooks/useBookingNotifyConfig";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface BookingDetails {
  type: "package" | "listing" | "product" | "enquiry";
  bookingId?: string;
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

interface PostBookingNotifyProps {
  booking: BookingDetails;
  providerPhone?: string;
  providerEmail?: string;
  className?: string;
}

// Placeholder substitution
const substitutePlaceholders = (
  template: string,
  booking: BookingDetails,
  config: PublicNotifyConfig
): string => {
  const getTypeLabel = (type: BookingDetails["type"]): string => {
    switch (type) {
      case "package": return "Travel Package Booking";
      case "listing": return "Marketplace Booking";
      case "product": return "Product Order";
      case "enquiry": return "Enquiry";
      default: return "Booking";
    }
  };

  const formatDates = (): string => {
    const parts: string[] = [];
    if (booking.startDate) parts.push(`Start: ${booking.startDate}`);
    if (booking.endDate) parts.push(`End: ${booking.endDate}`);
    return parts.length > 0 ? parts.join("\n") : "Not specified";
  };

  const getGuestInfo = (): string => {
    if (booking.type === "product") return "";
    return `Guests: ${booking.adults ?? 1} Adults, ${booking.children ?? 0} Children`;
  };

  const getProductInfo = (): string => {
    if (booking.type !== "product") return "";
    let info = `Quantity: ${booking.quantity ?? 1}`;
    if (booking.shippingAddress) info += `\nShipping: ${booking.shippingAddress}`;
    if (booking.city) info += `\nCity: ${booking.city}`;
    if (booking.pincode) info += `\nPincode: ${booking.pincode}`;
    return info;
  };

  const replacements: Record<string, string> = {
    "{{bookingId}}": booking.bookingId || "N/A",
    "{{bookingType}}": getTypeLabel(booking.type),
    "{{itemName}}": booking.itemName,
    "{{customerName}}": booking.name,
    "{{customerEmail}}": booking.email,
    "{{customerPhone}}": booking.phone || "-",
    "{{dates}}": formatDates(),
    "{{guestInfo}}": getGuestInfo(),
    "{{productInfo}}": getProductInfo(),
    "{{notes}}": booking.notes || "N/A",
  };

  let result = template;
  for (const [placeholder, value] of Object.entries(replacements)) {
    result = result.replace(new RegExp(placeholder.replace(/[{}]/g, "\\$&"), "g"), value);
  }
  return result;
};

// Clean phone number for WhatsApp
const cleanWhatsAppNumber = (number: string): string => {
  return number.replace(/[^0-9]/g, "");
};

// Escape for URI encoding
const escapeForUri = (text: string): string => {
  // Replace CRLF with space, strip control characters
  return text.replace(/[\r\n]+/g, "\n").replace(/[\x00-\x1F\x7F]/g, "");
};

export function PostBookingNotify({
  booking,
  providerPhone,
  providerEmail,
  className,
}: PostBookingNotifyProps) {
  const { data: config, isLoading, error } = usePublicNotifyConfig();
  const [confirmSent, setConfirmSent] = useState<"whatsapp" | "email" | null>(null);

  // Loading state
  if (isLoading) {
    return (
      <div className={cn("mt-6 pt-4 border-t border-border", className)}>
        <Skeleton className="h-4 w-48 mx-auto mb-3" />
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-40" />
        </div>
      </div>
    );
  }

  // Error or no config
  if (error || !config) {
    return null;
  }

  // Check visibility for this booking type
  const isVisible = config.visibility[booking.type] !== false;
  if (!isVisible) return null;

  // Check if at least one method is enabled
  if (!config.enabled_whatsapp && !config.enabled_email) return null;

  // Determine phone and email to use (provider or fallback)
  const phoneToUse = providerPhone || config.admin_fallback_phone;
  const emailToUse = providerEmail || config.admin_fallback_email;

  // Get templates based on language
  const lang = config.default_language === "hi" ? "hi" : "en";
  const whatsappTemplate = config.templates[`whatsapp_full_${lang}`] || config.templates["whatsapp_full_en"] || "";
  const emailSubjectTemplate = config.templates[`email_subject_${lang}`] || config.templates["email_subject_en"] || "";
  const emailBodyTemplate = config.templates[`email_body_${lang}`] || config.templates["email_body_en"] || "";

  // Build WhatsApp link
  const buildWhatsAppLink = (): string | null => {
    if (!phoneToUse) return null;
    const cleanNumber = cleanWhatsAppNumber(phoneToUse);
    if (cleanNumber.length < config.phone_min_digits) return null;
    
    const message = substitutePlaceholders(whatsappTemplate, booking, config);
    const escapedMessage = escapeForUri(message);
    return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(escapedMessage)}`;
  };

  // Build Email link
  const buildEmailLink = (): string | null => {
    if (!emailToUse) return null;
    
    const subject = substitutePlaceholders(emailSubjectTemplate, booking, config);
    const body = substitutePlaceholders(emailBodyTemplate, booking, config);
    const escapedSubject = escapeForUri(subject);
    const escapedBody = escapeForUri(body);
    
    return `mailto:${emailToUse}?subject=${encodeURIComponent(escapedSubject)}&body=${encodeURIComponent(escapedBody)}`;
  };

  const whatsAppLink = config.enabled_whatsapp ? buildWhatsAppLink() : null;
  const emailLink = config.enabled_email ? buildEmailLink() : null;

  // If neither link is available, don't show
  if (!whatsAppLink && !emailLink) return null;

  // Build buttons based on position order
  const buttons: { type: "whatsapp" | "email"; link: string; label: string }[] = [];
  
  for (const position of config.position_order) {
    if (position === "whatsapp" && whatsAppLink) {
      buttons.push({ type: "whatsapp", link: whatsAppLink, label: config.whatsapp_label });
    } else if (position === "email" && emailLink) {
      buttons.push({ type: "email", link: emailLink, label: config.email_label });
    }
  }

  const handleClick = (type: "whatsapp" | "email", link: string) => {
    window.open(link, "_blank");
    if (config.show_confirm_question) {
      setConfirmSent(type);
    }
  };

  return (
    <div className={cn("mt-6 pt-4 border-t border-border", className)}>
      <p className="text-sm text-muted-foreground mb-3 text-center">
        For faster confirmation, you can also contact us directly:
      </p>
      
      <div className="flex flex-col sm:flex-row gap-2 justify-center">
        {buttons.map(({ type, link, label }) => (
          <Button
            key={type}
            variant={type === "whatsapp" ? "default" : "outline"}
            className={cn(
              "gap-2",
              type === "whatsapp" && "bg-green-600 hover:bg-green-700"
            )}
            onClick={() => handleClick(type, link)}
          >
            {type === "whatsapp" ? (
              <MessageCircle className="h-4 w-4" />
            ) : (
              <Mail className="h-4 w-4" />
            )}
            {label}
          </Button>
        ))}
      </div>

      {/* Confirm send question */}
      {config.show_confirm_question && confirmSent && (
        <div className="mt-4 p-3 bg-muted rounded-lg text-center animate-in fade-in">
          <p className="text-sm text-muted-foreground mb-2">
            Did the {confirmSent === "whatsapp" ? "WhatsApp" : "Email"} message open correctly?
          </p>
          <div className="flex gap-2 justify-center">
            <Button
              size="sm"
              variant="ghost"
              className="gap-1 text-green-600"
              onClick={() => setConfirmSent(null)}
            >
              <Check className="h-3 w-3" /> Yes
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="gap-1 text-red-600"
              onClick={() => setConfirmSent(null)}
            >
              <X className="h-3 w-3" /> No
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
