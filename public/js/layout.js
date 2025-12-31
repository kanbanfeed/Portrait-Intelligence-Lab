document.addEventListener("DOMContentLoaded", () => {
  // Load Header
  fetch("/components/header.html")
    .then(res => res.text())
    .then(html => {
      const header = document.getElementById("header-placeholder");
      if (header) {
        header.innerHTML = html;

        // 🔥 CRITICAL: fire event AFTER header is in DOM
        document.dispatchEvent(new Event("headerLoaded"));
      }
    })
    .catch(err => console.error("Header load failed", err));

  // Load Footer
  fetch("/components/footer.html")
    .then(res => res.text())
    .then(html => {
      const footer = document.getElementById("footer-placeholder");
      if (footer) footer.innerHTML = html;
    })
    .catch(err => console.error("Footer load failed", err));
});
