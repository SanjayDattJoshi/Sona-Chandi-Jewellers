/**
 * Sona Chandi Jewellers — Scroll-Driven Frame Animation
 *
 * Handles:
 *  1. Preloading all 240 image frames
 *  2. Canvas rendering synced to scroll position
 *  3. Overlay text reveals at scroll milestones
 *  4. Hero particle effects
 *  5. Scroll-reveal for ALL sections (.reveal + .reveal-section)
 *  6. Navbar scroll behaviour
 *  7. Mobile hamburger menu
 *  8. Floating WhatsApp + Back to Top
 *  9. Info modal
 */

(function () {
    'use strict';

    // ─── Config ───────────────────────────────────────────────
    const TOTAL_FRAMES = 240;
    const FRAME_PATH   = './images/ezgif-frame-';
    const FRAME_EXT    = '.jpg';

    // WhatsApp config — web.whatsapp.com format
    const WHATSAPP_PHONE = '917617451234';
    const WHATSAPP_BASE  = 'https://web.whatsapp.com/send?phone=' + WHATSAPP_PHONE + '&text=';

    // Content shown in the info modal for footer "About Us" / "Client Services" links.
    // Edit this copy any time — it's plain text, no rebuild needed.
    const INFO_CONTENT = {
        history: {
            title: 'Our History',
            body: [
                'For over 37 years, Sona Chandi Jewellers has been a jeweller who has cherished the importance of trust, innovation and style.',
                'The company was the brainchild of its founder Anil Kumar Agarwal in the year 1988. He started with a small jewellery store and opened their flagship store in 2019 with the notion of providing its vast clientele a world-class experience accompanied by mesmerising collection of jewellery.'
            ]
        },
        craftsmanship: {
            title: 'Craftsmanship',
            body: [
                'Every piece is shaped by skilled karigars at our Haldwani workshop, blending traditional hand-finishing with modern design.',
                'From bridal sets to everyday gold, each item is checked for finish and weight before it reaches our showroom floor.'
            ]
        },
        hallmark: {
            title: 'Hallmark & Purity',
            body: [
                'All our gold jewellery is BIS hallmarked, so the purity you pay for is the purity you get — verifiable, always.',
                'We\u2019re happy to explain hallmark markings and show purity certification in-store for any piece you\u2019re considering.'
            ]
        },
        shipping: {
            title: 'Shipping & Returns',
            body: [
                'For exact shipping timelines, packaging and return policy on a specific piece, message us on WhatsApp and our team will guide you directly.',
                'Most in-store purchases can be exchanged as per our store policy — just bring your original bill.'
            ]
        },
        care: {
            title: 'Jewellery Care Guide',
            body: [
                'Store gold and diamond pieces separately to avoid scratches, and keep silver in an air-tight pouch to slow tarnishing.',
                'Avoid contact with perfume, sweat and chemicals — put jewellery on last when getting ready, and take it off first.',
                'Bring your pieces in for a free professional polish and clean any time you visit the store.'
            ]
        },
        privacy: {
            title: 'Privacy Policy',
            body: [
                'We only use the contact details you share with us (over WhatsApp, phone or in-store) to respond to your enquiry or appointment request.',
                'We never sell or share your information with third parties.'
            ]
        },
        terms: {
            title: 'Terms of Use',
            body: [
                'Prices shown are indicative and subject to change with daily gold/silver rates unless marked otherwise.',
                'Please confirm final pricing, availability and making charges with our team before visiting or placing an order.'
            ]
        }
    };

    // ─── DOM refs ─────────────────────────────────────────────
    const canvas             = document.getElementById('frameCanvas');
    const ctx                = canvas ? canvas.getContext('2d') : null;
    const preloader          = document.getElementById('preloader');
    const preloaderBar       = document.getElementById('preloaderBar');
    const preloaderText      = document.getElementById('preloaderText');
    const animSection        = document.getElementById('animation-section');
    const scrollProgressFill = document.getElementById('scrollProgressFill');
    const scrollProgressLabel= document.getElementById('scrollProgressLabel');
    const animText1          = document.getElementById('animText1');
    const animText2          = document.getElementById('animText2');
    const animText3          = document.getElementById('animText3');
    const navbar             = document.getElementById('navbar');
    const heroParticles      = document.getElementById('heroParticles');
    const backToTopBtn       = document.getElementById('backToTop');
    const navHamburger       = document.getElementById('navHamburger');
    const navLinks           = document.getElementById('navLinks');

    // ─── State ────────────────────────────────────────────────
    const frames = [];
    let currentFrame = 0;

    // ─── Helpers ──────────────────────────────────────────────
    function pad(n) { return String(n).padStart(3, '0'); }

    // ─── 1. Preload frames ───────────────────────────────────
    function preloadImages() {
        return new Promise(resolve => {
            let loaded = 0;

            for (let i = 1; i <= TOTAL_FRAMES; i++) {
                const img = new Image();
                img.src = `${FRAME_PATH}${pad(i)}${FRAME_EXT}`;

                const done = () => {
                    loaded++;
                    const pct = Math.round((loaded / TOTAL_FRAMES) * 100);
                    if (preloaderBar)  preloaderBar.style.width   = `${pct}%`;
                    if (preloaderText) preloaderText.textContent  = `Loading experience... ${pct}%`;
                    if (loaded === TOTAL_FRAMES) resolve();
                };

                img.onload  = done;
                img.onerror = done;        // still count failed frames
                frames[i - 1] = img;
            }
        });
    }

    // ─── 2. Canvas ───────────────────────────────────────────
    function resizeCanvas() {
        if (!canvas || !ctx) return;
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
        renderFrame(currentFrame);
    }

    function renderFrame(index) {
        if (!ctx) return;
        const img = frames[index];
        if (!img || !img.complete || !img.naturalWidth) return;

        const cw = canvas.width;
        const ch = canvas.height;
        ctx.clearRect(0, 0, cw, ch);
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, cw, ch);

        const ia = img.naturalWidth / img.naturalHeight;
        const ca = cw / ch;
        let dw, dh, dx, dy;

        if (ca > ia) {
            dw = cw; dh = cw / ia; dx = 0; dy = (ch - dh) / 2;
        } else {
            dh = ch; dw = ch * ia; dx = (cw - dw) / 2; dy = 0;
        }
        ctx.drawImage(img, dx, dy, dw, dh);
    }

    // ─── 3. Scroll handler ───────────────────────────────────
    function handleScroll() {
        const scrollTop = window.scrollY;

        // Navbar glass effect
        if (navbar) navbar.classList.toggle('scrolled', scrollTop > 80);

        // Back-to-top button visibility
        if (backToTopBtn) backToTopBtn.classList.toggle('visible', scrollTop > 600);

        // Frame animation progress
        if (animSection) {
            const secTop    = animSection.offsetTop;
            const secHeight = animSection.offsetHeight - window.innerHeight;
            const progress  = Math.min(Math.max((scrollTop - secTop) / secHeight, 0), 1);

            const fi = Math.min(Math.floor(progress * (TOTAL_FRAMES - 1)), TOTAL_FRAMES - 1);
            if (fi !== currentFrame) { currentFrame = fi; renderFrame(fi); }

            // Progress bar
            if (scrollProgressFill)  scrollProgressFill.style.height  = `${progress * 100}%`;
            if (scrollProgressLabel) scrollProgressLabel.textContent   = `${Math.round(progress * 100)}%`;

            // Overlay text windows
            setVisible(animText1, progress >= 0.05 && progress <= 0.30);
            setVisible(animText2, progress >= 0.35 && progress <= 0.65);
            setVisible(animText3, progress >= 0.75 && progress <= 1.00);
        }
    }

    function setVisible(el, show) {
        if (!el) return;
        el.classList.toggle('visible', show);
    }

    // ─── 4. Scroll-reveal observer ───────────────────────────
    //    Observes both class systems:
    //      • .reveal          → Tailwind lower sections (adds .active)
    //      • .reveal-section  → custom-CSS upper sections (adds .active)
    function setupRevealObserver() {
        const io = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active', 'revealed');
                    io.unobserve(entry.target);   // fire once only
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

        document.querySelectorAll('.reveal, .reveal-section').forEach(el => io.observe(el));
    }

    // ─── 5. Hero particles ───────────────────────────────────
    function createParticles() {
        if (!heroParticles) return;
        for (let i = 0; i < 25; i++) {
            const p   = document.createElement('div');
            const sz  = `${2 + Math.random() * 3}px`;
            p.classList.add('hero-particle');
            Object.assign(p.style, {
                left:              `${Math.random() * 100}%`,
                top:               `${50 + Math.random() * 50}%`,
                width:             sz,
                height:            sz,
                animationDelay:    `${(Math.random() * 6).toFixed(2)}s`,
                animationDuration: `${(4 + Math.random() * 4).toFixed(2)}s`
            });
            heroParticles.appendChild(p);
        }
    }

    // ─── 6. Smooth nav links ─────────────────────────────────
    function setupNavLinks() {
        document.querySelectorAll('.nav-link, .btn-nav, .scroll-cta').forEach(el => {
            el.addEventListener('click', e => {
                const href = el.getAttribute('href') || el.dataset.target || '#animation-section';
                if (!href.startsWith('#')) return;
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) target.scrollIntoView({ behavior: 'smooth' });

                // Close mobile menu if open
                if (navLinks && navLinks.classList.contains('mobile-open')) {
                    navLinks.classList.remove('mobile-open');
                    if (navHamburger) navHamburger.classList.remove('active');
                }
            });
        });

        // "Visit Us" CTA → Google Maps
        const navCta = document.getElementById('navCta');
        if (navCta) {
            navCta.addEventListener('click', () => {
                window.open('https://maps.google.com/?q=Sona+Chandi+Jewellers+Haldwani', '_blank', 'noopener');
            });
        }
    }

    // ─── 7. Product "Enquire Now" buttons → WhatsApp ─────────
    function setupEnquireButtons() {
        document.querySelectorAll('.enquire-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const product = btn.dataset.product || 'a piece from your collection';
                const message = `Hi, I'm interested in the ${product}. Could you share more details and pricing?`;
                const url = WHATSAPP_BASE + encodeURIComponent(message);
                window.open(url, '_blank', 'noopener');
            });
        });
    }

    // ─── 8. Info modal (About Us / Client Services links) ────
    function setupInfoModal() {
        const modal      = document.getElementById('infoModal');
        const modalTitle = document.getElementById('infoModalTitle');
        const modalBody  = document.getElementById('infoModalBody');
        const closeBtn   = document.getElementById('infoModalClose');
        if (!modal) return;

        function openModal(key) {
            const data = INFO_CONTENT[key];
            if (!data) return;
            modalTitle.textContent = data.title;
            modalBody.innerHTML = data.body.map(p => `<p>${p}</p>`).join('');
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            modal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
        }

        function closeModal() {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
            modal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        }

        document.querySelectorAll('.info-link').forEach(link => {
            link.addEventListener('click', e => {
                e.preventDefault();
                openModal(link.dataset.info);
            });
        });

        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
        document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
    }

    // ─── 9. Mobile hamburger menu ────────────────────────────
    function setupMobileMenu() {
        if (!navHamburger || !navLinks) return;

        navHamburger.addEventListener('click', () => {
            navHamburger.classList.toggle('active');
            navLinks.classList.toggle('mobile-open');
            document.body.style.overflow = navLinks.classList.contains('mobile-open') ? 'hidden' : '';
        });
    }

    // ─── 10. Back to top button ──────────────────────────────
    function setupBackToTop() {
        if (!backToTopBtn) return;
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ─── Init ─────────────────────────────────────────────────
    async function init() {
        createParticles();
        setupNavLinks();
        setupEnquireButtons();
        setupInfoModal();
        setupMobileMenu();
        setupBackToTop();

        // Only preload frames if canvas exists (main page, not collections)
        if (canvas && preloader) {
            await preloadImages();
            resizeCanvas();
            renderFrame(0);

            // Short pause so the 100% bar is visible before hiding preloader
            setTimeout(() => {
                preloader.classList.add('loaded');
                setupRevealObserver();
            }, 500);
        } else {
            // Collections page or page without animation
            if (preloader) preloader.classList.add('loaded');
            setupRevealObserver();
        }

        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', resizeCanvas);
        handleScroll();
    }

    init();
})();
