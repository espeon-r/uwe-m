/* =============================================================
   form.js  — Contact form for contact.html
   -------------------------------------------------------------
   Uses EmailJS (https://emailjs.com) to send form submissions
   directly from the browser — no backend, no third-party
   form service, no redirect. EmailJS connects to Uwe's own
   Gmail account and sends email through it directly.

   ── ONE-TIME SETUP (takes about 5 minutes) ──────────────────

   Step 1 — Create a free EmailJS account
     Go to https://emailjs.com and sign up (free tier = 200
     emails/month, which is plenty for a personal site).

   Step 2 — Connect Gmail
     Dashboard → Email Services → Add New Service
     Choose Gmail → connect uwemunyantwali@gmail.com
     EmailJS will ask you to authorise via Google OAuth.
     Note the SERVICE ID it gives you (e.g. "service_abc123")

   Step 3 — Create an email template
     Dashboard → Email Templates → Create New Template
     Set it up like this:

       To email:   uwemunyantwali@gmail.com
       From name:  {{from_name}}
       Subject:    New message from {{from_name}} — {{subject}}
       Body:
         Name:    {{from_name}}
         Email:   {{from_email}}
         Subject: {{subject}}

         {{message}}

     Save the template. Note the TEMPLATE ID (e.g. "template_xyz789")

   Step 4 — Get your Public Key
     Dashboard → Account → General → Public Key
     It looks like: "AbCdEfGhIjKlMnOp"

   Step 5 — Paste all three values below where indicated.

   Step 6 — Auto-reply (optional but recommended)
     In the same template, scroll to "Auto-Reply Settings"
     Toggle on "Send auto reply" and write a reply message:
       Subject: Thanks for getting in touch!
       Body: Hi {{from_name}}, thanks for your message.
             I'll get back to you as soon as I can.
             — Uwe Jon Munyantwali
     Set the "Reply To" field to: {{from_email}}

   ── HOW THE CODE WORKS ──────────────────────────────────────
   EmailJS is loaded via a <script> tag in contact.html.
   emailjs.send() is called on form submission with the three
   IDs and a params object matching the template variables.
   No API key is ever sent to a server — it runs in the browser.
   ============================================================= */

