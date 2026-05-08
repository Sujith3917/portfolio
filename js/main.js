/* ============================================================
   PORTFOLIO INTERACTIONS
   - Loader hide
   - Custom cursor (dot + ring)
   - Typed text in hero
   - Smooth scroll + nav active state
   - Scroll-reveal sections
   - Animated counters
   - Mobile nav toggle
   - Magnetic hover on buttons
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

    /* ---------- LOADER ---------- */
    const loader = document.getElementById('loader');
    window.addEventListener('load', () => {
        setTimeout(() => loader && loader.classList.add('hidden'), 1800);
    });
    // Fallback in case load already fired
    setTimeout(() => loader && loader.classList.add('hidden'), 2400);

    /* ---------- CUSTOM CURSOR ---------- */
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorRing = document.querySelector('.cursor-ring');
    let mouseX = 0, mouseY = 0;
    let dotX = 0, dotY = 0;
    let ringX = 0, ringY = 0;

    if (cursorDot && cursorRing && window.innerWidth > 1024) {
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        function animateCursor() {
            dotX += (mouseX - dotX) * 0.6;
            dotY += (mouseY - dotY) * 0.6;
            ringX += (mouseX - ringX) * 0.18;
            ringY += (mouseY - ringY) * 0.18;
            cursorDot.style.transform = `translate(${dotX}px, ${dotY}px) translate(-50%, -50%)`;
            cursorRing.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
            requestAnimationFrame(animateCursor);
        }
        animateCursor();

        // Hover state on interactive elements
        const hoverTargets = document.querySelectorAll('a, button, .skill-card, .project-card, .achievement-card, .contact-card, .cert-item, .stat');
        hoverTargets.forEach(el => {
            el.addEventListener('mouseenter', () => cursorRing.classList.add('hover'));
            el.addEventListener('mouseleave', () => cursorRing.classList.remove('hover'));
        });
    }

    /* ---------- TYPED TEXT IN HERO ---------- */
    const typedEl = document.querySelector('.typed-text');
    if (typedEl) {
        const phrases = [
            'Full Stack Developer',
            'React Engineer',
            'Node.js Builder',
            'Problem Solver',
            'IoT Tinkerer'
        ];
        let phraseIndex = 0;
        let charIndex = 0;
        let isDeleting = false;

        function typeLoop() {
            const phrase = phrases[phraseIndex];
            if (isDeleting) {
                charIndex--;
                typedEl.textContent = phrase.substring(0, charIndex);
                if (charIndex === 0) {
                    isDeleting = false;
                    phraseIndex = (phraseIndex + 1) % phrases.length;
                    setTimeout(typeLoop, 400);
                    return;
                }
                setTimeout(typeLoop, 35);
            } else {
                charIndex++;
                typedEl.textContent = phrase.substring(0, charIndex);
                if (charIndex === phrase.length) {
                    isDeleting = true;
                    setTimeout(typeLoop, 1800);
                    return;
                }
                setTimeout(typeLoop, 80);
            }
        }
        // Start after loader fades
        setTimeout(typeLoop, 2200);
    }

    /* ---------- NAV: SCROLL STATE & ACTIVE LINK ---------- */
    const nav = document.querySelector('.nav');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');

    function onScroll() {
        const y = window.scrollY;
        if (y > 50) nav.classList.add('scrolled');
        else nav.classList.remove('scrolled');

        // Highlight active section in nav
        let current = 'hero';
        sections.forEach(sec => {
            const top = sec.offsetTop - 120;
            if (y >= top) current = sec.id;
        });
        navLinks.forEach(l => {
            l.classList.toggle('active', l.getAttribute('href') === '#' + current);
        });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* ---------- MOBILE NAV TOGGLE ---------- */
    const navToggle = document.querySelector('.nav-toggle');
    const navLinksContainer = document.querySelector('.nav-links');
    if (navToggle && navLinksContainer) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            navLinksContainer.classList.toggle('open');
        });
        navLinks.forEach(l => l.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navLinksContainer.classList.remove('open');
        }));
    }

    /* ---------- SMOOTH SCROLL ---------- */
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href.length > 1) {
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    const top = target.getBoundingClientRect().top + window.scrollY - 80;
                    window.scrollTo({ top, behavior: 'smooth' });
                }
            }
        });
    });

    /* ---------- SCROLL REVEAL ---------- */
    const revealCandidates = document.querySelectorAll(
        '.section-header, .about-grid, .skill-card, .project-card, .edu-card, .edu-side, .cert-item, .achievement-card, .contact-card, .contact-intro, .achievements-block, .contact-form-wrapper'
    );
    revealCandidates.forEach((el, i) => {
        el.classList.add('reveal');
        el.style.transitionDelay = (i % 4) * 0.08 + 's';
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    revealCandidates.forEach(el => observer.observe(el));

    /* ---------- ANIMATED COUNTERS ---------- */
    const counters = document.querySelectorAll('.stat-number[data-count]');
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.dataset.count, 10);
                const duration = 1400;
                const start = performance.now();
                function tick(now) {
                    const progress = Math.min((now - start) / duration, 1);
                    const eased = 1 - Math.pow(1 - progress, 3);
                    el.textContent = Math.floor(target * eased) + (target >= 15 ? '+' : '');
                    if (progress < 1) requestAnimationFrame(tick);
                    else el.textContent = target + (target >= 15 ? '+' : '');
                }
                requestAnimationFrame(tick);
                counterObserver.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(c => counterObserver.observe(c));

    /* ---------- MAGNETIC BUTTONS ---------- */
    const magnetic = document.querySelectorAll('.btn, .nav-resume, .project-link');
    magnetic.forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            el.style.transform = `translate(${x * 0.15}px, ${y * 0.25}px)`;
        });
        el.addEventListener('mouseleave', () => {
            el.style.transform = '';
        });
    });

    /* ---------- TILT ON PROJECT CARDS ---------- */
    const tiltTargets = document.querySelectorAll('.project-visual');
    tiltTargets.forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            el.style.transform = `perspective(1000px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-5px)`;
        });
        el.addEventListener('mouseleave', () => {
            el.style.transform = '';
        });
    });

    /* ---------- SKILL CARD 3D TILT ---------- */
    const skillCards = document.querySelectorAll('.skill-card, .achievement-card, .contact-card');
    skillCards.forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            el.style.transform = `perspective(800px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateY(-8px)`;
        });
        el.addEventListener('mouseleave', () => {
            el.style.transform = '';
        });
    });

    /* ---------- CONTACT FORM (Web3Forms) ---------- */
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');
    const formSubmit = document.querySelector('.form-submit');
    let statusTimeout;

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Reset status
            clearTimeout(statusTimeout);
            formStatus.className = 'form-status';
            formStatus.textContent = '';

            // Loading state
            formSubmit.classList.add('loading');
            formSubmit.disabled = true;

            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData);

            try {
                const response = await fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
                const result = await response.json();

                if (result.success) {
                    formStatus.className = 'form-status success show';
                    formStatus.textContent = '✓ Transmission received. I\'ll get back to you within 24 hours.';
                    contactForm.reset();
                } else {
                    throw new Error(result.message || 'Submission failed');
                }
            } catch (err) {
                formStatus.className = 'form-status error show';
                formStatus.textContent = '✗ Transmission failed. Please email me directly at sujithkumar2004b@gmail.com';
            } finally {
                formSubmit.classList.remove('loading');
                formSubmit.disabled = false;

                // Auto-hide status after 8 seconds
                statusTimeout = setTimeout(() => {
                    formStatus.classList.remove('show');
                }, 8000);
            }
        });
    }
});
