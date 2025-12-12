import { useState, useEffect } from "react";
import { Search, CloudSun, Map, Phone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSearchModal } from "@/components/search/SearchContext";

interface EmergencyContact {
  label: string;
  number: string;
  type: "police" | "ambulance" | "fire" | "disaster";
}

const EMERGENCY_CONTACTS: EmergencyContact[] = [
  { label: "Police", number: "100", type: "police" },
  { label: "Ambulance", number: "102", type: "ambulance" },
  { label: "Fire", number: "101", type: "fire" },
  { label: "Disaster Helpline", number: "1070", type: "disaster" },
  { label: "Women Helpline", number: "1091", type: "police" },
  { label: "Tourist Helpline", number: "1363", type: "police" },
];

export function QuickAccessBar() {
  const [isVisible, setIsVisible] = useState(true);
  const [showEmergency, setShowEmergency] = useState(false);
  const [showWeather, setShowWeather] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { openSearch } = useSearchModal();

  // Hide on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const handleRouteClick = () => {
    window.open("https://www.google.com/maps/dir/?api=1&destination=Uttarakhand", "_blank");
  };

  return (
    <>
      {/* Quick Access Bar */}
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ease-out",
          "bg-card/95 backdrop-blur-md border-t border-border shadow-lg",
          "pb-safe", // iOS safe area
          isVisible ? "translate-y-0" : "translate-y-full"
        )}
      >
        <div className="flex items-center justify-around px-4 py-3 max-w-lg mx-auto">
          {/* Search */}
          <Button
            variant="ghost"
            size="sm"
            className="flex flex-col items-center gap-1 h-auto py-2 px-3 hover:bg-primary/10 transition-all duration-200 hover:scale-105"
            onClick={openSearch}
          >
            <Search className="h-5 w-5 text-primary" />
            <span className="text-xs text-muted-foreground">Search</span>
          </Button>

          {/* Weather */}
          <Button
            variant="ghost"
            size="sm"
            className="flex flex-col items-center gap-1 h-auto py-2 px-3 hover:bg-primary/10 transition-all duration-200 hover:scale-105"
            onClick={() => setShowWeather(!showWeather)}
          >
            <CloudSun className="h-5 w-5 text-accent" />
            <span className="text-xs text-muted-foreground">Weather</span>
          </Button>

          {/* Route */}
          <Button
            variant="ghost"
            size="sm"
            className="flex flex-col items-center gap-1 h-auto py-2 px-3 hover:bg-primary/10 transition-all duration-200 hover:scale-105"
            onClick={handleRouteClick}
          >
            <Map className="h-5 w-5 text-secondary" />
            <span className="text-xs text-muted-foreground">Routes</span>
          </Button>

          {/* Emergency */}
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "flex flex-col items-center gap-1 h-auto py-2 px-3 transition-all duration-200 hover:scale-105",
              showEmergency ? "bg-destructive/10" : "hover:bg-destructive/10"
            )}
            onClick={() => setShowEmergency(!showEmergency)}
          >
            <Phone className="h-5 w-5 text-destructive" />
            <span className="text-xs text-muted-foreground">Emergency</span>
          </Button>
        </div>
      </div>

      {/* Emergency Panel */}
      <div
        className={cn(
          "fixed bottom-20 left-0 right-0 z-40 transition-all duration-300 ease-out",
          "px-4 pb-4",
          showEmergency ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        )}
      >
        <div className="bg-card rounded-xl shadow-xl border border-border p-4 max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-foreground">Emergency Contacts</h3>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setShowEmergency(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {EMERGENCY_CONTACTS.map((contact) => (
              <a
                key={contact.number}
                href={`tel:${contact.number}`}
                className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors duration-200"
              >
                <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center">
                  <Phone className="h-4 w-4 text-destructive" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{contact.label}</p>
                  <p className="text-xs text-muted-foreground">{contact.number}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Weather Panel */}
      <div
        className={cn(
          "fixed bottom-20 left-0 right-0 z-40 transition-all duration-300 ease-out",
          "px-4 pb-4",
          showWeather ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        )}
      >
        <div className="bg-card rounded-xl shadow-xl border border-border p-4 max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-foreground">Weather Snapshot</h3>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setShowWeather(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-muted-foreground">Dehradun</p>
              <p className="font-medium text-foreground">28°C Sunny</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-muted-foreground">Nainital</p>
              <p className="font-medium text-foreground">22°C Clear</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-muted-foreground">Mussoorie</p>
              <p className="font-medium text-foreground">20°C Cloudy</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-muted-foreground">Rishikesh</p>
              <p className="font-medium text-foreground">30°C Sunny</p>
            </div>
          </div>
        </div>
      </div>

    </>
  );
}
