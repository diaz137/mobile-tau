// ── State ──────────────────────────────────────────────────────────────────
let currentFilter = "all";
let visibleCount = VISIBLE_COUNT;

// ── Render catalog ────────────────────────────────────────────────────────
function formatPrice(n) {
  return n.toLocaleString("ru-KZ") + " ₸";
}

function getGradeColor(grade) {
  if (!grade) return "";
  if (grade.includes("A")) return "grade--a";
  if (grade.includes("B")) return "grade--b";
  return "grade--c";
}

function renderPhones() {
  const grid = document.getElementById("catalogGrid");
  const filtered = currentFilter === "all"
    ? phones
    : phones.filter(p => p.condition === currentFilter);
  const visible = filtered.slice(0, visibleCount);
  const loadMoreBtn = document.getElementById("loadMoreBtn");

  grid.innerHTML = visible.map(phone => `
    <div class="phone-card" data-condition="${phone.condition}">
      ${phone.badge ? `<div class="phone-card__badge ${phone.condition === 'used' ? 'phone-card__badge--used' : ''}">${phone.badge}</div>` : ""}
      <div class="phone-card__img">
        <span class="phone-card__emoji">${phone.emoji}</span>
        ${phone.condition === "used" ? `<span class="phone-card__grade ${getGradeColor(phone.grade)}">${phone.grade}</span>` : ""}
      </div>
      <div class="phone-card__body">
        <div class="phone-card__brand">${phone.brand}</div>
        <h3 class="phone-card__name">${phone.name}</h3>
        <div class="phone-card__storage">${phone.storage} · ${phone.color}</div>
        <ul class="phone-card__specs">
          ${phone.specs.map(s => `<li>${s}</li>`).join("")}
        </ul>
        <div class="phone-card__footer">
          <div class="phone-card__prices">
            ${phone.oldPrice ? `<span class="phone-card__old-price">${formatPrice(phone.oldPrice)}</span>` : ""}
            <span class="phone-card__price">${formatPrice(phone.price)}</span>
          </div>
          <button class="btn btn--whatsapp btn--sm phone-card__buy"
            data-name="${phone.name}" data-price="${phone.price}">
            Купить
          </button>
        </div>
      </div>
    </div>
  `).join("");

  loadMoreBtn.style.display = filtered.length > visibleCount ? "inline-flex" : "none";

  // Buy buttons
  grid.querySelectorAll(".phone-card__buy").forEach(btn => {
    btn.addEventListener("click", () => {
      const name = btn.dataset.name;
      const price = parseInt(btn.dataset.price);
      const msg = `Здравствуйте! Хочу купить ${name} за ${formatPrice(price)}. Подскажите наличие?`;
      window.open(`https://wa.me/77753533067?text=${encodeURIComponent(msg)}`, "_blank");
    });
  });
}

// ── Tab filter ─────────────────────────────────────────────────────────────
document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("tab-btn--active"));
    btn.classList.add("tab-btn--active");
    currentFilter = btn.dataset.tab;
    visibleCount = VISIBLE_COUNT;
    renderPhones();
  });
});

document.getElementById("loadMoreBtn").addEventListener("click", () => {
  visibleCount += VISIBLE_COUNT;
  renderPhones();
});

// ── Repair Modal ───────────────────────────────────────────────────────────
const modal = document.getElementById("repairModal");
const modalClose = document.getElementById("modalClose");

function openModal() {
  modal.classList.add("modal-overlay--active");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  modal.classList.remove("modal-overlay--active");
  document.body.style.overflow = "";
}

document.getElementById("heroRepairBtn").addEventListener("click", openModal);
document.getElementById("servicesRepairBtn").addEventListener("click", openModal);
document.querySelectorAll(".service-card__btn").forEach(btn => btn.addEventListener("click", openModal));

modalClose.addEventListener("click", closeModal);
modal.addEventListener("click", e => {
  if (e.target === modal) closeModal();
});
document.addEventListener("keydown", e => {
  if (e.key === "Escape") closeModal();
});

