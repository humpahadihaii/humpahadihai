import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User } from "@supabase/supabase-js";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Error signing out");
    } else {
      toast.success("Signed out successfully");
      navigate("/");
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-2">Welcome, {user?.email}</p>
          </div>
          <Button onClick={handleSignOut} variant="outline">
            Sign Out
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Blog Posts</CardTitle>
              <CardDescription>Manage cultural stories and blog content</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Manage Posts</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Festivals</CardTitle>
              <CardDescription>Update festival calendar entries</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Manage Festivals</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Gallery</CardTitle>
              <CardDescription>Upload and organize images and videos</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Manage Gallery</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>User Submissions</CardTitle>
              <CardDescription>Review and moderate user content</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">View Submissions</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Newsletter</CardTitle>
              <CardDescription>Manage subscribers and campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Manage Newsletter</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Site Settings</CardTitle>
              <CardDescription>Configure site-wide settings and SEO</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Edit Settings</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
