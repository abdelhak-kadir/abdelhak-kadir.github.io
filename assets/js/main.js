(function () {
  "use strict";

  const header = document.getElementById("site-header");
  const progress = document.getElementById("scroll-progress");
  const nav = document.getElementById("site-nav");
  const toggle = document.querySelector(".menu-toggle");
  const navLinks = Array.from(document.querySelectorAll("#site-nav a"));
  const sections = Array.from(document.querySelectorAll("main section[id]"));

  /* ---------- Scroll: header state + reading progress ---------- */
  let ticking = false;

  function onScroll() {
    const y = window.scrollY;
    header.classList.toggle("is-scrolled", y > 10);

    const max = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = max > 0 ? Math.min(y / max, 1) : 0;
    progress.style.transform = "scaleX(" + ratio + ")";

    ticking = false;
  }

  window.addEventListener(
    "scroll",
    function () {
      if (!ticking) {
        window.requestAnimationFrame(onScroll);
        ticking = true;
      }
    },
    { passive: true }
  );

  onScroll();

  /* ---------- Mobile navigation ---------- */
  function closeNav() {
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Ouvrir le menu");
    header.classList.remove("menu-open");
  }

  toggle.addEventListener("click", function (event) {
    const open = !nav.classList.contains("is-open");
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
    header.classList.toggle("menu-open", open);

    // Only move focus into the menu for keyboard activation.
    if (open && event.detail === 0) {
      const firstLink = nav.querySelector("a");
      if (firstLink) firstLink.focus();
    }
  });

  navLinks.forEach(function (link) {
    link.addEventListener("click", closeNav);
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && nav.classList.contains("is-open")) {
      closeNav();
      toggle.focus();
    }
  });

  document.addEventListener("click", function (event) {
    if (
      nav.classList.contains("is-open") &&
      !nav.contains(event.target) &&
      !toggle.contains(event.target)
    ) {
      closeNav();
    }
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth > 940) closeNav();
  });

  /* ---------- Active section in navigation ---------- */
  function setActive(id) {
    navLinks.forEach(function (link) {
      link.classList.toggle("is-active", link.getAttribute("href") === "#" + id);
    });
  }

  if ("IntersectionObserver" in window) {
    const spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );

    sections.forEach(function (section) {
      spy.observe(section);
    });
  }

  /* ---------- Reveal on scroll ---------- */
  const reveals = Array.from(document.querySelectorAll(".reveal"));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduceMotion || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) {
      el.classList.add("is-visible");
    });
  } else {
    const revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );

    reveals.forEach(function (el) {
      revealObserver.observe(el);
    });
  }

  /* ---------- Copy email ---------- */
  const copyButton = document.querySelector("[data-copy]");

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }

    return new Promise(function (resolve, reject) {
      const field = document.createElement("textarea");
      field.value = text;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.top = "-1000px";
      field.style.opacity = "0";
      document.body.appendChild(field);
      field.select();

      let copied = false;
      try {
        copied = document.execCommand("copy");
      } catch (error) {
        copied = false;
      }
      field.remove();

      copied ? resolve() : reject(new Error("copy-failed"));
    });
  }

  if (copyButton) {
    copyButton.addEventListener("click", function () {
      const label = copyButton.querySelector("span");
      const email = copyButton.getAttribute("data-copy");

      copyText(email)
        .then(function () {
          copyButton.classList.add("is-done");
          label.textContent = "Adresse copiée ✓";
        })
        .catch(function () {
          label.textContent = "Copie impossible";
        })
        .then(function () {
          window.setTimeout(function () {
            copyButton.classList.remove("is-done");
            label.textContent = "Copier l’adresse";
          }, 2200);
        });
    });
  }

  /* ---------- Footer year ---------- */
  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
