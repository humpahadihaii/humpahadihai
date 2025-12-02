import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Send } from "lucide-react";

const submissionSchema = z.object({
  type: z.enum(["story", "photo"]),
  target_section: z.string().min(1, "Please select a section"),
  title: z.string().min(3, "Title must be at least 3 characters"),
  body: z.string().optional(),
  image_url: z.string().optional(),
}).refine((data) => {
  if (data.type === "story") {
    return data.body && data.body.length >= 50;
  }
  if (data.type === "photo") {
    return data.image_url && data.image_url.length > 0;
  }
  return true;
}, {
  message: "Stories need at least 50 characters of text, photos need an image",
  path: ["body"],
});

type SubmissionFormData = z.infer<typeof submissionSchema>;

const SubmitStoryPage = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const form = useForm<SubmissionFormData>({
    resolver: zodResolver(submissionSchema),
    defaultValues: {
      type: "story",
      target_section: "",
      title: "",
      body: "",
      image_url: "",
    },
  });

  const submissionType = form.watch("type");

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please sign in to submit your story");
      navigate("/auth");
      return;
    }
    setIsAuthenticated(true);
    setLoading(false);
  };

  const onSubmit = async (data: SubmissionFormData) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please sign in first");
      navigate("/auth");
      return;
    }

    const submissionData = {
      user_id: user.id,
      type: data.type,
      target_section: data.target_section,
      title: data.title,
      body: data.body || null,
      image_url: data.image_url || null,
      status: "pending",
    };

    const { error } = await supabase
      .from("community_submissions")
      .insert(submissionData);

    if (error) {
      console.error("Submission error:", error);
      toast.error("Failed to submit. Please try again.");
    } else {
      toast.success("Submission received! We'll review it soon.");
      form.reset();
      navigate("/my-submissions");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-12 px-4">
      <div className="container mx-auto max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Share Your Story</CardTitle>
            <CardDescription>
              Share your experiences, photos, and stories about Uttarakhand's culture, food, travel, or personal reflections.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Submission Type</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex gap-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="story" id="story" />
                            <Label htmlFor="story" className="cursor-pointer">Story/Article</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="photo" id="photo" />
                            <Label htmlFor="photo" className="cursor-pointer">Photo</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="target_section"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select where this belongs" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="culture">Culture & Traditions</SelectItem>
                          <SelectItem value="food">Food & Recipes</SelectItem>
                          <SelectItem value="travel">Travel & Nature</SelectItem>
                          <SelectItem value="thought">Personal Thoughts</SelectItem>
                          <SelectItem value="gallery">Gallery (Photo only)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Give your submission a title" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {submissionType === "story" && (
                  <FormField
                    control={form.control}
                    name="body"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Story * (minimum 50 characters)</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={10}
                            placeholder="Share your experience, story, or knowledge..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="image_url"
                  render={({ field }) => (
                    <FormItem>
                      <ImageUpload
                        label={submissionType === "photo" ? "Your Photo *" : "Optional Image"}
                        value={field.value || ""}
                        onChange={field.onChange}
                        id="submission-image"
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>Note:</strong> Your submission will be reviewed by our team before being published. 
                    We may contact you if any changes are needed. Thank you for contributing to Hum Pahadi Haii!
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button type="submit" className="flex-1">
                    <Send className="mr-2 h-4 w-4" />
                    Submit for Review
                  </Button>
                  <Button type="button" variant="outline" onClick={() => navigate("/")}>
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SubmitStoryPage;
