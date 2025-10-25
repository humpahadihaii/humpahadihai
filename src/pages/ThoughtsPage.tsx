import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Heart, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface Thought {
  id: string;
  name: string;
  location: string;
  photo_url: string | null;
  thought: string;
  sentiment: string | null;
  likes_count: number;
  created_at: string;
  tags: { name: string; slug: string }[];
  isLiked?: boolean;
}

const ThoughtsPage = () => {
  const navigate = useNavigate();
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [filter, setFilter] = useState<"all" | "positive" | "critical">("all");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [tags, setTags] = useState<{ name: string; slug: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTags();
    fetchThoughts();
  }, [filter, selectedTag]);

  const fetchTags = async () => {
    const { data, error } = await supabase.from("thought_tags").select("*");
    if (!error && data) setTags(data);
  };

  const fetchThoughts = async () => {
    setLoading(true);
    let query = supabase
      .from("thoughts")
      .select(`
        *,
        thought_tag_relations!inner(
          thought_tags(name, slug)
        )
      `)
      .in("status", ["approved", "featured"])
      .order("likes_count", { ascending: false });

    if (filter !== "all") {
      query = query.eq("sentiment", filter);
    }

    const { data, error } = await query;

    if (error) {
      toast.error("Failed to load thoughts");
      setLoading(false);
      return;
    }

    // Transform data to include tags array
    const transformedData = data?.map((thought: any) => ({
      ...thought,
      tags: thought.thought_tag_relations?.map((rel: any) => rel.thought_tags) || [],
    })) || [];

    // Filter by selected tag if any
    const filteredData = selectedTag
      ? transformedData.filter((t) => t.tags.some((tag: any) => tag.slug === selectedTag))
      : transformedData;

    setThoughts(filteredData);
    setLoading(false);
  };

  const handleLike = async (thoughtId: string) => {
    const { error } = await supabase
      .from("thought_likes")
      .insert({ thought_id: thoughtId });

    if (error) {
      if (error.code === "23505") {
        toast.error("You've already liked this thought");
      } else {
        toast.error("Failed to like thought");
      }
      return;
    }

    toast.success("Thought liked!");
    fetchThoughts();
  };

  const featuredThoughts = thoughts.filter((t: any) => t.status === "featured");
  const regularThoughts = thoughts.filter((t: any) => t.status !== "featured");

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-primary/5">
      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-primary/10 to-background">
        <div className="container mx-auto max-w-6xl text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-primary mb-6">
            Voices from the Hills
          </h1>
          <p className="text-xl text-foreground/80 mb-8">
            Stories, thoughts, and reflections from Pahadi hearts across the world
          </p>
          <Button size="lg" onClick={() => navigate("/submit-thought")} className="animate-fade-in">
            Share Your Thought
          </Button>
        </div>
      </section>

      {/* Featured Voices */}
      {featuredThoughts.length > 0 && (
        <section className="py-12 px-4 bg-gradient-to-r from-secondary/10 to-accent/10">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold text-primary mb-8 text-center">
              Featured Voices
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {featuredThoughts.slice(0, 4).map((thought) => (
                <ThoughtCard key={thought.id} thought={thought} onLike={handleLike} featured />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Filters and Tags */}
      <section className="py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="mb-6">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
              <TabsTrigger value="all">All Thoughts</TabsTrigger>
              <TabsTrigger value="positive">Positive</TabsTrigger>
              <TabsTrigger value="critical">Critical</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex flex-wrap gap-2 justify-center mb-8">
            <Button
              variant={selectedTag === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedTag(null)}
            >
              All Topics
            </Button>
            {tags.map((tag) => (
              <Button
                key={tag.slug}
                variant={selectedTag === tag.slug ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTag(tag.slug)}
              >
                {tag.name}
              </Button>
            ))}
          </div>

          {/* Thoughts Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : regularThoughts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No thoughts found. Be the first to share!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularThoughts.map((thought) => (
                <ThoughtCard key={thought.id} thought={thought} onLike={handleLike} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

const ThoughtCard = ({ thought, onLike, featured = false }: { thought: Thought; onLike: (id: string) => void; featured?: boolean }) => {
  return (
    <Card className={`hover-scale transition-all duration-300 ${featured ? "border-2 border-secondary shadow-lg" : ""}`}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={thought.photo_url || undefined} alt={thought.name} />
            <AvatarFallback>{thought.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-bold text-lg">{thought.name}</h3>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {thought.location}
            </p>
          </div>
        </div>

        <p className="text-foreground/90 mb-4 line-clamp-4">{thought.thought}</p>

        <div className="flex flex-wrap gap-2 mb-4">
          {thought.tags.map((tag: any) => (
            <Badge key={tag.slug} variant="secondary" className="text-xs">
              {tag.name}
            </Badge>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onLike(thought.id)}
            className="gap-2"
          >
            <Heart className="h-4 w-4" />
            <span>{thought.likes_count}</span>
          </Button>
          {thought.sentiment && (
            <Badge variant={thought.sentiment === "positive" ? "default" : "outline"}>
              {thought.sentiment}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ThoughtsPage;
