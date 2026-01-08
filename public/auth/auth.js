async function signup() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const msg = document.getElementById("msg");
  const btn = document.querySelector("button");

  msg.textContent = "";
  btn.disabled = true;
  btn.textContent = "Creating account...";

  if (!window.supabase) {
    msg.textContent = "Supabase not loaded";
    btn.disabled = false;
    btn.textContent = "Create Account";
    return;
  }

  const { error } = await supabase.auth.signUp({
    email,
    password
  });

  if (error) {
    msg.textContent = error.message;
    btn.disabled = false;
    btn.textContent = "Create Account";
    return;
  }

  window.location.href = "/dashboard";
}


async function login() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const msg = document.getElementById("msg");

  if (!email || !password) {
    msg.textContent = "Please enter both email and password.";
    return;
  }

  msg.textContent = "Checking credentials...";

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      msg.textContent = "Invalid credentials. Please register first.";
      return;
    }

    // --- REDIRECT LOGIC ---
    const params = new URLSearchParams(window.location.search);
    let redirectTo = params.get("redirect");

    // Safety check: ensure redirectTo starts with a / to prevent open redirect vulnerabilities
    if (redirectTo && redirectTo.startsWith('/')) {
        window.location.href = redirectTo;
    } else {
// ✅ READ REDIRECT PARAM (same as login)
const params = new URLSearchParams(window.location.search);
const redirectTo = params.get("redirect");

window.location.href = redirectTo || "/dashboard";
    }

  } catch (err) {
    console.error(err);
    msg.textContent = "Something went wrong.";
  }
}


