function setupPlayer(box) {
  const elements = box.querySelectorAll("[data-player]");
  elements.forEach((element) => {
    new Plyr(element);
  });
}

function init() {
  document.addEventListener("dcard:install", (event) => {
    setupPlayer(event.detail.element);
  });

  document.addEventListener("dcard:uninstall", (event) => {
    console.log("dcard:uninstall", event);
  });

  document.addEventListener("dcard:assets:error", (event) => {
    console.log("dcard:assets:error", event);
  });

  console.log("player.js loaded");
}

init();
