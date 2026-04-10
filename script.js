'use strict';

const topbar = document.querySelector('.topbar');
const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
const navLinks = Array.from(document.querySelectorAll('.nav a'));
const revealBlocks = document.querySelectorAll('.reveal');
const sections = Array.from(document.querySelectorAll('main section[id]'));
const suiteTabs = Array.from(document.querySelectorAll('.suite-tab'));
const suitePanels = Array.from(document.querySelectorAll('.suite-panel'));
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const allowedSuites = new Set(['health', 'risk', 'stay', 'legal', 'ops']);

const setTopbarState = () => {
  if (!topbar) return;
  topbar.classList.toggle('scrolled', window.scrollY > 18);
};

const closeMobileMenu = () => {
  if (!menuToggle || !nav) return;
  nav.classList.remove('is-open');
  menuToggle.setAttribute('aria-expanded', 'false');
};

const activateSuite = (suiteId) => {
  if (!allowedSuites.has(suiteId)) return;

  suiteTabs.forEach((tab) => {
    const isActive = tab.dataset.suite === suiteId;
    tab.classList.toggle('active', isActive);
    tab.setAttribute('aria-selected', String(isActive));
    tab.tabIndex = isActive ? 0 : -1;
  });

  suitePanels.forEach((panel) => {
    const isActive = panel.dataset.panel === suiteId;
    panel.hidden = !isActive;
    panel.classList.toggle('active', isActive);
  });
};

if (menuToggle && nav) {
  menuToggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });

  navLinks.forEach((link) => {
    link.addEventListener('click', closeMobileMenu);
  });
}

setTopbarState();
window.addEventListener('scroll', setTopbarState, { passive: true });

if (!prefersReducedMotion && 'IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.14 }
  );

  revealBlocks.forEach((block) => revealObserver.observe(block));
} else {
  revealBlocks.forEach((block) => block.classList.add('revealed'));
}

if ('IntersectionObserver' in window && sections.length > 0) {
  const navObserver = new IntersectionObserver(
    (entries) => {
      const current = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!current) return;

      const activeId = current.target.getAttribute('id');
      navLinks.forEach((link) => {
        const href = link.getAttribute('href') || '';
        link.classList.toggle('active', href === `#${activeId}`);
      });
    },
    {
      threshold: [0.3, 0.55, 0.75],
      rootMargin: '-18% 0px -48% 0px'
    }
  );

  sections.forEach((section) => navObserver.observe(section));
}

suiteTabs.forEach((tab, index) => {
  tab.addEventListener('click', () => {
    const suiteId = tab.dataset.suite;
    if (suiteId) activateSuite(suiteId);
  });

  tab.addEventListener('keydown', (event) => {
    if (!['ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft'].includes(event.key)) return;

    event.preventDefault();
    const direction = event.key === 'ArrowDown' || event.key === 'ArrowRight' ? 1 : -1;
    const nextIndex = (index + direction + suiteTabs.length) % suiteTabs.length;
    const nextTab = suiteTabs[nextIndex];
    const suiteId = nextTab.dataset.suite;

    nextTab.focus();
    if (suiteId) activateSuite(suiteId);
  });
});

const defaultSuite = suiteTabs.find((tab) => tab.classList.contains('active'))?.dataset.suite;
if (defaultSuite) {
  activateSuite(defaultSuite);
}
