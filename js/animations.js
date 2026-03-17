/* =============================================================
   animations.js
   Two animation systems used across the site:

   1. Scroll Reveal — uses IntersectionObserver to watch for
      elements with the class .reveal. When they scroll into
      the viewport, the .visible class is added, triggering
      the CSS transition defined in components.css.

   2. Stat Counters — when the hero stats section scrolls
      into view, each number counts up from 0 to its target
      value using a smooth easing function. This is only used
      on the homepage (index.html).

   Include this script on every page.
   ============================================================= */

document.addEventListener('DOMContentLoaded', function () {


  /* ══════════════════════════════════════════════════════════
     SCROLL REVEAL SYSTEM
     ════════════════════════════════════════════════════════ */

  /* ── Find all elements that should animate in ───────────────
     Any element in the HTML that has class="reveal" will be
     observed. When it scrolls within 15% of the viewport
     bottom, the .visible class is added, playing the CSS
     fade-up transition from components.css.
  ────────────────────────────────────────────────────────── */
  const revealElements = document.querySelectorAll('.reveal');

  /* Only set up the observer if there are elements to watch */
  if (revealElements.length > 0) {

    /* Create an IntersectionObserver with a 15% visibility threshold.
       This means the animation triggers when 15% of the element
       has entered the viewport — early enough to feel natural,
       late enough that the user can see the animation. */
    const revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            /* Element is in view — add .visible to trigger CSS transition */
            entry.target.classList.add('visible');

            /* Once revealed, stop observing this element.
               There's no need to hide-and-show it again. */
            revealObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15,        /* Trigger when 15% of element is visible */
        rootMargin: '0px 0px -40px 0px'  /* Slight offset from viewport bottom */
      }
    );

    /* Tell the observer to watch each .reveal element */
    revealElements.forEach(function (el) {
      revealObserver.observe(el);
    });
  }


  /* ══════════════════════════════════════════════════════════
     STAT COUNTER ANIMATION (homepage only)
     ════════════════════════════════════════════════════════ */

  /* ── Find all stat numbers on the page ──────────────────────
     Each .stat-num element must have a data-target attribute
     set in the HTML with the final number to count to.
     Example: <div class="stat-num" data-target="2">2+</div>
  ────────────────────────────────────────────────────────── */
  const statNums = document.querySelectorAll('.stat-num[data-target]');

  if (statNums.length > 0) {

    /* ── Easing function ──────────────────────────────────────
       easeOutQuart gives a fast start that slows to a stop,
       which feels satisfying for counting animations.
       t = progress from 0 (start) to 1 (end)
    ────────────────────────────────────────────────────────── */
    function easeOutQuart(t) {
      return 1 - Math.pow(1 - t, 4);
    }

    /* ── Count up animation function ─────────────────────────
       Animates a single element from 0 to its data-target
       value over a fixed duration (1200ms).
       Appends a "+" suffix if the original text contained one.
    ────────────────────────────────────────────────────────── */
    function countUp(element) {
      const target = parseFloat(element.getAttribute('data-target'));
      const suffix = element.getAttribute('data-suffix') || '';  /* e.g. "+" */
      const decimals = element.getAttribute('data-decimals') || 0; /* e.g. "1" for 3.3 */
      const duration = 1200;   /* Total animation time in milliseconds */
      const startTime = performance.now();

      element.classList.add('counting');   /* Slightly dims element while counting */

      /* requestAnimationFrame loop — runs each browser paint cycle */
      function animate(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);   /* Clamp 0–1 */
        const eased = easeOutQuart(progress);

        /* Calculate the current displayed number */
        const current = target * eased;

        /* Update the element text with the formatted number + suffix */
        element.textContent = parseFloat(current.toFixed(decimals)) + suffix;

        if (progress < 1) {
          /* Not finished yet — request the next animation frame */
          requestAnimationFrame(animate);
        } else {
          /* Animation complete — show the exact final value */
          element.textContent = target + suffix;
          element.classList.remove('counting');
        }
      }

      requestAnimationFrame(animate);
    }

    /* ── Observe the stats strip ──────────────────────────────
       Only start counting when the stats are actually visible.
       This ensures the animation is seen, not missed off-screen.
    ────────────────────────────────────────────────────────── */
    const statsObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            /* Start the count-up on each stat in the visible strip */
            entry.target.querySelectorAll('.stat-num[data-target]')
              .forEach(function (num) {
                countUp(num);
              });

            /* Only count up once */
            statsObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }   /* Trigger when stats strip is 50% visible */
    );

    /* Find the stats strip container and observe it */
    const statsStrip = document.querySelector('.stats-strip');
    if (statsStrip) {
      statsObserver.observe(statsStrip);
    }
  }

});
