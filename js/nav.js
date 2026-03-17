/* =============================================================
   nav.js
   Handles all navigation bar behaviour:
     1. Adds a scroll shadow when the page is scrolled
     2. Highlights the current page link as "active"
     3. Toggles the mobile hamburger menu open/closed
     4. Closes mobile menu when a link is clicked

   Include this script on every page via <script src="../js/nav.js">
   The HTML for the nav is in each page file. This JS just
   adds interactive behaviour on top of the static HTML.
   ============================================================= */

/* Wait for the DOM to finish loading before running any code */
document.addEventListener('DOMContentLoaded', function () {

  /* ── 1. Scroll shadow on nav ────────────────────────────────
     Listen for scroll events on the window. When the user
     has scrolled more than 20px, add the 'scrolled' class
     to the nav, which triggers a box-shadow in CSS.
  ────────────────────────────────────────────────────────── */
  const nav = document.querySelector('.site-nav');

  function handleNavScroll() {
    /* Check how far down the page the user has scrolled */
    if (window.scrollY > 20) {
      nav.classList.add('scrolled');     /* Triggers shadow in animations.css */
    } else {
      nav.classList.remove('scrolled'); /* Removes shadow at top of page */
    }
  }

  /* Attach the scroll listener and run it once immediately
     (in case the page loads mid-scroll, e.g. after refresh) */
  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll();   /* Run once on load */


  /* ── 2. Active page highlighting ────────────────────────────
     Compare the current page's filename to the href of each
     nav link. When they match, add the 'active' class so
     the link gets the sage-green highlight from components.css.
  ────────────────────────────────────────────────────────── */

  /* Get the current page filename, e.g. "experience.html" */
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  /* Loop through every nav link and check if it matches */
  const navLinks = document.querySelectorAll('.nav-links a, .mobile-menu a');
  navLinks.forEach(function (link) {
    const linkPage = link.getAttribute('href').split('/').pop();

    if (linkPage === currentPage) {
      link.classList.add('active');   /* Highlight the matching link */
    }
  });


  /* ── 3. Mobile hamburger menu toggle ─────────────────────────
     Clicking the hamburger button toggles the full-screen
     mobile menu overlay open and closed. The burger icon
     also animates into an × via CSS (see components.css).
  ────────────────────────────────────────────────────────── */
  const hamburger = document.querySelector('.nav-hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');

  if (hamburger && mobileMenu) {

    hamburger.addEventListener('click', function () {
      /* Toggle the 'open' class on both elements */
      hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open');

      /* Update ARIA attribute for screen readers */
      const isOpen = mobileMenu.classList.contains('open');
      hamburger.setAttribute('aria-expanded', isOpen);

      /* Prevent the body from scrolling while menu is open */
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
  }


  /* ── 4. Close menu when a link is clicked ────────────────────
     If the user taps a link inside the mobile menu, close
     the menu so they see the new page content immediately.
  ────────────────────────────────────────────────────────── */
  const mobileLinks = document.querySelectorAll('.mobile-menu a');
  mobileLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      /* Remove 'open' class from both hamburger and menu */
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');

      /* Restore body scrolling */
      document.body.style.overflow = '';
    });
  });

});
