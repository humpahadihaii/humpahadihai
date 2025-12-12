import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Home, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Village {
  id: string;
  name: string;
  slug: string;
  thumbnail_url?: string | null;
  introduction?: string | null;
  tehsil?: string | null;
}

interface NearbyVillagesSectionProps {
  villages: Village[];
  districtName?: string;
  isLoading?: boolean;
}

export default function NearbyVillagesSection({
  villages,
  districtName,
  isLoading,
}: NearbyVillagesSectionProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!villages || villages.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Home className="h-5 w-5 text-primary" />
          Nearby Villages
        </CardTitle>
        {districtName && (
          <p className="text-sm text-muted-foreground">
            Other villages in {districtName}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {villages.slice(0, 6).map((village) => (
          <Link
            key={village.id}
            to={`/villages/${village.slug}`}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors group"
          >
            {village.thumbnail_url ? (
              <img
                src={village.thumbnail_url}
                alt={village.name}
                className="w-12 h-12 rounded object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-12 h-12 rounded bg-muted flex items-center justify-center">
                <Home className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <span className="text-sm font-medium group-hover:text-primary transition-colors line-clamp-1 flex items-center gap-1">
                {village.name}
                <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </span>
              {village.tehsil && (
                <Badge variant="outline" className="text-xs mt-1">
                  {village.tehsil}
                </Badge>
              )}
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
