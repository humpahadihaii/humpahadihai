import { useState, useCallback } from "react";
import { Share2, Link2, Check, MessageCircle, Facebook, Twitter, Mail, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ShareButtonProps {
  title: string;
  text?: string;
  url?: string;
  variant?: "button" | "icon" | "floating";
  className?: string;
}

export function ShareButton({
  title,
  text,
  url,
  variant = "button",
  className,
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");
  const shareText = text || title;

  const handleNativeShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: shareText,
          url: shareUrl,
        });
      } catch (e) {
        if ((e as Error).name !== "AbortError") {
          console.error("Share failed:", e);
        }
      }
    }
  }, [title, shareText, shareUrl]);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      toast.error("Failed to copy link");
    }
  }, [shareUrl]);

  const openShareWindow = (shareLink: string) => {
    window.open(shareLink, "_blank", "width=600,height=400,noopener,noreferrer");
  };

  const shareLinks = {
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`,
  };

  // Use native share if available (mobile)
  const hasNativeShare = typeof navigator !== "undefined" && !!navigator.share;

  const buttonContent = (
    <>
      <Share2 className="h-4 w-4" />
      {variant === "button" && <span>Share</span>}
    </>
  );

  if (variant === "floating") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className={cn(
              "h-12 w-12 rounded-full shadow-lg",
              "bg-card/95 backdrop-blur-md border-border hover:bg-muted",
              "transition-all duration-200 hover:scale-105",
              className
            )}
            aria-label="Share"
          >
            <Share2 className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <ShareDropdownContent
          hasNativeShare={hasNativeShare}
          onNativeShare={handleNativeShare}
          onCopyLink={handleCopyLink}
          copied={copied}
          shareLinks={shareLinks}
          openShareWindow={openShareWindow}
        />
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant === "icon" ? "ghost" : "outline"}
          size={variant === "icon" ? "icon" : "sm"}
          className={cn("gap-2", className)}
          aria-label="Share"
        >
          {buttonContent}
        </Button>
      </DropdownMenuTrigger>
      <ShareDropdownContent
        hasNativeShare={hasNativeShare}
        onNativeShare={handleNativeShare}
        onCopyLink={handleCopyLink}
        copied={copied}
        shareLinks={shareLinks}
        openShareWindow={openShareWindow}
      />
    </DropdownMenu>
  );
}

function ShareDropdownContent({
  hasNativeShare,
  onNativeShare,
  onCopyLink,
  copied,
  shareLinks,
  openShareWindow,
}: {
  hasNativeShare: boolean;
  onNativeShare: () => void;
  onCopyLink: () => void;
  copied: boolean;
  shareLinks: Record<string, string>;
  openShareWindow: (url: string) => void;
}) {
  return (
    <DropdownMenuContent align="end" className="w-48">
      {hasNativeShare && (
        <>
          <DropdownMenuItem onClick={onNativeShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Share...
          </DropdownMenuItem>
          <DropdownMenuSeparator />
        </>
      )}

      <DropdownMenuItem onClick={onCopyLink}>
        {copied ? (
          <Check className="h-4 w-4 mr-2 text-success" />
        ) : (
          <Link2 className="h-4 w-4 mr-2" />
        )}
        {copied ? "Copied!" : "Copy link"}
      </DropdownMenuItem>

      <DropdownMenuSeparator />

      <DropdownMenuItem onClick={() => openShareWindow(shareLinks.whatsapp)}>
        <MessageCircle className="h-4 w-4 mr-2" />
        WhatsApp
      </DropdownMenuItem>

      <DropdownMenuItem onClick={() => openShareWindow(shareLinks.facebook)}>
        <Facebook className="h-4 w-4 mr-2" />
        Facebook
      </DropdownMenuItem>

      <DropdownMenuItem onClick={() => openShareWindow(shareLinks.twitter)}>
        <Twitter className="h-4 w-4 mr-2" />
        Twitter / X
      </DropdownMenuItem>

      <DropdownMenuItem onClick={() => openShareWindow(shareLinks.linkedin)}>
        <Linkedin className="h-4 w-4 mr-2" />
        LinkedIn
      </DropdownMenuItem>

      <DropdownMenuItem onClick={() => window.location.href = shareLinks.email}>
        <Mail className="h-4 w-4 mr-2" />
        Email
      </DropdownMenuItem>
    </DropdownMenuContent>
  );
}
