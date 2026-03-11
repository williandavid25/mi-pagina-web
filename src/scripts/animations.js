export const initAnimations = () => {
    gsap.registerPlugin(ScrollTrigger);

    // Hero & static elements timeline (don't target product cards here - they don't exist yet!)
    const tl = gsap.timeline();
    
    tl.fromTo('.hero-badge', 
        { y: -20, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }
    )
    .fromTo('.hero-title', 
        { y: 40, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' },
        '-=0.3'
    )
    .fromTo('.hero-subtitle', 
        { y: 30, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.7, ease: 'power2.out' },
        '-=0.4'
    )
    .fromTo('.hero-cta-group', 
        { y: 20, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.6, ease: 'back.out' },
        '-=0.3'
    )
    .fromTo('.floating-hero-img',
        { scale: 0.9, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1, ease: 'power2.out' },
        '-=0.6'
    )
    .fromTo('.whatsapp-float',
        { scale: 0, rotation: -45 },
        { scale: 1, rotation: 0, duration: 0.6, ease: 'back.out(1.5)' },
        '-=0.5'
    );
    
    // Section titles - scroll triggered
    gsap.utils.toArray('.section-title').forEach(el => {
        gsap.fromTo(el,
            { y: 30, opacity: 0 },
            { 
                y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
                scrollTrigger: { trigger: el, start: 'top 85%', once: true }
            }
        );
    });

    // Header effect on scroll
    ScrollTrigger.create({
        start: 'top -20',
        end: 99999,
        toggleClass: { className: 'scrolled', targets: '.header' }
    });
};

/**
 * Animates product cards AFTER they have been injected into the DOM.
 * Call this from index.js immediately after ProductGrid renders.
 */
export const animateProductCards = () => {
    const cards = document.querySelectorAll('.product-card');
    if (cards.length === 0) return;

    gsap.fromTo(cards,
        { y: 40, autoAlpha: 0 },
        { 
            y: 0, autoAlpha: 1, duration: 0.6, stagger: 0.07, ease: 'back.out(1.2)',
            scrollTrigger: { trigger: '#catalogo', start: 'top 80%', once: true }
        }
    );
};
