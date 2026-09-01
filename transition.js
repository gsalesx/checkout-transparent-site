const transitionSection = document.querySelector(".hero-section");
const transitionStage = document.querySelector(".hero-stage");
const transitionDevice = document.querySelector(".hero-device");

if (transitionSection && transitionStage && transitionDevice) {
  const clamp = (value, min = 0, max = 1) => Math.min(Math.max(value, min), max);
  const clampPx = (min, value, max) => Math.min(Math.max(value, min), max);
  const smoothstep = (edge0, edge1, value) => {
    const t = clamp((value - edge0) / (edge1 - edge0));
    return t * t * (3 - 2 * t);
  };

  const setPhoneGeometry = (phoneProgress) => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const isMobile = viewportWidth <= 980;
    if (isMobile) {
      const phoneWidth = clampPx(250, viewportWidth * 0.68, 306);
      const visiblePhoneHeight = clampPx(214, viewportWidth * 0.6, 258);
      const metricsHeight = 168;

      transitionDevice.style.setProperty("--phone-width", `${phoneWidth.toFixed(2)}px`);
      transitionDevice.style.setProperty(
        "--phone-visible-height",
        `${visiblePhoneHeight.toFixed(2)}px`,
      );
      transitionDevice.style.setProperty("--phone-preview-bottom", `${metricsHeight - 16}px`);
      transitionDevice.style.setProperty("--device-bottom", "12px");
      return;
    }

    const startWidth = clampPx(292, viewportWidth * 0.204, 360);
    const metricsHeight = 126;
    const baseBottom = 18;
    const phoneWidth = startWidth;
    const fullPhoneHeight = phoneWidth * 1.984;
    const startVisibleHeight = clampPx(236, viewportWidth * 0.176, 286);
    const visiblePhoneHeight = startVisibleHeight + (fullPhoneHeight - startVisibleHeight) * phoneProgress;
    const previewBottom = (metricsHeight - 1) * (1 - phoneProgress);
    const secondSceneBottom = Math.max(24, (viewportHeight - fullPhoneHeight) / 2 - 36);
    const deviceBottom = baseBottom + (secondSceneBottom - baseBottom) * phoneProgress;

    transitionDevice.style.setProperty("--phone-width", `${phoneWidth.toFixed(2)}px`);
    transitionDevice.style.setProperty(
      "--phone-visible-height",
      `${visiblePhoneHeight.toFixed(2)}px`,
    );
    transitionDevice.style.setProperty("--phone-preview-bottom", `${previewBottom.toFixed(2)}px`);
    transitionDevice.style.setProperty("--device-bottom", `${deviceBottom.toFixed(2)}px`);
  };

  let frameId = 0;

  const updateTransition = () => {
    frameId = 0;

    const rect = transitionSection.getBoundingClientRect();
    const travel = Math.max(1, transitionSection.offsetHeight - window.innerHeight);
    const isMobile = window.innerWidth <= 980;
    if (isMobile) {
      transitionStage.style.setProperty("--hero-exit", "0");
      transitionStage.style.setProperty("--phone-progress", "0");
      transitionStage.style.setProperty("--benefits-in", "1");
      transitionStage.style.setProperty("--benefit-one", "1");
      transitionStage.style.setProperty("--benefit-two", "1");
      transitionStage.style.setProperty("--benefit-three", "1");
      transitionStage.style.setProperty("--screen-two-progress", "0");
      setPhoneGeometry(0);
      return;
    }

    const progress = clamp(-rect.top / travel);
    const heroExit = smoothstep(0.04, 0.24, progress);
    const phoneProgress = smoothstep(0.12, 0.48, progress);
    const screenTwoProgress = smoothstep(0.5, 0.72, progress);
    const benefitsIn = smoothstep(0.52, 0.78, progress);
    const benefitOne = smoothstep(0.56, 0.76, progress);
    const benefitTwo = smoothstep(0.66, 0.84, progress);
    const benefitThree = smoothstep(0.74, 0.92, progress);

    transitionStage.style.setProperty("--hero-exit", heroExit.toFixed(4));
    transitionStage.style.setProperty("--phone-progress", phoneProgress.toFixed(4));
    transitionStage.style.setProperty("--benefits-in", benefitsIn.toFixed(4));
    transitionStage.style.setProperty("--benefit-one", benefitOne.toFixed(4));
    transitionStage.style.setProperty("--benefit-two", benefitTwo.toFixed(4));
    transitionStage.style.setProperty("--benefit-three", benefitThree.toFixed(4));
    transitionStage.style.setProperty("--screen-two-progress", screenTwoProgress.toFixed(4));
    setPhoneGeometry(phoneProgress);
  };

  const requestUpdate = () => {
    if (frameId) return;
    frameId = window.requestAnimationFrame(updateTransition);
  };

  updateTransition();
  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
}

const featureShowcase = document.querySelector("[data-feature-showcase]");