document.addEventListener('DOMContentLoaded', function () {

  /* ── EmailJS configuration ───────────────────────────────────
     Replace these three placeholder strings with the real values
     from your EmailJS dashboard (see setup steps above).
  ────────────────────────────────────────────────────────── */
  const EMAILJS_PUBLIC_KEY  = 'YOUR_PUBLIC_KEY';       /* Account → General → Public Key          */
  const EMAILJS_SERVICE_ID  = 'YOUR_SERVICE_ID';       /* Email Services → your Gmail service ID  */
  const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';      /* Email Templates → your template ID      */

  /* Initialise EmailJS with the public key.
     This must run before any emailjs.send() call. */
  emailjs.init(EMAILJS_PUBLIC_KEY);


  /* ── Select the key DOM elements ─────────────────────────────*/
  const form       = document.getElementById('contactForm');
  const submitBtn  = document.getElementById('formSubmit');
  const successMsg = document.getElementById('formSuccess');

  /* Guard: bail out if the form isn't on this page */
  if (!form) return;


  /* ── Hide all error spans on page load ──────────────────────
     Adds the HTML hidden attribute to every .form-error-msg so
     they start fully collapsed regardless of browser UA styles
     applied to role="alert" elements (which default to inline).
  ────────────────────────────────────────────────────────── */
  form.querySelectorAll('.form-error-msg').forEach(function (span) {
    span.setAttribute('hidden', '');
  });


  /* ══════════════════════════════════════════════════════════
     VALIDATION HELPERS
     ════════════════════════════════════════════════════════ */

  /* ── showError(fieldId, message) ─────────────────────────────
     Marks a field as invalid and makes its error span visible.
     Uses both CSS class .visible AND removes the HTML hidden
     attribute, so the span shows regardless of browser overrides.
  ────────────────────────────────────────────────────────── */
  function showError(fieldId, message) {
    const input   = document.getElementById(fieldId);
    const errorEl = document.getElementById(fieldId + 'Error');

    if (input) {
      input.classList.add('error');
      input.setAttribute('aria-invalid', 'true');
    }
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.removeAttribute('hidden');
      errorEl.classList.add('visible');
    }
  }

  /* ── clearError(fieldId) ──────────────────────────────────────
     Resets a field to its clean state. Called on user input.
  ────────────────────────────────────────────────────────── */
  function clearError(fieldId) {
    const input   = document.getElementById(fieldId);
    const errorEl = document.getElementById(fieldId + 'Error');

    if (input) {
      input.classList.remove('error');
      input.removeAttribute('aria-invalid');
    }
    if (errorEl) {
      errorEl.classList.remove('visible');
      errorEl.setAttribute('hidden', '');
    }
  }

  /* ── isValidEmail(str) ────────────────────────────────────────
     Returns true if str looks like a valid email address.
  ────────────────────────────────────────────────────────── */
  function isValidEmail(str) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(str.trim());
  }

  /* ── validateForm() ───────────────────────────────────────────
     Runs all four field checks simultaneously so the user sees
     every error at once. Returns true only if all pass.
  ────────────────────────────────────────────────────────── */
  function validateForm() {
    const name    = (document.getElementById('fieldName')?.value    ?? '').trim();
    const email   = (document.getElementById('fieldEmail')?.value   ?? '').trim();
    const subject = (document.getElementById('fieldSubject')?.value ?? '').trim();
    const message = (document.getElementById('fieldMessage')?.value ?? '').trim();

    let valid = true;

    if (!name) {
      showError('fieldName', 'Please enter your name.');
      valid = false;
    }

    if (!email) {
      showError('fieldEmail', 'Please enter your email address.');
      valid = false;
    } else if (!isValidEmail(email)) {
      showError('fieldEmail', 'That doesn\'t look like a valid email address.');
      valid = false;
    }

    if (!subject) {
      showError('fieldSubject', 'Please add a subject line.');
      valid = false;
    }

    if (!message) {
      showError('fieldMessage', 'Please write a message.');
      valid = false;
    } else if (message.length < 10) {
      showError('fieldMessage', 'Message is too short — please add a bit more detail.');
      valid = false;
    }

    return valid;
  }

  /* ── Live error clearing ─────────────────────────────────────
     Clears a field's error the moment the user starts typing in it.
  ────────────────────────────────────────────────────────── */
  ['fieldName', 'fieldEmail', 'fieldSubject', 'fieldMessage'].forEach(function (id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input',  function () { clearError(id); });
    el.addEventListener('blur',   function () { if (el.value.trim()) clearError(id); });
  });


  /* ══════════════════════════════════════════════════════════
     FORM SUBMISSION
     ════════════════════════════════════════════════════════ */

  form.addEventListener('submit', async function (event) {

    /* Prevent the browser doing its own form submission */
    event.preventDefault();

    /* ── Validate first ─────────────────────────────────────
       If invalid, scroll to the first visible error and stop. */
    if (!validateForm()) {
      const firstError = form.querySelector('.form-error-msg.visible');
      if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    /* ── Lock the submit button ──────────────────────────────
       Prevents double-sends while EmailJS is processing. */
    submitBtn.disabled    = true;
    submitBtn.textContent = 'Sending…';

    /* ── Build the params object ─────────────────────────────
       These variable names must exactly match the {{placeholders}}
       in the EmailJS template created in Step 3 of setup. */
    const templateParams = {
      from_name:  document.getElementById('fieldName').value.trim(),
      from_email: document.getElementById('fieldEmail').value.trim(),
      subject:    document.getElementById('fieldSubject').value.trim(),
      message:    document.getElementById('fieldMessage').value.trim(),
      to_email:   'uwemunyantwali@gmail.com'   /* Destination — always Uwe's Gmail */
    };

    try {

      /* ── Send via EmailJS ────────────────────────────────────
         emailjs.send() makes an authenticated request to EmailJS
         servers, which forward the email through Uwe's connected
         Gmail account. The response is a promise that resolves
         with { status: 200, text: 'OK' } on success. */
      const response = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams
      );

      if (response.status === 200) {
        /* ── Success ──────────────────────────────────────────
           EmailJS confirmed delivery. Hide the form and show
           the thank-you message. */
        form.style.display = 'none';
        successMsg.removeAttribute('hidden');
        successMsg.classList.add('visible');
        successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });

      } else {
        /* ── Unexpected status ────────────────────────────────
           EmailJS responded but not with 200 — show inline error. */
        showFormLevelError(
          'Something went wrong (status ' + response.status + '). ' +
          'Please try again or email <a href="mailto:uwemunyantwali@gmail.com">uwemunyantwali@gmail.com</a> directly.'
        );
        submitBtn.disabled    = false;
        submitBtn.textContent = 'Send message →';
      }

    } catch (err) {
      /* ── EmailJS error or network failure ────────────────────
         Could be wrong IDs, quota exceeded, or no internet.
         Show a friendly inline error with the direct email. */
      console.error('EmailJS error:', err);

      /* Check if it's a config error (placeholder IDs still in place) */
      const isUnconfigured =
        EMAILJS_PUBLIC_KEY  === 'YOUR_PUBLIC_KEY'  ||
        EMAILJS_SERVICE_ID  === 'YOUR_SERVICE_ID'  ||
        EMAILJS_TEMPLATE_ID === 'YOUR_TEMPLATE_ID';

      const message = isUnconfigured
        ? 'The email service hasn\'t been configured yet. ' +
          'See the setup instructions at the top of js/form.js.'
        : 'Could not send your message — please check your connection, ' +
          'or email Uwe directly at ' +
          '<a href="mailto:uwemunyantwali@gmail.com">uwemunyantwali@gmail.com</a>.';

      showFormLevelError(message);
      submitBtn.disabled    = false;
      submitBtn.textContent = 'Send message →';
    }

  });


  /* ── showFormLevelError(html) ─────────────────────────────────
     Displays a banner-level error above the submit button when
     the submission itself fails (not a field validation error).
     Creates the banner element on first call; reuses it after.
  ────────────────────────────────────────────────────────── */
  function showFormLevelError(html) {
    let banner = document.getElementById('formSubmitError');

    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'formSubmitError';
      banner.style.cssText = [
        'margin-bottom:12px',
        'padding:12px 16px',
        'border-radius:8px',
        'background:#fdf2f2',
        'border:1px solid #f5c6c6',
        'font-size:13px',
        'color:#9b2828',
        'line-height:1.6'
      ].join(';');
      submitBtn.parentNode.insertBefore(banner, submitBtn);
    }

    banner.innerHTML = html;
    banner.removeAttribute('hidden');
    banner.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

});
