(() => {
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('nav');

  // Header border on scroll
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 8);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile menu
  const setMenu = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    nav.classList.toggle('open', open);
  };
  toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });

  // Scroll reveal
  const targets = document.querySelectorAll('.section-head, .card, .steps li, .concept, .why-list li, .price, .faq details, .post, .form');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add('in'); io.unobserve(entry.target); }
      });
    }, { rootMargin: '0px 0px -60px 0px' });
    targets.forEach((el) => { el.classList.add('reveal'); io.observe(el); });
  }

  // Latest posts from WordPress (same origin in production; static fallback stays otherwise)
  const posts = document.getElementById('posts');
  const escape = (s) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  if (location.protocol.startsWith('http')) {
    fetch('/wp-json/wp/v2/posts?per_page=3&_embed=wp:featuredmedia')
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((items) => {
        if (!Array.isArray(items) || !items.length) return;
        posts.innerHTML = items.map((p) => {
          const img = p._embedded?.['wp:featuredmedia']?.[0]?.source_url;
          const date = new Date(p.date).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' });
          const title = new DOMParser().parseFromString(p.title.rendered, 'text/html').body.textContent;
          return `<article class="post"><a href="${escape(p.link)}">
            ${img ? `<img src="${escape(img)}" alt="" loading="lazy" width="600" height="340">` : ''}
            <time datetime="${escape(p.date)}">${date}</time><h3>${escape(title)}</h3></a></article>`;
        }).join('');
      })
      .catch(() => {});
  }

  // Consult form
  const form = document.getElementById('consult');
  const status = form.querySelector('.form-status');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    let valid = true;
    form.querySelectorAll('[required]').forEach((input) => {
      const ok = input.value.trim() !== '' && input.checkValidity();
      input.closest('.field').classList.toggle('invalid', !ok);
      if (!ok) valid = false;
    });
    if (!valid) { status.textContent = 'Please fill in your name, a valid email and a short message.'; return; }

    status.textContent = 'Sending…';
    try {
      const res = await fetch(form.action, { method: 'POST', body: new FormData(form) });
      if (!res.ok) throw new Error(res.status);
      form.reset();
      status.textContent = 'Thanks! We will be in touch within one business day.';
    } catch {
      status.textContent = 'Sorry, something went wrong. Please call us on 0421 017 997.';
    }
  });

  document.getElementById('year').textContent = new Date().getFullYear();
})();
