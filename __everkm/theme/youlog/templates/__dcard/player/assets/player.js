const DCARD_NAME = "player";

function setupPlayer(box) {
  const elements = box.querySelectorAll("[data-player]");
  log("setupPlayer: setupPlayer called", elements, box);
  elements.forEach((element) => {
    new Plyr(element);
  });
}

function log(message, ...args) {
  console.log("player.js: " + message, ...args);
}

function error_log(message, ...args) {
  console.error("player.js: " + message, ...args);
}

function init() {
  document.addEventListener("dcard:install", (event) => {
    log("dcard:install", event);

    if (event.detail.dcardName !== DCARD_NAME) {
      return;
    }

    setupPlayer(event.detail.container);
  });

  document.addEventListener("dcard:uninstall", (event) => {
    if (event.detail.dcardName !== DCARD_NAME) {
      return;
    }

    log("dcard:uninstall", event);
  });

  document.addEventListener("dcard:assets:error", (event) => {
    if (event.detail.dcardName !== DCARD_NAME) {
      return;
    }

    log("dcard:assets:error", event);
  });

  log("player.js initialized");
}

init();
