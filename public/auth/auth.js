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
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const msg = document.getElementById("msg");
  const btn = document.querySelector("button");

  msg.textContent = "";
  btn.disabled = true;
  btn.textContent = "Logging in...";

  if (!window.supabase) {
    msg.textContent = "Supabase not loaded";
    btn.disabled = false;
    btn.textContent = "Login";
    return;
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    msg.textContent = error.message;
    btn.disabled = false;
    btn.textContent = "Login";
    return;
  }

  window.location.href = "/dashboard";
}

