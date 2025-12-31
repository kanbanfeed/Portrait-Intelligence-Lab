import { supabase } from "/js/supabase.js";

async function requireLoginForTier() {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    window.location.href = "/auth/login.html";
  }
}

requireLoginForTier();

(async function () {
  if (!window.supabase) return;

  const btn = document.getElementById("purchase-btn");
  if (!btn) return;

  // Detect tier from URL (/tier/9.99 etc.)
  const tier = window.location.pathname.split("/").pop();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  // 🔒 USER NOT LOGGED IN
  if (!user) {
    btn.textContent = "Login & Join";
    btn.classList.remove("btn-success");
    btn.classList.add("btn-secondary");

    btn.onclick = () => {
      window.location.href = "/auth/login.html";
    };

    return;
  }

  // ✅ USER LOGGED IN → Proceed to checkout
  btn.textContent = "Unlock This Tier";

  btn.onclick = async () => {
    const res = await fetch("https://portrait-intelligence-lab-backend.onrender.com/api/stripe/create-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tier })
    });

    const data = await res.json();
    if (data.url) window.location.href = data.url;
  };
})();

