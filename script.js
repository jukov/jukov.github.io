const DEFAULT_APPLY_URL = "https://forms.gle/XTFhPrXk8SDkBZDD7";
const APPLY_URL_BY_SOURCE = {
  nick: "https://forms.gle/EhEL1F8EdkyseVNf6",
  bacaca: "https://forms.gle/J1hrjmuLZ3ChPQQX6",
};

const getApplyUrl = () => {
  const params = new URLSearchParams(window.location.search);
  const utmSource = params.get("utm_source");

  return APPLY_URL_BY_SOURCE[utmSource] || DEFAULT_APPLY_URL;
};

const APPLY_URL = getApplyUrl();

const applyLinks = document.querySelectorAll("[data-apply-link]");
const applyLink = document.querySelector("#apply-link");
const formNote = document.querySelector("#form-note");

if (APPLY_URL) {
  applyLinks.forEach((link) => {
    link.href = APPLY_URL;
    link.target = "_blank";
    link.rel = "noreferrer";
  });
} else if (applyLink) {
  applyLink.addEventListener("click", (event) => {
    event.preventDefault();
    if (formNote) {
      formNote.textContent =
        "Анкета скоро будет подключена. Пока можно прислать ссылку на проект напрямую.";
    }
  });
}
