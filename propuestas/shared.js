const PROPOSAL_BG_IMAGES = [
  "../resources/fondos/inicio_01.jpg",
  "../resources/fondos/inicio_02.jpg",
  "../resources/fondos/inicio_03.jpg",
  "../resources/fondos/inicio_04.jpg",
  "../resources/fondos/inicio_05.jpg",
  "../resources/fondos/inicio_06.jpg",
  "../resources/fondos/inicio_07.jpg",
];

function pickNextIndex(current, length) {
  if (length <= 1) return current;
  let next = current;
  while (next === current) {
    next = Math.floor(Math.random() * length);
  }
  return next;
}

function waitForImages(sources) {
  return Promise.all(
    [...new Set(sources)].map(
      (src) =>
        new Promise((resolve) => {
          const img = new Image();
          img.onload = resolve;
          img.onerror = resolve;
          img.src = src;
        }),
    ),
  );
}

function setupBackgroundCrossfade({
  layerA,
  layerB,
  images = PROPOSAL_BG_IMAGES,
  interval = 7000,
  startIndex = 0,
}) {
  const a = typeof layerA === "string" ? document.querySelector(layerA) : layerA;
  const b = typeof layerB === "string" ? document.querySelector(layerB) : layerB;

  if (!a || !b || !images.length) return () => {};

  let currentIndex = startIndex;
  let active = a;
  let inactive = b;

  const applyBackground = (el, src, visible) => {
    el.style.backgroundImage = `url("${src}")`;
    el.classList.toggle("is-visible", visible);
    el.classList.remove("is-dim");
  };

  applyBackground(active, images[currentIndex], true);
  inactive.style.backgroundImage = `url("${images[pickNextIndex(currentIndex, images.length)]}")`;

  let timer = null;

  const cycle = () => {
    if (images.length <= 1) return;
    currentIndex = pickNextIndex(currentIndex, images.length);
    inactive.style.backgroundImage = `url("${images[currentIndex]}")`;
    inactive.classList.add("is-visible");
    active.classList.remove("is-visible");
    const swap = active;
    active = inactive;
    inactive = swap;
    timer = window.setTimeout(cycle, interval);
  };

  timer = window.setTimeout(cycle, interval);

  return () => window.clearTimeout(timer);
}

function setupCarouselCounter({ track, counter, prefix = "pieza" }) {
  const trackEl = typeof track === "string" ? document.querySelector(track) : track;
  const counterEl = typeof counter === "string" ? document.querySelector(counter) : counter;
  if (!trackEl || !counterEl) return () => {};

  const items = Array.from(trackEl.children);
  if (!items.length) return () => {};

  const update = () => {
    const rect = trackEl.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    let nearest = 0;
    let nearestDistance = Infinity;

    items.forEach((item, index) => {
      const itemRect = item.getBoundingClientRect();
      const itemCenter = itemRect.left + itemRect.width / 2;
      const distance = Math.abs(itemCenter - centerX);
      if (distance < nearestDistance) {
        nearest = index;
        nearestDistance = distance;
      }
    });

    counterEl.textContent = `${prefix} ${String(nearest + 1).padStart(2, "0")} / ${String(items.length).padStart(2, "0")}`;
  };

  const onScroll = () => window.requestAnimationFrame(update);
  trackEl.addEventListener("scroll", onScroll, { passive: true });
  update();

  return () => trackEl.removeEventListener("scroll", onScroll);
}

function setupVideoToggle(video, button) {
  const videoEl = typeof video === "string" ? document.querySelector(video) : video;
  const buttonEl = typeof button === "string" ? document.querySelector(button) : button;
  if (!videoEl || !buttonEl) return;

  const updateButton = () => {
    buttonEl.classList.toggle("is-hidden", !videoEl.paused && !videoEl.ended);
  };

  buttonEl.addEventListener("click", async () => {
    try {
      await videoEl.play();
      updateButton();
    } catch (error) {
      console.error(error);
    }
  });

  videoEl.addEventListener("playing", updateButton);
  videoEl.addEventListener("pause", updateButton);
  videoEl.addEventListener("ended", updateButton);
  updateButton();
}

function setupPosterSequence(container, frames, { interval = 520 } = {}) {
  const host = typeof container === "string" ? document.querySelector(container) : container;
  if (!host || !frames.length) return;

  host.innerHTML = "";
  const layers = frames.map((src, index) => {
    const layer = document.createElement("div");
    layer.className = "poster-layer";
    layer.style.opacity = index === 0 ? "1" : "0";
    const img = document.createElement("img");
    img.src = src;
    img.alt = "";
    layer.appendChild(img);
    host.appendChild(layer);
    return layer;
  });

  let index = 0;
  const tick = () => {
    layers[index].style.opacity = "0";
    index = (index + 1) % layers.length;
    layers[index].style.opacity = "1";
  };

  const timer = window.setInterval(tick, interval);
  return () => window.clearInterval(timer);
}

window.SaudadeProposal = {
  bgImages: PROPOSAL_BG_IMAGES,
  pickNextIndex,
  waitForImages,
  setupBackgroundCrossfade,
  setupCarouselCounter,
  setupVideoToggle,
  setupPosterSequence,
};
