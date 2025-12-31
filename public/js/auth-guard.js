import { supabase } from "/js/supabase.js";

async function requireAuth() {
  const { data: { session } } = await supabase.auth.getSession();

  // Allow dashboard without login
  if (!session && window.location.pathname === "/dashboard") {
    return;
  }

  // Protect other pages
  if (!session) {
    window.location.href = "/auth/login.html";
  }
}

requireAuth();
