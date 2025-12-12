import { useState, useEffect } from "react";
import { Search, CloudSun, Map, Phone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSearchModal } from "@/components/search/SearchContext";

interface EmergencyContact {
  label: string;
  number: string;
  type: "police" | "ambulance" | "fire" | "disaster" | "rescue" | "helpline";
}

const EMERGENCY_CONTACTS: EmergencyContact[] = [
  // National Emergency Numbers
  { label: "Police", number: "100", type: "police" },
  { label: "Ambulance", number: "102", type: "ambulance" },
  { label: "Fire", number: "101", type: "fire" },
  { label: "Emergency (All)", number: "112", type: "disaster" },
  
  // Uttarakhand Specific
  { label: "SDRF Uttarakhand", number: "1070", type: "rescue" },
  { label: "Disaster Control Room", number: "0135-2710334", type: "disaster" },
  { label: "Tourist Helpline UK", number: "1364", type: "helpline" },
  { label: "Women Helpline", number: "1091", type: "helpline" },
  { label: "Child Helpline", number: "1098", type: "helpline" },
  
  // Medical & Rescue
  { label: "AIIMS Rishikesh", number: "0135-2462930", type: "ambulance" },
  { label: "Doon Hospital", number: "0135-2653194", type: "ambulance" },
  { label: "Road Accident", number: "1073", type: "rescue" },
  
  // District Control Rooms
  { label: "Dehradun Control", number: "0135-2655994", type: "police" },
  { label: "Nainital Control", number: "05942-235501", type: "police" },
  { label: "Haridwar Control", number: "01334-226608", type: "police" },
  { label: "Chamoli Control", number: "01372-252348", type: "police" },
  
  // Other Helplines
  { label: "Electricity Complaint", number: "1912", type: "helpline" },
  { label: "Forest Fire", number: "1926", type: "fire" },
  { label: "Anti-Corruption", number: "1031", type: "helpline" },
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
        <div className="bg-card rounded-xl shadow-xl border border-border p-4 max-w-lg mx-auto max-h-80 overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-foreground">Uttarakhand Emergency Contacts</h3>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setShowEmergency(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
            {EMERGENCY_CONTACTS.map((contact, idx) => (
              <a
                key={`${contact.number}-${idx}`}
                href={`tel:${contact.number}`}
                className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/50 hover:bg-muted transition-colors duration-200"
              >
                <div className={cn(
                  "h-7 w-7 rounded-full flex items-center justify-center shrink-0",
                  contact.type === "police" && "bg-blue-500/10",
                  contact.type === "ambulance" && "bg-green-500/10",
                  contact.type === "fire" && "bg-orange-500/10",
                  contact.type === "disaster" && "bg-red-500/10",
                  contact.type === "rescue" && "bg-yellow-500/10",
                  contact.type === "helpline" && "bg-purple-500/10"
                )}>
                  <Phone className={cn(
                    "h-3.5 w-3.5",
                    contact.type === "police" && "text-blue-500",
                    contact.type === "ambulance" && "text-green-500",
                    contact.type === "fire" && "text-orange-500",
                    contact.type === "disaster" && "text-red-500",
                    contact.type === "rescue" && "text-yellow-600",
                    contact.type === "helpline" && "text-purple-500"
                  )} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{contact.label}</p>
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
