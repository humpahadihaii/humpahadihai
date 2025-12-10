import { supabase } from "@/integrations/supabase/client";

/**
 * Comprehensive logout function that:
 * 1. Signs out from Supabase Auth
 * 2. Clears all localStorage items related to auth
 * 3. Clears sessionStorage
 * 4. Clears any auth-related cookies
 * 5. Redirects to the auth page
 */
export const performLogout = async (): Promise<void> => {
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
  } catch (error) {
    console.error("Supabase signOut error:", error);
    // Continue with redirect even if signOut fails
  }

  // 5. Force redirect to login page using window.location for a clean slate
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
  try {
    // Sign out from Supabase
    const { error } = await supabase.auth.signOut({ scope: 'global' });
    
    if (error) {
      console.error("Logout error:", error);
    }

    // Clear localStorage items
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

    // Call success callback if provided
    if (onSuccess) {
      onSuccess();
    }

    // Navigate to auth page
    navigate('/login');
  } catch (error) {
    console.error("Logout error:", error);
    // Even if there's an error, try to redirect
    navigate('/login');
  }
};
