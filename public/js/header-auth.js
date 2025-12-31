// public/js/header-auth.js

document.addEventListener("headerLoaded", async () => {
  console.log("Header loaded, checking auth");

  if (!window.supabase) {
    console.error("Supabase not available");
    return;
  }

  // Get both the buttons and their list-item containers
  const loginItem = document.getElementById("login-item");
  const logoutItem = document.getElementById("logout-item");
  const logoutBtn = document.getElementById("logout-btn");
  const userEmail = document.getElementById("user-email");
  const userEmailItem = document.getElementById("user-email-item");

  // Check if elements exist to avoid the "missing elements" error
  if (!loginItem || !logoutItem || !logoutBtn) {
    console.error("Critical auth elements missing in header. Check IDs.");
    return;
  }

  const { data: { session } } = await supabase.auth.getSession();

  if (session?.user) {
    // ✅ USER LOGGED IN
    console.log("Session found for:", session.user.email);
    
    // 1. Set and show email (CSS desktop-only will hide it on mobile)
    if (userEmail) userEmail.textContent = session.user.email;
    if (userEmailItem) userEmailItem.style.display = "block";

    // 2. Hide Login, Show Logout
    loginItem.style.display = "none";
    logoutItem.style.display = "block";

    // 3. Handle Logout Click
    logoutBtn.onclick = async () => {
      await supabase.auth.signOut();
      document.cookie = "auth_token=; Max-Age=0; path=/;"; // Clear JWT cookie
      window.location.href = "/dashboard";
    };
  } else {
    // ❌ USER NOT LOGGED IN
    console.log("No session found");
    
    if (userEmailItem) userEmailItem.style.display = "none";
    loginItem.style.display = "block";
    logoutItem.style.display = "none";
  }
});