if (featureShowcase) {
  const featureSection = featureShowcase.closest(".feature-section");
  const featureTrack = featureShowcase.closest("[data-feature-track]") || featureSection;
  const tabs = [...featureShowcase.querySelectorAll("[data-feature-tab]")];
  const cards = [...featureShowcase.querySelectorAll("[data-feature-card]")];
  let activeIndex = 0;
  let animationFrame = 0;

  const clampFeature = (value, min = 0, max = 1) => Math.min(Math.max(value, min), max);
  const smoothFeature = (edge0, edge1, value) => {
    const t = clampFeature((value - edge0) / (edge1 - edge0));
    return t * t * (3 - 2 * t);
  };
  const isFeatureMobile = () => window.matchMedia("(max-width: 980px)").matches;

  const setActiveFeature = (nextIndex) => {
    if (!tabs.length) return;

    activeIndex = (nextIndex + tabs.length) % tabs.length;

    tabs.forEach((tab, index) => {
      const isActive = index === activeIndex;
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-selected", String(isActive));
    });

    cards.forEach((card, index) => {
      card.classList.toggle("is-active", index === activeIndex);
    });
  };

  const getFeatureScrollGeometry = () => {
    const scrollTrack = featureTrack || featureSection;

    if (!scrollTrack) {
      return { progress: 0, pinStart: window.scrollY, travel: 1 };
    }

    const stickyTop = Number.parseFloat(window.getComputedStyle(featureShowcase).top) || 0;
    const trackTop = scrollTrack.getBoundingClientRect().top + window.scrollY;
    const pinStart = trackTop - stickyTop;
    const travel = Math.max(1, scrollTrack.offsetHeight - window.innerHeight + stickyTop);

    return { progress: clampFeature((window.scrollY - pinStart) / travel), pinStart, travel };
  };

  const updateDesktopFeatureScroll = () => {
    featureSection.style.setProperty("--feature-card-two", "1");
    featureSection.style.setProperty("--feature-card-three", "1");

    const viewportAnchor = window.innerHeight * 0.48;
    const progressStart = window.innerHeight * 0.78;
    const progressEnd = window.innerHeight * 0.32;
    let closestIndex = activeIndex;
    let closestDistance = Number.POSITIVE_INFINITY;
    const tabProgresses = [];

    cards.forEach((card, index) => {
      const rect = card.getBoundingClientRect();
      const isVisible = rect.bottom > 0 && rect.top < window.innerHeight;
      const center = rect.top + rect.height * 0.5;
      const distance = isVisible ? Math.abs(center - viewportAnchor) : Number.POSITIVE_INFINITY;

      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }

      card.classList.add("is-in-view");
      card.classList.remove("is-after", "is-before");

      const tabProgress = smoothFeature(
        0,
        1,
        (progressStart - rect.top) / Math.max(progressStart - progressEnd, 1),
      );

      tabProgresses[index] = tabProgress;
      tabs[index]?.style.setProperty("--tab-progress", tabProgress.toFixed(4));
    });

    tabs.forEach((tab, index) => {
      tab.classList.toggle("is-complete", index < closestIndex || tabProgresses[index] >= 0.995);
    });

    if (closestIndex !== activeIndex) {
      setActiveFeature(closestIndex);
    }
  };

  const updateMobileFeatureScroll = () => {
    const { progress } = getFeatureScrollGeometry();
    const secondCard = smoothFeature(0.18, 0.48, progress);
    const thirdCard = smoothFeature(0.58, 0.88, progress);
    const stepProgresses = [clampFeature(progress / 0.18), secondCard, thirdCard];
    const closestIndex = progress < 0.5 ? 0 : progress < 0.82 ? 1 : 2;

    featureSection.style.setProperty("--feature-card-two", secondCard.toFixed(4));
    featureSection.style.setProperty("--feature-card-three", thirdCard.toFixed(4));

    tabs.forEach((tab, index) => {
      tab.style.setProperty("--tab-progress", stepProgresses[index].toFixed(4));
      tab.classList.toggle("is-complete", index < closestIndex || stepProgresses[index] >= 0.995);
    });

    cards.forEach((card, index) => {
      card.classList.toggle("is-in-view", index <= closestIndex);
      card.classList.toggle("is-after", index > closestIndex);
      card.classList.toggle("is-before", index < closestIndex);
    });

    if (closestIndex !== activeIndex) {
      setActiveFeature(closestIndex);
    }
  };

  const updateFeatureScroll = () => {
    animationFrame = 0;

    if (!featureSection || !tabs.length || !cards.length) return;

    if (isFeatureMobile()) {
      updateMobileFeatureScroll();
      return;
    }

    updateDesktopFeatureScroll();
  };

  const requestFeatureUpdate = () => {
    if (!animationFrame) {
      animationFrame = requestAnimationFrame(updateFeatureScroll);
    }
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => {
      setActiveFeature(index);

      if (!isFeatureMobile()) {
        const targetCard = cards[index];
        if (!targetCard) return;

        const targetTop = window.scrollY + targetCard.getBoundingClientRect().top - window.innerHeight * 0.16;
        window.scrollTo({ top: targetTop, behavior: "smooth" });
        return;
      }

      const targetProgress = index === 0 ? 0 : index === 1 ? 0.5 : 0.84;
      const { pinStart, travel } = getFeatureScrollGeometry();
      const top = pinStart + travel * targetProgress;
      window.scrollTo({ top, behavior: "smooth" });
    });
  });

  setActiveFeature(0);
  updateFeatureScroll();
  window.addEventListener("scroll", requestFeatureUpdate, { passive: true });
  window.addEventListener("resize", requestFeatureUpdate);
}

