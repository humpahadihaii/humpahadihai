import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { getEffectiveStatus, UserStatus } from "@/hooks/useAuth";
import { UserRole } from "@/lib/roles";

const loginSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address").max(255),
  password: z.string().min(1, "Password is required"),
});

const signupSchema = z.object({
  fullName: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Please enter a valid email address").max(255),
  password: z.string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password must be less than 100 characters"),
});

const resetSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address").max(255),
});

const AuthPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({ email: "", password: "", fullName: "" });

  // Helper to fetch user data and determine redirect
  const handleUserRedirect = async (userId: string) => {
    try {
      // Fetch roles and profile in parallel
      const [rolesResult, profileResult] = await Promise.all([
        supabase.from("user_roles").select("role").eq("user_id", userId),
        supabase.from("profiles").select("status").eq("id", userId).single()
      ]);

      const roles = (rolesResult.data?.map(r => r.role) || []) as UserRole[];
      const status = (profileResult.data?.status || "pending") as UserStatus;
      
      const effectiveStatus = getEffectiveStatus(status, roles);

      if (effectiveStatus === "disabled") {
        toast.error("Your account has been disabled. Please contact support.");
        await supabase.auth.signOut();
        return;
      }

      if (effectiveStatus === "pending") {
        navigate("/pending-approval", { replace: true });
        return;
      }

      // Active user with roles - go to admin
      toast.success("Welcome back!");
      navigate("/admin", { replace: true });
    } catch (error) {
      console.error("Error checking user status:", error);
      navigate("/pending-approval", { replace: true });
    }
  };

  // Check existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await handleUserRedirect(session.user.id);
        }
      } catch (error) {
        console.error("Session check error:", error);
      } finally {
        setIsCheckingSession(false);
      }
    };

    checkSession();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const validatedData = loginSchema.parse(loginData);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: validatedData.email,
        password: validatedData.password,
      });

      if (error) {
        setIsLoading(false);
        if (error.message.includes("Invalid login credentials")) {
          toast.error("Invalid email or password. Please try again.");
        } else if (error.message.includes("Email not confirmed")) {
          toast.error("Please verify your email before logging in.");
        } else if (error.message.includes("Network") || error.message.includes("fetch")) {
          toast.error("Login failed due to a server issue. Please try again.");
        } else {
          toast.error(error.message);
        }
        return;
      }

      // Successful login - perform single redirect
      if (data.user) {
        await handleUserRedirect(data.user.id);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        console.error("Login error:", error);
        toast.error("Login failed due to a server issue. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const validatedData = signupSchema.parse(signupData);
      
      const { data, error } = await supabase.auth.signUp({
        email: validatedData.email,
        password: validatedData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: validatedData.fullName,
          },
        },
      });

      if (error) {
        if (error.message.includes("already registered")) {
          toast.error("This email is already registered. Please log in instead.");
        } else {
          toast.error(error.message);
        }
        return;
      }

      // Sign out immediately to prevent auto-login
      await supabase.auth.signOut();

      toast.success("Account created! Your request is pending admin approval.");
      setSignupData({ email: "", password: "", fullName: "" });
      
      setTimeout(() => {
        navigate("/pending-approval");
      }, 1500);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        console.error("Signup error:", error);
        toast.error("An error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const validatedData = resetSchema.parse({ email: resetEmail });
      
      const { error } = await supabase.auth.resetPasswordForEmail(validatedData.email, {
        redirectTo: `${window.location.origin}/login`,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Password reset email sent! Please check your inbox.");
      setShowForgotPassword(false);
      setResetEmail("");
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        console.error("Password reset error:", error);
        toast.error("Failed to send reset email. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while checking existing session
  if (isCheckingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 px-4 py-8 sm:py-12">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl sm:text-3xl font-bold">
            Hum Pahadi Haii
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Celebrating Uttarakhand's Rich Heritage
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login" className="text-sm sm:text-base">
                Login
              </TabsTrigger>
              <TabsTrigger value="signup" className="text-sm sm:text-base">
                Sign Up
              </TabsTrigger>
            </TabsList>
            
            {/* Login Tab */}
            <TabsContent value="login" className="space-y-4">
              {showForgotPassword ? (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reset-email" className="text-sm sm:text-base">
                      Email Address
                    </Label>
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="your@email.com"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      disabled={isLoading}
                      className="text-sm sm:text-base"
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full text-sm sm:text-base" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      "Send Reset Link"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full text-sm sm:text-base"
                    onClick={() => setShowForgotPassword(false)}
                    disabled={isLoading}
                  >
                    Back to Login
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="text-sm sm:text-base">
                      Email Address
                    </Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="your@email.com"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      disabled={isLoading}
                      className="text-sm sm:text-base"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-sm sm:text-base">
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        disabled={isLoading}
                        className="text-sm sm:text-base pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        disabled={isLoading}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full text-sm sm:text-base" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="link"
                    className="w-full text-sm"
                    onClick={() => setShowForgotPassword(true)}
                    disabled={isLoading}
                  >
                    Forgot your password?
                  </Button>
                </form>
              )}
            </TabsContent>
            
            {/* Sign Up Tab */}
            <TabsContent value="signup" className="space-y-4">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name" className="text-sm sm:text-base">
                    Full Name
                  </Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="Enter your full name"
                    value={signupData.fullName}
                    onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
                    disabled={isLoading}
                    className="text-sm sm:text-base"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-sm sm:text-base">
                    Email Address
                  </Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="your@email.com"
                    value={signupData.email}
                    onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                    disabled={isLoading}
                    className="text-sm sm:text-base"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-sm sm:text-base">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      type={showSignupPassword ? "text" : "password"}
                      placeholder="Create a password (min. 6 characters)"
                      value={signupData.password}
                      onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                      disabled={isLoading}
                      className="text-sm sm:text-base pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupPassword(!showSignupPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      disabled={isLoading}
                    >
                      {showSignupPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Password must be at least 6 characters long
                  </p>
                </div>
                <Button 
                  type="submit" 
                  className="w-full text-sm sm:text-base" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  By signing up, you agree to explore and celebrate Uttarakhand's heritage
                </p>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;
