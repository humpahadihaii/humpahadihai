import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Check, X, Star, Trash2, Send } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";

interface Thought {
  id: string;
  name: string;
  location: string;
  thought: string;
  status: string;
  sentiment: string | null;
  created_at: string;
  photo_url?: string | null;
}

// Generate a URL-friendly slug from a string
const generateSlug = (text: string, id: string): string => {
  const baseSlug = text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 50)
    .replace(/^-+|-+$/g, '');
  return `${baseSlug}-${id.substring(0, 8)}`;
};

const AdminThoughtsPage = () => {
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected">("pending");
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState<string | null>(null);

  useEffect(() => {
    fetchThoughts();
  }, [filter]);

  const fetchThoughts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("thoughts")
      .select("*")
      .eq("status", filter)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load thoughts");
    } else {
      setThoughts(data || []);
    }
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("thoughts")
      .update({ 
        status,
        approved_at: status === "approved" || status === "featured" ? new Date().toISOString() : null
      })
      .eq("id", id);

    if (error) {
      toast.error("Failed to update status");
    } else {
      toast.success(`Thought ${status}`);
      fetchThoughts();
    }
  };

  // Approve and publish to the public Thoughts page
  const approveAndPublish = async (thought: Thought) => {
    setPublishing(thought.id);
    
    try {
      // Generate title from name or first few words
      const title = thought.name 
        ? `${thought.name}'s Reflection` 
        : thought.thought.split(' ').slice(0, 5).join(' ') + '...';
      
      const slug = generateSlug(title, thought.id);
      
      // Create content_item for public display
      const { error: contentError } = await supabase
        .from("content_items")
        .insert({
          type: "thought",
          title,
          slug,
          excerpt: thought.thought.substring(0, 200) + (thought.thought.length > 200 ? '...' : ''),
          body: `<p>${thought.thought.replace(/\n/g, '</p><p>')}</p>
          <p class="text-sm text-muted-foreground mt-4">— ${thought.name || 'Anonymous'}, ${thought.location || 'Uttarakhand'}</p>`,
          main_image_url: thought.photo_url || null,
          status: "published",
          published_at: new Date().toISOString(),
          meta_json: {
            sentiment: thought.sentiment,
            original_thought_id: thought.id,
            submitter_name: thought.name,
            submitter_location: thought.location
          }
        });

      if (contentError) {
        // If slug conflict, try with timestamp
        if (contentError.code === '23505') {
          const newSlug = `${slug}-${Date.now()}`;
          const { error: retryError } = await supabase
            .from("content_items")
            .insert({
              type: "thought",
              title,
              slug: newSlug,
              excerpt: thought.thought.substring(0, 200) + (thought.thought.length > 200 ? '...' : ''),
              body: `<p>${thought.thought.replace(/\n/g, '</p><p>')}</p>
              <p class="text-sm text-muted-foreground mt-4">— ${thought.name || 'Anonymous'}, ${thought.location || 'Uttarakhand'}</p>`,
              main_image_url: thought.photo_url || null,
              status: "published",
              published_at: new Date().toISOString(),
              meta_json: {
                sentiment: thought.sentiment,
                original_thought_id: thought.id,
                submitter_name: thought.name,
                submitter_location: thought.location
              }
            });
          
          if (retryError) throw retryError;
        } else {
          throw contentError;
        }
      }

      // Update thought status
      await supabase
        .from("thoughts")
        .update({ 
          status: "approved",
          approved_at: new Date().toISOString()
        })
        .eq("id", thought.id);

      toast.success("Thought approved and published!");
      fetchThoughts();
    } catch (error: any) {
      console.error("Publish error:", error);
      toast.error("Failed to publish thought: " + (error.message || "Unknown error"));
    } finally {
      setPublishing(null);
    }
  };

  const deleteThought = async (id: string) => {
    if (!confirm("Are you sure you want to delete this thought?")) return;

    const { error } = await supabase
      .from("thoughts")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete thought");
    } else {
      toast.success("Thought deleted");
      fetchThoughts();
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Thoughts Moderation</h1>
          <p className="text-muted-foreground">Review and publish user-submitted thoughts</p>
        </div>

        <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>
        </Tabs>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : thoughts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No {filter} thoughts found</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {thoughts.map((thought) => (
              <Card key={thought.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{thought.name || "Anonymous"}</CardTitle>
                      <p className="text-sm text-muted-foreground">{thought.location || "Unknown location"}</p>
                    </div>
                    <Badge>{thought.sentiment || "neutral"}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 whitespace-pre-wrap">{thought.thought}</p>
                  {thought.photo_url && (
                    <img 
                      src={thought.photo_url} 
                      alt="Submission" 
                      className="max-w-xs rounded-lg mb-4"
                    />
                  )}
                  <p className="text-xs text-muted-foreground mb-4">
                    Submitted: {new Date(thought.created_at).toLocaleString()}
                  </p>

                  <div className="flex gap-2 flex-wrap">
                    {filter === "pending" && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => approveAndPublish(thought)}
                          disabled={publishing === thought.id}
                          className="gap-2"
                        >
                          {publishing === thought.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                          Approve & Publish
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateStatus(thought.id, "approved")}
                          className="gap-2"
                        >
                          <Check className="h-4 w-4" />
                          Approve Only
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => updateStatus(thought.id, "rejected")}
                          className="gap-2"
                        >
                          <X className="h-4 w-4" />
                          Reject
                        </Button>
                      </>
                    )}
                    {filter === "approved" && (
                      <>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => updateStatus(thought.id, "featured")}
                          className="gap-2"
                        >
                          <Star className="h-4 w-4" />
                          Feature
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateStatus(thought.id, "pending")}
                        >
                          Move to Pending
                        </Button>
                      </>
                    )}
                    {filter === "rejected" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateStatus(thought.id, "pending")}
                      >
                        Move to Pending
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteThought(thought.id)}
                      className="gap-2 ml-auto"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminThoughtsPage;
