const scenes = Array.from(document.querySelectorAll(".scene"));
const restartButton = document.querySelector("#restart");
const progressFill = document.querySelector("#progress-fill");
const timeLabel = document.querySelector("#time-label");

const durationMs = 30000;
const sceneDurationMs = durationMs / scenes.length;
let startedAt = performance.now();
let animationFrame = null;

function formatTime(ms) {
  const seconds = Math.min(30, Math.floor(ms / 1000));
  return `0:${String(seconds).padStart(2, "0")} / 0:30`;
}

function setScene(index) {
  scenes.forEach((scene, sceneIndex) => {
    scene.classList.toggle("is-active", sceneIndex === index);
  });
}

function render(now) {
  const elapsed = Math.min(durationMs, now - startedAt);
  const progress = elapsed / durationMs;
  const sceneIndex = Math.min(scenes.length - 1, Math.floor(elapsed / sceneDurationMs));

  setScene(sceneIndex);

  if (progressFill) {
    progressFill.style.width = `${progress * 100}%`;
  }

  if (timeLabel) {
    timeLabel.textContent = formatTime(elapsed);
  }

  if (elapsed < durationMs) {
    animationFrame = requestAnimationFrame(render);
  }
}

function restart() {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
  }
  startedAt = performance.now();
  setScene(0);
  animationFrame = requestAnimationFrame(render);
}

restartButton?.addEventListener("click", restart);
restart();
