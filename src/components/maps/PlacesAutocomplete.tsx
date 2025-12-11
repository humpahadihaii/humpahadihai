import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Loader2 } from "lucide-react";
import { useMapSettings } from "@/hooks/useMapSettings";

// Google Maps types
type GoogleAutocomplete = google.maps.places.Autocomplete;

interface PlacesAutocompleteProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onPlaceSelect?: (place: {
    address: string;
    lat: number;
    lng: number;
    placeId: string;
  }) => void;
  className?: string;
  disabled?: boolean;
}

const PlacesAutocomplete = ({
  label = "Location",
  placeholder = "Search for a place...",
  value = "",
  onChange,
  onPlaceSelect,
  className = "",
  disabled = false,
}: PlacesAutocompleteProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [inputValue, setInputValue] = useState(value);
  const [isLoading, setIsLoading] = useState(false);
  const { apiKey, isLoading: settingsLoading } = useMapSettings();

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    if (!inputRef.current || !apiKey || settingsLoading) return;

    const loadAutocomplete = async () => {
      // Wait for Google Maps to load
      if (!window.google?.maps?.places) {
        const script = document.querySelector('script[src*="maps.googleapis.com"]');
        if (!script) {
          const newScript = document.createElement("script");
          newScript.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async`;
          newScript.async = true;
          document.head.appendChild(newScript);
          await new Promise((resolve) => {
            newScript.onload = resolve;
          });
        } else {
          // Wait for existing script to load
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      if (!window.google?.maps?.places || !inputRef.current) return;

      autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
        componentRestrictions: { country: "in" },
        fields: ["formatted_address", "geometry", "place_id", "name"],
        types: ["geocode", "establishment"],
      });

      autocompleteRef.current.addListener("place_changed", () => {
        const place = autocompleteRef.current?.getPlace();
        if (place?.geometry?.location) {
          const address = place.formatted_address || place.name || "";
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          const placeId = place.place_id || "";

          setInputValue(address);
          onChange?.(address);
          onPlaceSelect?.({ address, lat, lng, placeId });
        }
      });
    };

    loadAutocomplete();

    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [apiKey, settingsLoading, onChange, onPlaceSelect]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange?.(newValue);
  };

  if (settingsLoading) {
    return (
      <div className={className}>
        {label && <Label className="mb-2 block">{label}</Label>}
        <div className="relative">
          <Input disabled placeholder="Loading..." />
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {label && (
        <Label className="mb-2 block">
          <MapPin className="inline h-4 w-4 mr-1" />
          {label}
        </Label>
      )}
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          disabled={disabled || !apiKey}
          className="pr-10"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>
      {!apiKey && (
        <p className="text-xs text-muted-foreground mt-1">
          Maps API not configured. Enter address manually.
        </p>
      )}
    </div>
  );
};

export default PlacesAutocomplete;
