const revealTargets = document.querySelectorAll("[data-reveal]");
const sectionLinks = document.querySelectorAll("[data-section-link]");
const progressNav = document.querySelector(".side-index nav");
const trackedSections = [...sectionLinks]
  .map((link) => document.getElementById(link.dataset.sectionLink))
  .filter(Boolean);

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      }
    });
  },
  { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
);

revealTargets.forEach((target, index) => {
  target.style.transitionDelay = `${Math.min(index, 5) * 70}ms`;
  revealObserver.observe(target);
});

function revealVisibleTargets() {
  revealTargets.forEach((target) => {
    const rect = target.getBoundingClientRect();
    if (rect.top < window.innerHeight * 1.08 && rect.bottom > -80) {
      target.classList.add("is-visible");
    }
  });
}

function updateSectionProgress() {
  if (!trackedSections.length || !progressNav) return;

  const scrollMiddle = window.scrollY + window.innerHeight * 0.42;
  let activeIndex = 0;

  trackedSections.forEach((section, index) => {
    if (section.offsetTop <= scrollMiddle) activeIndex = index;
  });

  sectionLinks.forEach((link, index) => {
    link.classList.toggle("is-active", index === activeIndex);
  });

  const progress = trackedSections.length <= 1 ? 1 : activeIndex / (trackedSections.length - 1);
  progressNav.style.setProperty("--progress", progress.toFixed(3));
}

window.addEventListener("load", revealVisibleTargets, { once: true });
window.addEventListener("load", updateSectionProgress, { once: true });
window.addEventListener("hashchange", () => {
  window.setTimeout(revealVisibleTargets, 80);
  window.setTimeout(updateSectionProgress, 80);
});

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", () => {
    window.setTimeout(revealVisibleTargets, 180);
  });
});

const scrollStorageKey = "shieldtx-new-scroll-y";
const scrollStorage = (() => {
  try {
    return window.localStorage;
  } catch {
    try {
      return window.sessionStorage;
    } catch {
      return null;
    }
  }
})();

let canSaveScrollPosition = false;

if ("scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}

function saveScrollPosition(force = false) {
  if (!force && !canSaveScrollPosition) return;
  if (!scrollStorage || window.location.hash) return;
  scrollStorage.setItem(scrollStorageKey, String(Math.max(0, Math.round(window.scrollY))));
}

function restoreScrollPosition() {
  if (!scrollStorage || window.location.hash) return;

  const savedY = Number(scrollStorage.getItem(scrollStorageKey));
  if (!Number.isFinite(savedY) || savedY <= 0) return;

  window.scrollTo(0, savedY);
}

window.requestAnimationFrame(restoreScrollPosition);
window.addEventListener("load", restoreScrollPosition, { once: true });
window.setTimeout(restoreScrollPosition, 250);
window.setTimeout(restoreScrollPosition, 900);
window.setTimeout(() => {
  canSaveScrollPosition = true;
  saveScrollPosition();
  window.setInterval(saveScrollPosition, 500);
}, 1100);

window.addEventListener("pagehide", () => saveScrollPosition(true));
window.addEventListener("beforeunload", () => saveScrollPosition(true));
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") saveScrollPosition(true);
});

let scrollSaveTicking = false;
let sectionTicking = false;
window.addEventListener(
  "scroll",
  () => {
    if (!scrollSaveTicking) {
      window.requestAnimationFrame(() => {
        saveScrollPosition();
        scrollSaveTicking = false;
      });
      scrollSaveTicking = true;
    }

    if (!sectionTicking) {
      window.requestAnimationFrame(() => {
        revealVisibleTargets();
        updateSectionProgress();
        sectionTicking = false;
      });
      sectionTicking = true;
    }
  },
  { passive: true }
);

document.querySelector("form")?.addEventListener("submit", (event) => {
  event.preventDefault();
});
