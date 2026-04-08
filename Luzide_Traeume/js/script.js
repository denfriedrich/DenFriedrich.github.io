(() => {
  "use strict";

  // =========================
  // 0) SCROLLER + HELPERS
  // =========================
  const pageScroller = document.querySelector(".page");

  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

  const getScrollTop = () => (pageScroller ? pageScroller.scrollTop : window.scrollY);
  const getVH = () => (pageScroller ? pageScroller.clientHeight : window.innerHeight);
  const getVW = () => (pageScroller ? pageScroller.clientWidth : window.innerWidth);

  const onScrollerScroll = (fn) => {
    (pageScroller || window).addEventListener("scroll", fn, { passive: true });
  };

  // Element-Position relativ zum Scroller-Scroll (nicht window)
  const scrollerCenterY = (el) => {
    const r = el.getBoundingClientRect();
    if (!pageScroller) return window.scrollY + r.top + r.height / 2;
    const sr = pageScroller.getBoundingClientRect();
    return pageScroller.scrollTop + (r.top - sr.top) + r.height / 2;
  };

  // =========================
  // 1) NAV (Burger)
  // =========================
  const nav = document.querySelector(".nav");
  const toggle = document.querySelector(".nav__toggle");
  const navLinks = document.querySelectorAll(".nav__links a");

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });

    navLinks.forEach((a) => {
      a.addEventListener("click", () => {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // =================================
  // 1b) NAV Active Link (Scroll Spy)
  // =================================
  (() => {
  const scroller = document.querySelector(".page");
  const links = Array.from(document.querySelectorAll(".nav__links a[href^='#']"));
  if (!links.length) return;

  const navH =
    parseInt(getComputedStyle(document.documentElement).getPropertyValue("--nav-h")) || 72;

  const targets = links
    .map(a => {
      const id = a.getAttribute("href").slice(1);
      const el = document.getElementById(id);
      return el ? { id, el, a } : null;
    })
    .filter(Boolean);

  const setActive = (id) => {
    links.forEach(a =>
      a.classList.toggle("is-active", a.getAttribute("href") === `#${id}`)
    );
  };

  const getScrollTop = () => (scroller ? scroller.scrollTop : window.scrollY);
  const getVH = () => (scroller ? scroller.clientHeight : window.innerHeight);

  function update() {
    const focusY = getScrollTop() + navH + getVH() * 0.25;

    // letzter Abschnitt, dessen Oberkante oberhalb des Focus liegt
    let current = targets[0]?.id;
    for (const t of targets) {
      if (t.el.offsetTop <= focusY) current = t.id;
    }
    if (current) setActive(current);
  }

  // Klick sofort aktiv
  links.forEach(a => {
    a.addEventListener("click", () => setActive(a.getAttribute("href").slice(1)));
  });

  let raf = 0;
  (scroller || window).addEventListener("scroll", () => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      update();
      raf = 0;
    });
  }, { passive: true });

  window.addEventListener("resize", update);
  window.addEventListener("load", update);

  update();
})();


  // =========================
  // 2) VORTEILE: Horizontal Pin (Desktop) + Swipe (Mobile)
  // =========================
  const pin = document.querySelector(".hscroll-pin");
  const track = document.querySelector(".hscroll-track");
  const sticky = document.querySelector(".hscroll-sticky");

  const isDesktop = () => window.matchMedia("(min-width: 901px)").matches;
  const isSwipeMode = () => window.matchMedia("(max-width: 900px)").matches;

  function updateAutoHScroll() {
    if (!pin || !track) return;

    // Mobile: Track nicht per transform bewegen (nur Swipe)
    if (!isDesktop()) {
      track.style.transform = "translate3d(0,0,0)";
      return;
    }

    const pinTop = pin.offsetTop;
    const pinHeight = pin.offsetHeight;
    const denom = pinHeight - getVH();
    if (denom <= 0) return;

    const progress = clamp((getScrollTop() - pinTop) / denom, 0, 1);

    const viewport = sticky ? sticky.clientWidth : getVW();
    const maxTranslate = Math.max(0, track.scrollWidth - viewport);

    const x = -progress * maxTranslate;
    track.style.transform = `translate3d(${clamp(x, -maxTranslate, 0)}px, 0, 0)`;
  }

  // Dots nur im Swipe-Modus
  function setupDots() {
    if (!track) return;

    const dotsWrap = document.querySelector(".hscroll-dots");
    const dots = dotsWrap ? Array.from(dotsWrap.querySelectorAll(".dot")) : [];
    const cards = Array.from(track.querySelectorAll(".card"));
    if (!dots.length || !cards.length) return;

    const setActiveDot = (i) => {
      dots.forEach((d, idx) => d.classList.toggle("is-active", idx === i));
    };

    const activeIndexFromScroll = () => {
      const center = track.scrollLeft + track.clientWidth / 2;
      let best = 0;
      let bestDist = Infinity;

      for (let i = 0; i < cards.length; i++) {
        const cCenter = cards[i].offsetLeft + cards[i].clientWidth / 2;
        const dist = Math.abs(cCenter - center);
        if (dist < bestDist) {
          bestDist = dist;
          best = i;
        }
      }
      return best;
    };

    const scrollToCard = (i) => {
      track.scrollTo({ left: cards[i].offsetLeft, behavior: "smooth" });
      setActiveDot(i);
    };

    dots.forEach((dot, i) => {
      dot.addEventListener("click", () => {
        if (!isSwipeMode()) return;
        scrollToCard(i);
      });
    });

    let raf = 0;
    track.addEventListener(
      "scroll",
      () => {
        if (!isSwipeMode()) return;
        if (raf) return;
        raf = requestAnimationFrame(() => {
          setActiveDot(activeIndexFromScroll());
          raf = 0;
        });
      },
      { passive: true }
    );

    // init
    const syncDots = () => {
      if (!isSwipeMode()) return;
      setActiveDot(activeIndexFromScroll());
    };
    syncDots();
    window.addEventListener("resize", syncDots);
  }

  setupDots();

  onScrollerScroll(updateAutoHScroll);
  window.addEventListener("resize", updateAutoHScroll);
  window.addEventListener("load", updateAutoHScroll);
  updateAutoHScroll();

  // =========================
  // 3) HERO Parallax (Wolken)
  // =========================
  const hero = document.getElementById("top");
  const cloudL = document.querySelector(".layer--cloudL");
  const cloudR = document.querySelector(".layer--cloudR");
  const cloudB = document.querySelector(".layer--cloudBottom");
  const bg = document.querySelector(".hero__bg");

  let latestScrollY = 0;
  let heroTicking = false;

  function resetClouds() {
  if (cloudL) cloudL.style.transform = "translate3d(0,0,0)";
  if (cloudR) cloudR.style.transform = "translate3d(0,0,0)";

  // Bottom-Cloud: Default je nach Breakpoint
  if (cloudB) {
    const showBottom = window.innerWidth > 1206;
    cloudB.style.transform = "translate3d(-50%, 0, 0)";
    cloudB.style.opacity = showBottom ? "1" : "0";
    cloudB.style.display = showBottom ? "block" : "none";
  }
}

function updateHero() {
  if (!hero || !bg) return;

  const w = window.innerWidth;

  const bgParallax = w > 700;
  const sideClouds = w >= 901 || w <= 700;
  const bottomCloud = w > 1206;

  // Mobile/Tablet: Bottom-Cloud IMMER aus
  if (cloudB && !bottomCloud) {
    cloudB.style.opacity = "0";
    cloudB.style.display = "none";
  }

  if (!sideClouds && !bottomCloud) {
    if (!bgParallax) bg.style.transform = "translate3d(0,0,0)";
    resetClouds();
    return;
  }

  const heroTop = hero.offsetTop;
  const heroH = hero.offsetHeight;

  const y = latestScrollY - heroTop;
  const t = clamp(y / heroH, 0, 1);

  bg.style.transform = "translate3d(0,0,0)";

  if (sideClouds) {
    const fly = t * 140;
    if (cloudL) cloudL.style.transform = `translate3d(${-fly}px, ${t * 10}px, 0)`;
    if (cloudR) cloudR.style.transform = `translate3d(${fly}px, ${t * 10}px, 0)`;
  } else {
    if (cloudL) cloudL.style.transform = "translate3d(0,0,0)";
    if (cloudR) cloudR.style.transform = "translate3d(0,0,0)";
  }

  // Desktop: Bottom-Cloud animieren
  if (bottomCloud && cloudB) {
    const down = t * 160;
    const o = 1 - t * 1.6;

    cloudB.style.display = "block";
    cloudB.style.transform = `translate3d(-50%, ${down}px, 0)`;
    cloudB.style.opacity = `${o}`;

    if (o <= 0) {
      cloudB.style.opacity = "0";
      cloudB.style.display = "none";
    }
  }
}
  function heroOnScroll() {
    latestScrollY = getScrollTop();

    if (heroTicking) return;
    heroTicking = true;

    requestAnimationFrame(() => {
      updateHero();
      updateAutoHScroll();
      heroTicking = false;
    });
  }

  onScrollerScroll(heroOnScroll);
  window.addEventListener("resize", () => {
    latestScrollY = getScrollTop();
    updateHero();
    updateAutoHScroll();
  });

  latestScrollY = getScrollTop();
  updateHero();



  // ================================
  // 4) KLARHEITSPUNKT: Storytelling (Vogel + Active Text)
  // ================================
  (() => {
    const steps = Array.from(document.querySelectorAll(".einfliegtext"));
    const anim = document.getElementById("anim");
    const startEl = document.querySelector('.einfliegtext[data-anim="1"]');
    const endEl = document.querySelector('.einfliegtext[data-anim="2"]');

    if (!steps.length) return;

    const clamp01 = (v) => Math.max(0, Math.min(1, v));
    const lerp = (a, b, t) => a + (b - a) * t;

    function setActive(el) {
      steps.forEach((s) => s.classList.toggle("is-active", s === el));
    }

    function updateBirdByScroll() {
      if (!anim || !startEl || !endEl) return;

      const focusY = getScrollTop() + getVH() * 0.5;
      const startY = scrollerCenterY(startEl);
      const endY = scrollerCenterY(endEl);

      const tRaw = (focusY - startY) / (endY - startY);
      const t = clamp01(tRaw);

      anim.classList.toggle("is-visible", tRaw >= 0);

      const startX = 0.40 * getVW();
      const startYoff = 0.30 * getVH();

      const endX = -0.28 * getVW();
      const endYoff = -0.22 * getVH();

      const x = lerp(startX, endX, t);
      const y = lerp(startYoff, endYoff, t);

      anim.style.setProperty("--tx", `${x}px`);
      anim.style.setProperty("--ty", `${y}px`);
    }

    // Active text: IntersectionObserver
    const io = new IntersectionObserver(
      (entries) => {
        const best = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (best) setActive(best.target);
      },
      {
        root: pageScroller || null,
        threshold: [0.25, 0.4, 0.6, 0.8],
        rootMargin: "-20% 0px -35% 0px",
      }
    );

    steps.forEach((s) => io.observe(s));

    let raf = 0;
    function onS() {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        updateBirdByScroll();
        raf = 0;
      });
    }

    onScrollerScroll(onS);
    window.addEventListener("resize", updateBirdByScroll);

    setActive(steps[0]);
    updateBirdByScroll();

    // Video autoplay + fallback
    const bgVideo = document.getElementById("bgVideo");
    if (bgVideo) {
      const tryPlay = () =>
        bgVideo.play().catch(() => document.documentElement.classList.add("no-video"));

      bgVideo.addEventListener("error", () => document.documentElement.classList.add("no-video"));
      bgVideo.addEventListener("canplay", tryPlay, { once: true });
      tryPlay();

      bgVideo.playbackRate = 0.5;
    }
  })();


  // =====================================
  // 5) TECHNIKEN: Hotspots
  // =====================================
  (function(){
    const center = document.getElementById("techCenter");
    if(!center) return;

    const dots = Array.from(document.querySelectorAll(".tech-dot"));

    function setActive(btn){
        dots.forEach(d => d.classList.remove("is-active"));
        btn.classList.add("is-active");

        const title = btn.dataset.title || "Technik";
        const text  = btn.dataset.text  || "";

        center.innerHTML = `
          <h3 class="tech-wheel__title">${title}</h3>
          <p class="tech-wheel__text">${text}</p>
        `;
      }

    // Welcher Punkt standardmäßig aktiv ist, wenn keiner ausgewählt
    if(dots[1]) setActive(dots[1]);

    dots.forEach(btn => {
      btn.addEventListener("mouseenter", () => setActive(btn));  // Desktop
      btn.addEventListener("focus", () => setActive(btn));       // Keyboard
      btn.addEventListener("click", () => setActive(btn));       // Touch/Click
    });
  })();



  // =====================================
  // 6) RISIKEN + ERWACHEN Video Fallback
  // =====================================

  // Risiken-Sektion
  (() => {
    const wrap = document.querySelector("#risiken .image-panel__bgwrap");
    if (!wrap) return;

    const video = wrap.querySelector(".image-panel__video");
    if (!video) return;

    const setReady = () => wrap.classList.add("is-ready");
    const setFail = () => {
      wrap.classList.remove("is-ready");
      try {
        video.pause();
      } catch (e) {}
    };

    video.addEventListener("canplaythrough", setReady, { once: true });
    video.addEventListener("playing", setReady, { once: true });
    video.addEventListener("error", setFail);

    video
      .play()
      .then(setReady)
      .catch(setFail);
  })();


  // Erwachen-Sektion
  (() => {
    const wrap = document.querySelector("#erwachen .image-panel__bgwrap_erwachen");
    if (!wrap) return;

    const video = wrap.querySelector(".image-panel__video");
    if (!video) return;

    const setReady = () => wrap.classList.add("is-ready");
    const setFail  = () => wrap.classList.remove("is-ready");

    video.defaultPlaybackRate = 0.4;
    video.playbackRate = 0.4;

    video.addEventListener("loadedmetadata", () => {
      video.playbackRate = 0.4;
    });

    video.addEventListener("canplay", setReady, { once: true });
    video.addEventListener("playing", setReady, { once: true });
    video.addEventListener("error", setFail);

    // iOS / Safari Kickstart
    video.play().then(setReady).catch(setFail);
  })();

})();