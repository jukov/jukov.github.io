const APPLY_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSf7_oRZUWIaQK9iVIiKOmuQJf_9SD1EtP1zia_ioSgUy245cw/viewform?usp=publish-editor";

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
