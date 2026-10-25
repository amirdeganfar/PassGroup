(() => {
  const mobileBar = document.querySelector('.mobile-bar');
  const contact = document.getElementById('contact');
  const form = document.getElementById('consult');
  const message = document.getElementById('f-msg');
  const track = (name, params) => { if (typeof window.gtag === 'function') window.gtag('event', name, params); };

  // Analytics: phone and email clicks
  document.querySelectorAll('a[href^="tel:"]').forEach((a) => a.addEventListener('click', () => track('phone_click')));
  document.querySelectorAll('a[href^="mailto:"]').forEach((a) => a.addEventListener('click', () => track('email_click')));

  // Mobile action bar: show after the hero, hide near the form
  const onScroll = () => {
    const nearForm = contact.getBoundingClientRect().top < window.innerHeight;
    mobileBar.classList.toggle('show', window.scrollY > 500 && !nearForm);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Scroll reveal
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add('in'); io.unobserve(entry.target); }
      });
    }, { rootMargin: '0px 0px -80px 0px' });
    document.querySelectorAll('.section .wrap').forEach((el) => { el.classList.add('reveal'); io.observe(el); });
  }

  const typeMap = {
    'mobile app': 'Mobile app',
    'website': 'Website or online store',
    'online store': 'Website or online store',
    'custom software': 'Custom software',
    'fix for my software': 'Help with existing software',
  };
  const selectType = (value) => {
    const radio = form.querySelector(`input[name="type"][value="${value}"]`);
    if (radio) radio.checked = true;
  };

  // Hero idea builder pre-fills the contact form
  document.getElementById('idea').addEventListener('submit', (e) => {
    e.preventDefault();
    const type = document.getElementById('i-type').value;
    const biz = document.getElementById('i-biz').value.trim();
    message.value = `I'd like a ${type}${biz ? ` for my ${biz}` : ''}.`;
    selectType(typeMap[type]);
    contact.scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => document.getElementById('f-name').focus({ preventScroll: true }), 700);
  });

  // Service rows pre-select the project type
  document.querySelectorAll('[data-type]').forEach((link) => {
    link.addEventListener('click', () => selectType(link.dataset.type));
  });

  // Submit
  const status = form.querySelector('.form-status');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    let valid = true;
    form.querySelectorAll('[required]').forEach((input) => {
      const ok = input.value.trim() !== '';
      input.closest('.field').classList.toggle('invalid', !ok);
      if (!ok) valid = false;
    });
    if (!valid) { status.textContent = 'Please fill in all fields.'; return; }

    status.textContent = 'Sending…';
    try {
      const res = await fetch(form.action, { method: 'POST', body: new FormData(form) });
      if (!res.ok) throw new Error(res.status);
      track('generate_lead', { lead_type: form.querySelector('input[name="type"]:checked')?.value });
      form.reset();
      status.textContent = 'Thanks! We’ll be in touch soon.';
    } catch {
      status.textContent = 'Sorry, that didn’t send. Please call 0421 017 997.';
    }
  });

  document.getElementById('year').textContent = new Date().getFullYear();
})();
