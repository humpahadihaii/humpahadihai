import { useState, useMemo, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { getHeatmapData } from "@/lib/analytics";
import { supabase } from "@/integrations/supabase/client";
import { Eye, MousePointer2, Flame } from "lucide-react";

interface HeatmapBucket {
  bucket_x: number;
  bucket_y: number;
  click_count: number;
  element_id?: string;
  viewport_width?: number;
}

function getHeatColor(intensity: number): string {
  // intensity is 0-1
  if (intensity < 0.25) return 'rgba(59, 130, 246, 0.4)'; // blue
  if (intensity < 0.5) return 'rgba(34, 197, 94, 0.5)'; // green
  if (intensity < 0.75) return 'rgba(250, 204, 21, 0.6)'; // yellow
  return 'rgba(239, 68, 68, 0.7)'; // red
}

export function HeatmapViewer() {
  const [selectedPage, setSelectedPage] = useState<string>('/');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [opacity, setOpacity] = useState([70]);
  const [viewportWidth, setViewportWidth] = useState<string>('all');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Fetch available pages
  const { data: pages } = useQuery({
    queryKey: ['analytics-pages'],
    queryFn: async () => {
      const { data } = await (supabase
        .from('page_unique_visits' as any)
        .select('page_slug')
        .limit(100)) as { data: any[] | null };
      
      const uniquePages = [...new Set((data || []).map(d => d.page_slug))];
      return uniquePages.sort();
    },
  });

  // Fetch heatmap data
  const { data: heatmapData, isLoading } = useQuery({
    queryKey: ['analytics-heatmap', selectedPage, selectedDate],
    queryFn: async () => {
      const result = await getHeatmapData(selectedPage, selectedDate);
      return result.buckets as HeatmapBucket[];
    },
    enabled: !!selectedPage,
  });

  // Filter and process heatmap data
  const processedData = useMemo(() => {
    if (!heatmapData) return { buckets: [], maxCount: 0, totalClicks: 0 };

    let filtered = heatmapData;
    if (viewportWidth !== 'all') {
      const width = parseInt(viewportWidth);
      filtered = heatmapData.filter(b => b.viewport_width === width);
    }

    const maxCount = Math.max(...filtered.map(b => b.click_count), 1);
    const totalClicks = filtered.reduce((sum, b) => sum + b.click_count, 0);

    return { buckets: filtered, maxCount, totalClicks };
  }, [heatmapData, viewportWidth]);

  // Draw heatmap on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw page background placeholder
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid lines
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 0.5;
    for (let x = 0; x < canvas.width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw heatmap circles
    processedData.buckets.forEach(bucket => {
      const intensity = bucket.click_count / processedData.maxCount;
      const radius = 25 + (intensity * 25); // 25-50px radius
      const color = getHeatColor(intensity);

      // Scale bucket position to canvas
      const x = (bucket.bucket_x / 1920) * canvas.width;
      const y = bucket.bucket_y * 0.5; // Scale down Y

      // Draw gradient circle
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, 'transparent');

      ctx.globalAlpha = opacity[0] / 100;
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    });

    // Draw click count labels for high-intensity areas
    processedData.buckets.filter(b => b.click_count > processedData.maxCount * 0.5).forEach(bucket => {
      const x = (bucket.bucket_x / 1920) * canvas.width;
      const y = bucket.bucket_y * 0.5;

      ctx.fillStyle = '#1f2937';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(bucket.click_count.toString(), x, y + 4);
    });
  }, [processedData, opacity]);

  // Get unique viewport widths
  const viewportWidths = useMemo(() => {
    if (!heatmapData) return [];
    return [...new Set(heatmapData.map(b => b.viewport_width).filter(Boolean))].sort((a, b) => a - b);
  }, [heatmapData]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Click Heatmaps</h2>
          <p className="text-sm text-muted-foreground">Visualize where users click on your pages</p>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Filters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Page</Label>
              <Select value={selectedPage} onValueChange={setSelectedPage}>
                <SelectTrigger>
                  <SelectValue placeholder="Select page" />
                </SelectTrigger>
                <SelectContent>
                  {pages?.map(page => (
                    <SelectItem key={page} value={page}>{page}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Viewport Width</Label>
              <Select value={viewportWidth} onValueChange={setViewportWidth}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Viewports</SelectItem>
                  {viewportWidths.map(w => (
                    <SelectItem key={w} value={w.toString()}>{w}px</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Opacity: {opacity}%</Label>
              <Slider
                value={opacity}
                onValueChange={setOpacity}
                min={10}
                max={100}
                step={5}
              />
            </div>

            <div className="pt-4 border-t space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1">
                  <MousePointer2 className="h-4 w-4" />
                  Total Clicks
                </span>
                <Badge>{processedData.totalClicks}</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1">
                  <Flame className="h-4 w-4" />
                  Hotspots
                </span>
                <Badge variant="secondary">{processedData.buckets.length}</Badge>
              </div>
            </div>

            {/* Legend */}
            <div className="pt-4 border-t">
              <Label className="mb-2 block">Intensity</Label>
              <div className="flex items-center gap-1">
                <div className="flex-1 h-3 rounded-l" style={{ background: 'rgba(59, 130, 246, 0.4)' }} />
                <div className="flex-1 h-3" style={{ background: 'rgba(34, 197, 94, 0.5)' }} />
                <div className="flex-1 h-3" style={{ background: 'rgba(250, 204, 21, 0.6)' }} />
                <div className="flex-1 h-3 rounded-r" style={{ background: 'rgba(239, 68, 68, 0.7)' }} />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Low</span>
                <span>High</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Heatmap Canvas */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Eye className="h-4 w-4" />
              {selectedPage}
            </CardTitle>
            <CardDescription>
              Showing click data for {selectedDate}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[500px] w-full" />
            ) : processedData.buckets.length === 0 ? (
              <div className="h-[500px] flex items-center justify-center text-muted-foreground border rounded-lg">
                <div className="text-center">
                  <MousePointer2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No click data for this page and date</p>
                  <p className="text-sm">Try selecting a different date or page</p>
                </div>
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden bg-white">
                <canvas
                  ref={canvasRef}
                  width={800}
                  height={500}
                  className="w-full h-auto"
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}