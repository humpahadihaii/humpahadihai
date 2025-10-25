import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

const thoughtSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name too long"),
  location: z.string().trim().min(1, "Location is required").max(100, "Location too long"),
  thought: z.string().trim().min(10, "Thought must be at least 10 characters").max(1000, "Thought too long"),
  photo_url: z.string().url().optional().or(z.literal("")),
  sentiment: z.enum(["positive", "critical", "neutral"]).optional(),
});

const SubmitThoughtPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    thought: "",
    photo_url: "",
    sentiment: "neutral" as "positive" | "critical" | "neutral",
  });
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const tags = [
    "Culture",
    "Nature",
    "Migration",
    "Festivals",
    "Food",
    "Language",
    "Heritage",
    "Community",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const validatedData = thoughtSchema.parse(formData);

      if (selectedTags.length === 0) {
        toast.error("Please select at least one tag");
        return;
      }

      setSubmitting(true);

      // Insert thought
      const { data: thought, error: thoughtError } = await supabase
        .from("thoughts")
        .insert({
          name: validatedData.name,
          location: validatedData.location,
          thought: validatedData.thought,
          photo_url: validatedData.photo_url || null,
          sentiment: validatedData.sentiment,
        })
        .select()
        .single();

      if (thoughtError) throw thoughtError;

      // Get tag IDs and create relations
      const { data: tagData } = await supabase
        .from("thought_tags")
        .select("id, name")
        .in("name", selectedTags);

      if (tagData) {
        const relations = tagData.map((tag) => ({
          thought_id: thought.id,
          tag_id: tag.id,
        }));

        await supabase.from("thought_tag_relations").insert(relations);
      }

      toast.success("Dhanyabaad! Your thought has been submitted for review.");
      navigate("/thoughts");
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error("Failed to submit thought. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-3xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
              Share Your Voice
            </h1>
            <p className="text-lg text-foreground/80">
              Your thoughts help preserve and celebrate our Pahadi heritage
            </p>
          </div>

          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl text-primary">Submit Your Thought</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name">Your Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your name"
                    className="mt-2"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="location">Your Location *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., Dehradun, Delhi, London"
                    className="mt-2"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="photo_url">Profile Photo URL (Optional)</Label>
                  <Input
                    id="photo_url"
                    type="url"
                    value={formData.photo_url}
                    onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
                    placeholder="https://example.com/photo.jpg"
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Paste a link to your profile photo
                  </p>
                </div>

                <div>
                  <Label htmlFor="thought">Your Thought *</Label>
                  <Textarea
                    id="thought"
                    value={formData.thought}
                    onChange={(e) => setFormData({ ...formData, thought: e.target.value })}
                    placeholder="Share your story, memory, or reflection about Pahadi culture..."
                    rows={6}
                    className="mt-2"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {formData.thought.length}/1000 characters
                  </p>
                </div>

                <div>
                  <Label>Sentiment</Label>
                  <div className="flex gap-4 mt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="sentiment"
                        value="positive"
                        checked={formData.sentiment === "positive"}
                        onChange={(e) => setFormData({ ...formData, sentiment: e.target.value as any })}
                        className="text-primary"
                      />
                      <span>Positive</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="sentiment"
                        value="critical"
                        checked={formData.sentiment === "critical"}
                        onChange={(e) => setFormData({ ...formData, sentiment: e.target.value as any })}
                      />
                      <span>Critical</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="sentiment"
                        value="neutral"
                        checked={formData.sentiment === "neutral"}
                        onChange={(e) => setFormData({ ...formData, sentiment: e.target.value as any })}
                      />
                      <span>Neutral</span>
                    </label>
                  </div>
                </div>

                <div>
                  <Label>Tags * (Select at least one)</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                    {tags.map((tag) => (
                      <div key={tag} className="flex items-center space-x-2">
                        <Checkbox
                          id={tag}
                          checked={selectedTags.includes(tag)}
                          onCheckedChange={() => toggleTag(tag)}
                        />
                        <label
                          htmlFor={tag}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {tag}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>Note:</strong> All submissions are reviewed before publication. We
                    celebrate diverse perspectives while maintaining a respectful community.
                  </p>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={submitting}
                >
                  {submitting ? "Submitting..." : "Submit Thought"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default SubmitThoughtPage;
