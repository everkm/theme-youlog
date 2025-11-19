(function () {
  if (args.src.endsWith(".mp4")) {
    return `<video data-player="video" src="${args.src}" controls="" preload="metadata"></video>`;
  } else if (args.src.endsWith(".mp3")) {
    return `<audio data-player="audio" src="${args.src}" controls="" preload="metadata"></audio>`;
  }
  return "<div>Unsupported media type</div>";
})();
