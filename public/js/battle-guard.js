import { supabase } from "/js/supabase.js";

async function guardBattleAccess() {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    window.location.href = "/auth/login.html";
    return;
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("tier")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    alert("Unable to verify access");
    window.location.href = "/dashboard";
    return;
  }

  const allowedTiers = ["199", "999", "9999"];

  if (!allowedTiers.includes(profile.tier)) {
    alert("Upgrade to Access Pass or higher to join battles.");
    window.location.href = "/dashboard";
  }
}

guardBattleAccess();
