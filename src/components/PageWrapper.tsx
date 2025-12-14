import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Breadcrumbs } from "./Breadcrumbs";
import { cn } from "@/lib/utils";

interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
  showBreadcrumbs?: boolean;
  breadcrumbItems?: { label: string; href?: string }[];
  id?: string;
}

/**
 * PageWrapper component that provides:
 * - Subtle page transition animation
 * - Optional breadcrumbs
 * - Main content ID for skip-to-content link
 */
export function PageWrapper({
  children,
  className,
  showBreadcrumbs = true,
  breadcrumbItems,
  id = "main-content",
}: PageWrapperProps) {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Trigger entrance animation
  useEffect(() => {
    // Small delay for smoother transition
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [location.pathname]);

  return (
    <div
      ref={wrapperRef}
      id={id}
      className={cn(
        "min-h-screen transition-opacity duration-300 ease-out",
        isVisible ? "opacity-100" : "opacity-0",
        className
      )}
    >
      {showBreadcrumbs && (
        <div className="container-wide pt-4">
          <Breadcrumbs items={breadcrumbItems} />
        </div>
      )}
      {children}
    </div>
  );
}

/**
 * Simple fade-in section for content areas
 */
export function FadeInSection({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "50px" }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-500 ease-out",
        isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-4",
        className
      )}
    >
      {children}
    </div>
  );
}
