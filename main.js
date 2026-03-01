/* Figxly hero interactions (ES2023, vanilla) */

const qs = (s, r = document) => r.querySelector(s);
const qsa = (s, r = document) => Array.from(r.querySelectorAll(s));

function showToast(msg = "Buscando…", ms = 1200) {
  const toast = qs("#toast");
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.remove("hidden");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.add("hidden"), ms);
}

// ---------- Asset fallbacks (NO binarios en repo) ----------
function setupImageFallbacks() {
  // Logo: if missing, just hide image (keep text)
  qsa('img[data-fallback="logo"]').forEach((img) => {
    img.addEventListener("error", () => {
      img.classList.add("hidden");
    });
  });

  // Category: if missing, show placeholder overlay
  qsa('img[data-fallback="cat"]').forEach((img) => {
    img.addEventListener("error", () => {
      img.classList.add("hidden");
      const ph = img.closest(".cat-avatar")?.querySelector(".cat-ph");
      if (ph) ph.style.display = "block";
    });
  });

  // Phone: if missing, swap to phone placeholder
  const phoneImg = qs('img[data-fallback="phone"]');
  const phonePh = qs(".phone-ph");
  if (phoneImg && phonePh) {
    phoneImg.addEventListener("error", () => {
      phoneImg.classList.add("hidden");
      phonePh.classList.remove("hidden");
    });
  }
}

// ---------- Desktop location dropdown ----------
function setupLocationDropdownDesktop() {
  const btn = qs("#locationBtn");
  const menu = qs("#locationMenu");
  const label = qs("#locationLabel");
  if (!btn || !menu || !label) return;

  const open = () => {
    menu.classList.remove("hidden");
    btn.setAttribute("aria-expanded", "true");
  };
  const close = () => {
    menu.classList.add("hidden");
    btn.setAttribute("aria-expanded", "false");
  };
  const toggle = () => (menu.classList.contains("hidden") ? open() : close());

  btn.addEventListener("click", (e) => {
    e.preventDefault();
    toggle();
  });

  qsa("#locationMenu .dd-item").forEach((item) => {
    item.addEventListener("click", () => {
      const city = item.getAttribute("data-city") || item.textContent?.trim() || "Ubicación";
      label.textContent = city;
      close();
    });
  });

  // close on outside click / esc
  document.addEventListener("click", (e) => {
    if (menu.classList.contains("hidden")) return;
    if (menu.contains(e.target) || btn.contains(e.target)) return;
    close();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
}

// ---------- Mobile location dropdown ----------
function setupLocationDropdownMobile() {
  const btn = qs("#locationBtnMobile");
  const menu = qs("#locationMenuMobile");
  const label = qs("#locationLabelMobile");
  if (!btn || !menu || !label) return;

  const open = () => {
    menu.classList.remove("hidden");
    btn.setAttribute("aria-expanded", "true");
  };
  const close = () => {
    menu.classList.add("hidden");
    btn.setAttribute("aria-expanded", "false");
  };
  const toggle = () => (menu.classList.contains("hidden") ? open() : close());

  btn.addEventListener("click", (e) => {
    e.preventDefault();
    toggle();
  });

  qsa("#locationMenuMobile .dd-item").forEach((item) => {
    item.addEventListener("click", () => {
      const city = item.getAttribute("data-city") || item.textContent?.trim() || "Ubicación";
      label.textContent = city;
      close();
    });
  });

  document.addEventListener("click", (e) => {
    if (menu.classList.contains("hidden")) return;
    if (menu.contains(e.target) || btn.contains(e.target)) return;
    close();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
}

// ---------- Date label sync ----------
function setupDatePickers() {
  const dateInput = qs("#dateInput");
  const dateLabel = qs("#dateLabel");

  if (dateInput && dateLabel) {
    dateInput.addEventListener("change", () => {
      if (!dateInput.value) {
        dateLabel.textContent = "Elige fecha";
        return;
      }
      // Format: dd/mm/yyyy (simple)
      const [y, m, d] = dateInput.value.split("-");
      dateLabel.textContent = `${d}/${m}/${y}`;
    });

    // clicking the label button triggers input (the input is on top but invisible)
    const dateBtn = qs("#dateBtn");
    if (dateBtn) dateBtn.addEventListener("click", () => dateInput.showPicker?.());
  }

  const dateInputM = qs("#dateInputMobile");
  const dateLabelM = qs("#dateLabelMobile");
  if (dateInputM && dateLabelM) {
    dateInputM.addEventListener("change", () => {
      if (!dateInputM.value) {
        dateLabelM.textContent = "Elige fecha";
        return;
      }
      const [y, m, d] = dateInputM.value.split("-");
      dateLabelM.textContent = `${d}/${m}/${y}`;
    });
  }
}

// ---------- Search submit ----------
function setupSearch() {
  const form = qs("#search-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    showToast("Buscando…", 1200);
  });
}

// ---------- Header buttons ----------
function setupHeaderButtons() {
  const login = qs("#btn-login");
  const signup = qs("#btn-signup");
  login?.addEventListener("click", () => console.log("Login (mock)"));
  signup?.addEventListener("click", () => console.log("Signup (mock)"));

  qsa("[data-mobile-login]").forEach((b) => b.addEventListener("click", () => console.log("Login (mock)")));
  qsa("[data-mobile-signup]").forEach((b) => b.addEventListener("click", () => console.log("Signup (mock)")));
}

// ---------- Mobile menu ----------
function setupMobileMenu() {
  const btn = qs("#btn-mobile-menu");
  const panel = qs("#mobile-menu");
  if (!btn || !panel) return;

  btn.addEventListener("click", () => {
    const isOpen = !panel.classList.contains("hidden");
    panel.classList.toggle("hidden");
    btn.setAttribute("aria-expanded", String(!isOpen));
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupImageFallbacks();
  setupLocationDropdownDesktop();
  setupLocationDropdownMobile();
  setupDatePickers();
  setupSearch();
  setupHeaderButtons();
  setupMobileMenu();
});
