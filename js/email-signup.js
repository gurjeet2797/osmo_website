/**
 * Osmo Email Signup
 * Client-side validation and visual feedback
 */

(function () {
  const form = document.getElementById('email-signup');
  const input = document.getElementById('email-input');
  const submitBtn = document.getElementById('email-submit');

  if (!form || !input || !submitBtn) return;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function setInvalid(message) {
    input.setAttribute('aria-invalid', 'true');
    input.style.borderColor = 'var(--error)';
    if (message) {
      const existing = form.querySelector('.form-error');
      if (existing) existing.remove();
      const err = document.createElement('p');
      err.className = 'form-error';
      err.style.cssText = 'color: var(--error); font-size: 13px; margin-top: 8px; margin-bottom: 0;';
      err.textContent = message;
      form.appendChild(err);
    }
  }

  function setValid() {
    input.setAttribute('aria-invalid', 'false');
    input.style.borderColor = '';
    const existing = form.querySelector('.form-error');
    if (existing) existing.remove();
  }

  function setSuccess(message) {
    setValid();
    input.style.borderColor = 'var(--success)';
    submitBtn.textContent = message || 'You\'re on the list!';
    submitBtn.disabled = true;
  }

  function setLoading(loading) {
    submitBtn.disabled = loading;
    submitBtn.textContent = loading ? 'Sending...' : 'Notify Me When It Launches';
  }

  input.addEventListener('input', () => {
    setValid();
  });

  input.addEventListener('blur', () => {
    if (input.value.trim() && !emailRegex.test(input.value.trim())) {
      setInvalid('Please enter a valid email address.');
    } else {
      setValid();
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = input.value.trim();

    if (!email) {
      setInvalid('Please enter your email.');
      input.focus();
      return;
    }

    if (!emailRegex.test(email)) {
      setInvalid('Please enter a valid email address.');
      input.focus();
      return;
    }

    setValid();
    setLoading(true);

    // Placeholder: no backend yet. Swap for Mailchimp/ConvertKit/serverless later.
    setTimeout(() => {
      setLoading(false);
      setSuccess('You\'re on the list!');
    }, 600);
  });
})();
