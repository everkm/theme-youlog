document.addEventListener("DOMContentLoaded", () => {
  const elements = document.querySelectorAll("[data-player]");
  elements.forEach((element) => {
    new Plyr(element);
  });
});
