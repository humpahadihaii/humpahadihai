import { supabase } from "@/integrations/supabase/client";

/**
 * Comprehensive logout function that:
 * 1. Clears all localStorage items related to auth
 * 2. Clears sessionStorage
 * 3. Clears any auth-related cookies
 * 4. Signs out from Supabase Auth
 * 5. Redirects to the login page
 */
export const performLogout = async (): Promise<void> => {
  console.log("[Auth] performLogout: Starting logout process...");
  
  // 1. Clear all Supabase-related localStorage items FIRST (before signOut which might hang)
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (
      key.startsWith('sb-') || 
      key.includes('supabase') ||
      key === 'token' ||
      key === 'role' ||
      key === 'user'
    )) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key));
  console.log("[Auth] performLogout: Cleared localStorage items:", keysToRemove.length);

  // 2. Clear sessionStorage entirely
  sessionStorage.clear();

  // 3. Clear any auth-related cookies
  const cookiesToClear = ['token', 'role', 'sb-access-token', 'sb-refresh-token'];
  cookiesToClear.forEach(cookieName => {
    document.cookie = `${cookieName}=; Max-Age=0; path=/;`;
    document.cookie = `${cookieName}=; Max-Age=0; path=/; domain=${window.location.hostname};`;
  });

  // 4. Sign out from Supabase (use local scope for faster signout)
  try {
    await supabase.auth.signOut({ scope: 'local' });
    console.log("[Auth] performLogout: Supabase signOut complete");
  } catch (error) {
    console.error("[Auth] performLogout: Supabase signOut error:", error);
    // Continue with redirect even if signOut fails
  }

  // 5. Force redirect to login page using window.location for a clean slate
  console.log("[Auth] performLogout: Redirecting to /login");
  window.location.href = '/login';
};

/**
 * Logout handler that can be used with navigate (for softer redirect)
 * Use this when you want to stay in the React app context
 */
export const handleLogoutWithNavigate = async (
  navigate: (path: string) => void,
  onSuccess?: () => void
): Promise<void> => {
  console.log("[Auth] handleLogoutWithNavigate: Starting...");
  
  // Clear localStorage items first
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (
      key.startsWith('sb-') || 
      key.includes('supabase') ||
      key === 'token' ||
      key === 'role' ||
      key === 'user'
    )) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key));

  // Clear sessionStorage
  sessionStorage.clear();

  // Clear cookies
  const cookiesToClear = ['token', 'role', 'sb-access-token', 'sb-refresh-token'];
  cookiesToClear.forEach(cookieName => {
    document.cookie = `${cookieName}=; Max-Age=0; path=/;`;
  });

  try {
    // Sign out from Supabase
    await supabase.auth.signOut({ scope: 'local' });
    console.log("[Auth] handleLogoutWithNavigate: Supabase signOut complete");
  } catch (error) {
    console.error("[Auth] handleLogoutWithNavigate: Logout error:", error);
  }

  // Call success callback if provided
  if (onSuccess) {
    onSuccess();
  }

  // Navigate to login page
  navigate('/login');
};
