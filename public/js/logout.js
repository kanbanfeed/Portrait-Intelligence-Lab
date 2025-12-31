import { supabase } from "/js/supabase.js";

async function logout() {
  // 1️⃣ Supabase logout
  await supabase.auth.signOut();

  // 2️⃣ Clear backend JWT cookie
  document.cookie = "auth_token=; Max-Age=0; path=/;";

  // 3️⃣ Redirect to login
  window.location.href = "/auth/login.html";
}

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("logout-btn");
  if (btn) {
    btn.addEventListener("click", logout);
  }
});