// ── Repair form submit ─────────────────────────────────────────────────────
document.getElementById("repairForm").addEventListener("submit", e => {
  e.preventDefault();
  const form = e.target;
  const name = form.name.value.trim();
  const phone = form.phone.value.trim();
  const model = form.model.value.trim();
  const problem = form.problem.value.trim();
  const hasPhoto = selectedPhotos.length > 0;

  const msg =
    `🔧 *Заявка на ремонт — Mobile.tau*\n\n` +
    `👤 Имя: ${name}\n` +
    `📞 Контакт: ${phone}\n` +
    `📱 Модель: ${model}\n` +
    `❗ Проблема: ${problem}` +
    (hasPhoto ? `\n📷 Фото: будут отправлены следующим сообщением` : "");

  window.open(`https://wa.me/77753533067?text=${encodeURIComponent(msg)}`, "_blank");
  closeModal();
  form.reset();
  document.getElementById("photoPreview").innerHTML = "";
  selectedPhotos = [];
});

// ── Contact form ───────────────────────────────────────────────────────────
document.getElementById("contactForm").addEventListener("submit", e => {
  e.preventDefault();
  const form = e.target;
  const name = form.name.value.trim();
  const phone = form.phone.value.trim();
  const message = form.message.value.trim();

  const msg =
    `💬 *Сообщение с сайта Mobile.tau*\n\n` +
    `👤 Имя: ${name}\n` +
    `📞 Контакт: ${phone}\n` +
    `✉️ Сообщение: ${message}`;

  window.open(`https://wa.me/77753533067?text=${encodeURIComponent(msg)}`, "_blank");
  form.reset();
});

// ── Photo upload ───────────────────────────────────────────────────────────
let selectedPhotos = [];

const photoInput = document.getElementById("photoInput");
const photoPreview = document.getElementById("photoPreview");
const fileUploadArea = document.querySelector(".file-upload__area");

fileUploadArea.addEventListener("click", () => photoInput.click());

fileUploadArea.addEventListener("dragover", e => {
  e.preventDefault();
  fileUploadArea.classList.add("file-upload__area--drag");
});
fileUploadArea.addEventListener("dragleave", () => {
  fileUploadArea.classList.remove("file-upload__area--drag");
});
fileUploadArea.addEventListener("drop", e => {
  e.preventDefault();
  fileUploadArea.classList.remove("file-upload__area--drag");
  handleFiles(e.dataTransfer.files);
});

photoInput.addEventListener("change", () => handleFiles(photoInput.files));

function handleFiles(files) {
  Array.from(files).forEach(file => {
    if (!file.type.startsWith("image/")) return;
    selectedPhotos.push(file);
    const reader = new FileReader();
    reader.onload = ev => {
      const thumb = document.createElement("div");
      thumb.className = "file-upload__thumb";
      thumb.innerHTML = `<img src="${ev.target.result}" alt="фото" /><button type="button" class="file-upload__remove">✕</button>`;
      thumb.querySelector(".file-upload__remove").addEventListener("click", () => {
        const idx = Array.from(photoPreview.children).indexOf(thumb);
        selectedPhotos.splice(idx, 1);
        thumb.remove();
      });
      photoPreview.appendChild(thumb);
    };
    reader.readAsDataURL(file);
  });
}

// ── Header scroll effect ───────────────────────────────────────────────────
const header = document.getElementById("header");
window.addEventListener("scroll", () => {
  header.classList.toggle("header--scrolled", window.scrollY > 50);
});

// ── Burger menu ────────────────────────────────────────────────────────────
const burger = document.getElementById("burger");
const nav = document.getElementById("nav");

burger.addEventListener("click", () => {
  burger.classList.toggle("burger--active");
  nav.classList.toggle("nav--open");
});

nav.querySelectorAll(".nav__link").forEach(link => {
  link.addEventListener("click", () => {
    burger.classList.remove("burger--active");
    nav.classList.remove("nav--open");
  });
});

// ── Smooth scroll ──────────────────────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener("click", e => {
    const id = a.getAttribute("href").slice(1);
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    const headerH = header.offsetHeight;
    const top = target.getBoundingClientRect().top + window.scrollY - headerH - 16;
    window.scrollTo({ top, behavior: "smooth" });
  });
});

// ── Scroll reveal animations ───────────────────────────────────────────────
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("revealed");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll(".service-card, .whyus__item, .contact__info, .contact__form-card").forEach(el => {
  el.classList.add("reveal");
  observer.observe(el);
});

// ── Init ───────────────────────────────────────────────────────────────────
renderPhones();
