import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Check, X, Star, Trash2 } from "lucide-react";

interface Thought {
  id: string;
  name: string;
  location: string;
  thought: string;
  status: string;
  sentiment: string | null;
  likes_count: number;
  created_at: string;
}

const AdminThoughtsPage = () => {
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected">("pending");
  const [loading, setLoading] = useState(true);

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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Moderate Thoughts</h1>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="mb-6">
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
                    <CardTitle>{thought.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{thought.location}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge>{thought.sentiment || "neutral"}</Badge>
                    <Badge variant="outline">{thought.likes_count} likes</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="mb-4 whitespace-pre-wrap">{thought.thought}</p>
                <p className="text-xs text-muted-foreground mb-4">
                  Submitted: {new Date(thought.created_at).toLocaleString()}
                </p>

                <div className="flex gap-2 flex-wrap">
                  {filter === "pending" && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => updateStatus(thought.id, "approved")}
                        className="gap-2"
                      >
                        <Check className="h-4 w-4" />
                        Approve
                      </Button>
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
  );
};

export default AdminThoughtsPage;