const controlShowcase = document.querySelector("[data-control-showcase]");

if (controlShowcase) {
  const controlCards = [...controlShowcase.querySelectorAll("[data-control-card]")];
  const controlSteps = [...controlShowcase.querySelectorAll(".control-steps span")];
  const clampControl = (value, min = 0, max = 1) => Math.min(Math.max(value, min), max);
  let controlFrame = 0;

  const updateControlShowcase = () => {
    controlFrame = 0;

    const isCompact = window.matchMedia("(max-width: 980px)").matches;
    const rect = controlShowcase.getBoundingClientRect();
    const travel = Math.max(1, controlShowcase.offsetHeight - window.innerHeight);
    const progress = clampControl(-rect.top / travel);
    const introProgress = isCompact ? 0 : clampControl(progress / 0.34);
    const cardProgress = isCompact ? 0 : clampControl((progress - 0.3) / 0.66);
    const segment = controlCards.length > 1 ? 1 / (controlCards.length - 1) : 1;
    const activeIndex = Math.min(controlCards.length - 1, Math.round(cardProgress / segment));

    controlShowcase.style.setProperty("--control-progress", cardProgress.toFixed(4));
    controlShowcase.style.setProperty("--control-header-shift", `${(-315 * introProgress).toFixed(2)}px`);
    controlShowcase.style.setProperty("--control-track-shift", `${(-235 * introProgress).toFixed(2)}px`);
    controlShowcase.style.setProperty("--control-card-shift", `${(-235 * introProgress).toFixed(2)}px`);

    controlSteps.forEach((step, index) => {
      step.classList.toggle("is-active", index === activeIndex);
      step.classList.toggle("is-complete", index < activeIndex);
    });

    controlCards.forEach((card, index) => {
      const incoming = index === 0 ? 1 : clampControl((cardProgress - (index - 1) * segment) / segment);
      const y = isCompact || index === 0 ? 0 : (1 - incoming) * 112;

      card.style.setProperty("--card-x", "0px");
      card.style.setProperty("--card-y", isCompact ? "0px" : `${y.toFixed(2)}%`);
      card.style.setProperty("--card-scale", "1");
      card.style.setProperty("--card-opacity", "1");
      card.style.setProperty("--card-z", String(10 + index));
      card.classList.toggle("is-active", index === activeIndex);
    });
  };

  const requestControlUpdate = () => {
    if (!controlFrame) {
      controlFrame = requestAnimationFrame(updateControlShowcase);
    }
  };

  updateControlShowcase();
  window.addEventListener("scroll", requestControlUpdate, { passive: true });
  window.addEventListener("resize", requestControlUpdate);
}

const pricingSection = document.querySelector(".pricing-section");

if (pricingSection) {
  const billingButtons = [...pricingSection.querySelectorAll("[data-billing]")];
  const prices = [...pricingSection.querySelectorAll(".pricing-price strong")];

  const setBilling = (billing) => {
    billingButtons.forEach((button) => {
      button.classList.toggle("is-active", button.dataset.billing === billing);
    });

    prices.forEach((price) => {
      const nextValue = price.dataset[billing];
      if (!nextValue || price.textContent === nextValue) return;

      price.classList.add("is-changing");
      window.setTimeout(() => {
        price.textContent = nextValue;
        price.classList.remove("is-changing");
      }, 160);
    });
  };

  billingButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setBilling(button.dataset.billing);
    });
  });

  const pricingObserver = new IntersectionObserver(
    ([entry]) => {
      pricingSection.classList.toggle("is-visible", entry.isIntersecting);
    },
    { threshold: 0.32 },
  );

  pricingObserver.observe(pricingSection);
}

const faqRoot = document.querySelector("[data-faq]");

if (faqRoot) {
  const faqItems = [...faqRoot.querySelectorAll(".faq-item")];

  const setOpenFaq = (nextItem) => {
    const shouldCloseAll = nextItem?.classList.contains("is-open");

    faqItems.forEach((item) => {
      const isOpen = !shouldCloseAll && item === nextItem;
      const button = item.querySelector(".faq-question");

      item.classList.toggle("is-open", isOpen);
      button?.setAttribute("aria-expanded", String(isOpen));
    });
  };

  faqItems.forEach((item) => {
    const button = item.querySelector(".faq-question");

    button?.addEventListener("click", () => {
      setOpenFaq(item);
    });
  });
}
