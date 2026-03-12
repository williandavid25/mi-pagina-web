import { initAnimations, animateProductCards } from './animations.js';
import { ProductGrid } from '../components/product/ProductGrid.js';
import { MiniCart } from '../components/cart/MiniCart.js';
import { WishlistDrawer } from '../components/wishlist/WishlistDrawer.js';
import { CheckoutModal } from '../components/forms/CheckoutForm.js';
import { initCart, addToCart, openCart, procesarCompraWhatsApp } from './cartState.js';
import { AuthModal } from '../components/auth/AuthModal.js';
import { initGoogleAuth, openAuthModal, closeAuthModal, signOut, simulateEmailAuth, updateCartAuthUI, updateHeaderAuthUI, getUser } from './auth.js';
import { initSearch } from './search.js';
import { toggleWishlist, getWishlistCount } from './wishlistState.js';

document.addEventListener('DOMContentLoaded', async () => {
    console.log('Aplicación iniciada');
    
    // Iniciar animaciones globales de GSAP
    initAnimations();
    
    // 1. Renderizar componentes estáticos (Modales) MODO SINCRONO ANTES DE FETCH!
    const cartContainer = document.getElementById('cart-container');
    if (cartContainer) cartContainer.innerHTML = MiniCart();
    
    const checkoutContainer = document.getElementById('checkout-container');
    if (checkoutContainer) checkoutContainer.innerHTML = CheckoutModal();

    // Inject Auth Modal
    const authContainer = document.getElementById('auth-container');
    if (authContainer) authContainer.innerHTML = AuthModal();

    // Inject Wishlist Drawer
    const wishlistContainer = document.getElementById('wishlist-container');
    if (wishlistContainer) wishlistContainer.innerHTML = WishlistDrawer();

    // 2. Inicializar Estado del Carrito y Lógica DOM
    initCart();
    setupUIInteractions();
    setupAuthInteractions();
    initSearch(); // Live product search
    updateWishlistBadge(); // Initial count
    setupWishlistInteractions();
    
    // 3. Iniciar el Carrusel
    setupCarousel();
    
    // 4. Cargar productos y renderizar (Bloqueo Async con robustez)
    try {
        console.log('Intentando cargar productos desde ./MOCK_DATA/productos.json...');
        const response = await fetch('./MOCK_DATA/productos.json');
        
        if (!response.ok) {
            throw new Error(`Error de red: ${response.status} ${response.statusText}`);
        }

        const productos = await response.json();
        allProducts = productos; // Salvar referencia global
        console.log('Productos cargados exitosamente:', productos.length, 'ítems encontrados.');
        
        const gridContainer = document.getElementById('product-grid-container');
        if (gridContainer) {
            gridContainer.innerHTML = ProductGrid(productos);
            console.log('Catálogo inyectado en el DOM correctamente.');
            
            // Setup buttons generated dynamically
            setupQuickAddParams();
            
            // Animate cards now that they exist in the DOM
            animateProductCards();
        } else {
            console.error('No se encontró el contenedor #product-grid-container en el HTML.');
        }
    } catch (error) {
        console.error('CRÍTICO: Fallo al cargar o renderizar el catálogo:', error);
        const gridContainer = document.getElementById('product-grid-container');
        if (gridContainer) {
            gridContainer.innerHTML = `<div class="error-msg">Lo sentimos, no pudimos cargar los productos. Por favor intenta de nuevo más tarde.</div>`;
        }
    }

    // Aquí inicializaremos Three.js para el canvas 3D más adelante
});

function setupAuthInteractions() {

    // ── Current auth mode ─────────────────────────────────────────
    let authMode = 'register'; // 'login' | 'register'

    function setAuthMode(mode) {
        authMode = mode;
        const title        = document.getElementById('auth-modal-title');
        const submitText   = document.getElementById('auth-submit-text');
        const toggleBtn    = document.getElementById('auth-toggle-mode');
        const footerQ      = document.getElementById('auth-footer-question');
        const benefits     = document.querySelector('.auth-benefits');
        const nameField    = document.getElementById('auth-name-field');
        const confirmField = document.getElementById('auth-confirm-field');
        const errorMsg     = document.getElementById('auth-error-msg');

        if (errorMsg) errorMsg.textContent = '';

        if (mode === 'register') {
            if (title)        title.textContent          = 'Crea tu cuenta';
            if (submitText)   submitText.textContent     = 'CREAR CUENTA';
            if (toggleBtn)    toggleBtn.textContent      = 'Inicia sesión';
            if (footerQ)      footerQ.textContent        = '¿Ya tienes cuenta?';
            if (benefits)     benefits.style.display     = '';
            if (nameField)    nameField.style.display    = '';
            if (confirmField) confirmField.style.display = '';
        } else {
            if (title)        title.textContent          = 'Bienvenido de vuelta';
            if (submitText)   submitText.textContent     = 'INICIAR SESIÓN';
            if (toggleBtn)    toggleBtn.textContent      = 'Regístrate gratis';
            if (footerQ)      footerQ.textContent        = '¿No tienes cuenta?';
            if (benefits)     benefits.style.display     = 'none';
            if (nameField)    nameField.style.display    = 'none';
            if (confirmField) confirmField.style.display = 'none';
        }
    }

    // ── Password visibility toggle ────────────────────────────────
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.auth-toggle-password');
        if (!btn) return;
        const input = document.getElementById(btn.dataset.target);
        if (!input) return;
        input.type = input.type === 'password' ? 'text' : 'password';
    });

    // ── Toggle mode (login ↔ register) ───────────────────────────
    document.addEventListener('click', (e) => {
        if (!e.target.closest('#auth-toggle-mode')) return;
        setAuthMode(authMode === 'register' ? 'login' : 'register');
    });

    // ── Open / Close Modal ────────────────────────────────────────
    document.addEventListener('click', (e) => {
        if (
            e.target.closest('#cart-login-banner') ||
            e.target.closest('#cart-login-banner-filled') ||
            e.target.id === 'cart-login-trigger' ||
            e.target.closest('#header-login-btn')
        ) {
            openAuthModal();
            setTimeout(() => setAuthMode('register'), 50);
        }
        if (e.target.closest('#cart-signout-btn')) signOut();
        if (e.target.closest('#auth-close-btn') || e.target.id === 'auth-modal-overlay') closeAuthModal();
        if (e.target.closest('#header-user-avatar')) {
            if (confirm('¿Cerrar sesión?')) signOut();
        }
    });

    // ── Unified form submit ───────────────────────────────────────
    document.addEventListener('submit', async (e) => {
        if (!e.target.matches('#auth-email-form')) return;
        e.preventDefault();

        const email      = document.getElementById('auth-email')?.value?.trim();
        const password   = document.getElementById('auth-password')?.value;
        const name       = document.getElementById('auth-name')?.value?.trim();
        const confirm2   = document.getElementById('auth-confirm')?.value;
        const errorMsg   = document.getElementById('auth-error-msg');
        const submitBtn  = document.getElementById('btn-auth-submit');
        const spinner    = document.getElementById('auth-spinner');
        const submitText = document.getElementById('auth-submit-text');
        const isRegister = authMode === 'register';

        if (errorMsg) errorMsg.textContent = '';

        // Validate
        if (isRegister && !name) {
            if (errorMsg) errorMsg.textContent = 'Por favor ingresa tu nombre completo.';
            return;
        }
        if (!email || !password) {
            if (errorMsg) errorMsg.textContent = 'Por favor completa todos los campos.';
            return;
        }
        if (!email.includes('@') || !email.includes('.')) {
            if (errorMsg) errorMsg.textContent = 'Ingresa un correo electrónico válido.';
            return;
        }
        if (password.length < 6) {
            if (errorMsg) errorMsg.textContent = 'La contraseña debe tener al menos 6 caracteres.';
            return;
        }
        if (isRegister && confirm2 !== password) {
            if (errorMsg) errorMsg.textContent = 'Las contraseñas no coinciden.';
            return;
        }

        // Loading
        if (submitBtn) submitBtn.disabled = true;
        if (spinner)   spinner.style.display = 'inline-block';
        if (submitText) submitText.textContent = '';

        try {
            await simulateEmailAuth(email, password, isRegister, isRegister ? name : null);
        } catch (err) {
            if (errorMsg) errorMsg.textContent = 'Ocurrió un error, inténtalo de nuevo.';
        } finally {
            if (submitBtn) submitBtn.disabled = false;
            if (spinner)   spinner.style.display = 'none';
            if (submitText) submitText.textContent = isRegister ? 'CREAR CUENTA' : 'INICIAR SESIÓN';
        }
    });

    // ── Google Sign-In ────────────────────────────────────────────
    if (window.google?.accounts?.id) {
        initGoogleAuth();
    } else {
        window.addEventListener('load', () => {
            if (window.google?.accounts?.id) initGoogleAuth();
            else setTimeout(() => { if (window.google?.accounts?.id) initGoogleAuth(); }, 1500);
        });
    }
}

function setupUIInteractions() {
    const checkoutBtn = document.getElementById('btn-checkout-whatsapp');
    const checkoutOverlay = document.getElementById('checkout-overlay');
    const closeCheckoutBtn = document.getElementById('close-checkout-btn');
    const cartOverlay = document.getElementById('cart-overlay');
    
    // Header cart button is handled in cartState (openCart)
    // Close button handles in cartState (closeCart)

    // Checkout actions
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', procesarCompraWhatsApp);
    }
    if (closeCheckoutBtn && checkoutOverlay) {
        closeCheckoutBtn.addEventListener('click', () => checkoutOverlay.classList.remove('active'));
    }

    // Mobile Menu Actions
    const menuBtn = document.getElementById('open-menu-btn');
    const closeMenuBtn = document.getElementById('close-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-link, .mobile-sublink');

    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', () => mobileMenu.classList.add('active'));
    }
    
    if (closeMenuBtn && mobileMenu) {
        closeMenuBtn.addEventListener('click', () => mobileMenu.classList.remove('active'));
    }

    // Smooth scroll and auto-close upon selecting a link
    mobileLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            // Check if it's pointing to an anchor on this page
            if (link.getAttribute('href').startsWith('#')) {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const targetSection = document.getElementById(targetId);
                
                // Close menu
                if (mobileMenu) mobileMenu.classList.remove('active');
                
                // Scroll if section exists
                if (targetSection) {
                    targetSection.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });
    
    // Minimal Checkout Form logic (Fake Processing)
    const checkoutFormMinimal = document.getElementById('checkout-form-minimal');
    const submitOrderBtn = document.querySelector('.btn-checkout-submit');
    const emailInput = document.getElementById('email-min');
    
    if (checkoutFormMinimal && submitOrderBtn) {
        checkoutFormMinimal.addEventListener('submit', (e) => {
            e.preventDefault();
            const originalText = submitOrderBtn.textContent;
            
            // Simulating payment process
            submitOrderBtn.textContent = 'PROCESANDO PAGO...';
            submitOrderBtn.disabled = true;
            if (window.gsap) gsap.to(submitOrderBtn, {opacity: 0.5, yoyo: true, repeat: -1, duration: 0.3});

            setTimeout(() => {
                if (window.gsap) gsap.killTweensOf(submitOrderBtn);
                
                submitOrderBtn.style.opacity = '1';
                submitOrderBtn.style.color = 'green';
                submitOrderBtn.textContent = `PAGO EXITOSO - RECIBO A ${emailInput.value.toUpperCase()}`;
                
                // Limpiar carrito globalmente
                localStorage.removeItem('ellel_cart');
                
                setTimeout(() => {
                    const checkoutOverlay = document.getElementById('checkout-overlay');
                    if (checkoutOverlay) checkoutOverlay.classList.remove('active');
                    
                    // Resetear Formulario
                    checkoutFormMinimal.reset();
                    submitOrderBtn.textContent = originalText;
                    submitOrderBtn.disabled = false;
                    submitOrderBtn.style.color = '';
                    
                    // Refrescar para reiniciar el UI del carrito
                    window.location.reload();
                }, 2500);
            }, 2000);
        });
    }

    // Nav smooth scroll (Explore Catalog to grid)
    const exploreBtn = document.querySelector('.btn-black.pulse-anim');
    if (exploreBtn) {
        exploreBtn.addEventListener('click', () => {
             document.getElementById('catalogo').scrollIntoView({ behavior: 'smooth' });
        });
    }

    // NOTE: Search is now handled by initSearch() from search.js
    // Filter by gender — real filtering of product cards
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');

            const genero = e.target.dataset.genero || ''; // '' = todos
            const cards  = document.querySelectorAll('.product-card');

            cards.forEach(card => {
                const cardGenero = card.dataset.genero || '';
                const show = !genero || cardGenero === genero;

                if (show) {
                    card.style.display = '';
                    gsap.fromTo(card,
                        { y: 20, autoAlpha: 0 },
                        { y: 0, autoAlpha: 1, duration: 0.4, ease: 'back.out' }
                    );
                } else {
                    gsap.to(card, {
                        autoAlpha: 0, y: -10, duration: 0.25, ease: 'power2.in',
                        onComplete: () => { card.style.display = 'none'; }
                    });
                }
            });
        });
    });

    // Bind Quick Add functionality
    setupQuickAddParams();
    
    // Interactive 360 Logo Rotation
    setupLogoRotation();
}

/**
 * Global products reference for wishlist rendering
 */
let allProducts = [];

/**
 * Handles wishlist drawer, animations and interactions
 */
function setupWishlistInteractions() {
    const wishlistBtn = document.getElementById('header-wishlist-btn');
    const closeWishlistBtn = document.getElementById('close-wishlist-btn');
    const wishlistOverlay = document.getElementById('wishlist-overlay');
    const exploreBtn = document.getElementById('wishlist-explore-btn');

    const openWishlist = () => {
        wishlistOverlay.classList.add('active');
        document.body.classList.add('wishlist-open');
        renderWishlistItems();
    };

    const closeWishlist = () => {
        wishlistOverlay.classList.remove('active');
        document.body.classList.remove('wishlist-open');
    };

    if (wishlistBtn) wishlistBtn.addEventListener('click', openWishlist);
    if (closeWishlistBtn) closeWishlistBtn.addEventListener('click', closeWishlist);
    if (wishlistOverlay) {
        wishlistOverlay.addEventListener('click', (e) => {
            if (e.target === wishlistOverlay) closeWishlist();
        });
    }
    if (exploreBtn) {
        exploreBtn.addEventListener('click', () => {
            closeWishlist();
            document.getElementById('catalogo').scrollIntoView({ behavior: 'smooth' });
        });
    }

    // Listen for custom state changes
    window.addEventListener('wishlistUpdated', (e) => {
        updateWishlistBadge(e.detail.count);
        if (wishlistOverlay.classList.contains('active')) {
            renderWishlistItems();
        }
    });

    // Delegate heart clicks on product cards
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.wishlist-btn');
        if (!btn) return;

        e.preventDefault();
        e.stopPropagation();

        const productId = btn.dataset.id;
        const isNowLiked = toggleWishlist(productId);

        // Animation logic
        btn.classList.add('spinning');
        
        // Wait for animation half-point to change visual state
        setTimeout(() => {
            if (isNowLiked) {
                btn.classList.add('liked');
            } else {
                btn.classList.remove('liked');
            }
        }, 300);

        // Remove animation class when done
        setTimeout(() => {
            btn.classList.remove('spinning');
        }, 650);
    });

    // Delegate actions inside the Wishlist Drawer
    document.addEventListener('click', (e) => {
        const removeBtn = e.target.closest('.btn-remove-wish');
        const addToCartBtn = e.target.closest('.btn-wish-to-cart');

        if (removeBtn) {
            const id = removeBtn.dataset.id;
            toggleWishlist(id); // Untoggle
            
            // Also update the card heart in the background if visible
            const cardHeart = document.querySelector(`.product-card[id="${id}"] .wishlist-btn`);
            if (cardHeart) cardHeart.classList.remove('liked');
        }

        if (addToCartBtn) {
            const id = addToCartBtn.dataset.id;
            const product = allProducts.find(p => String(p.id) === String(id));
            if (product) {
                addToCart({
                    id: product.id,
                    name: product.nombre,
                    price: product.precio,
                    qty: 1,
                    img: product.imagenes[0],
                    size: "L",
                    color: "Estándar"
                });
                
                // Switch drawers for a better UX
                closeWishlist();
                setTimeout(() => openCart(), 300);
            }
        }
    });
}

function renderWishlistItems() {
    const fromStorage = JSON.parse(localStorage.getItem('ellel_wishlist') || '[]');
    const container = document.getElementById('wishlist-items-container');
    const emptyState = document.getElementById('wishlist-empty-state');
    
    if (!container || !emptyState) return;

    if (fromStorage.length === 0) {
        container.style.display = 'none';
        emptyState.style.display = 'flex';
        return;
    }

    container.style.display = 'flex';
    emptyState.style.display = 'none';

    // Filter products that are in the wishlist
    const favoriteProducts = allProducts.filter(p => fromStorage.includes(String(p.id)));

    container.innerHTML = favoriteProducts.map(p => `
        <div class="wishlist-item" data-id="${p.id}">
            <img src="${p.imagenes[0]}" alt="${p.nombre}" class="wish-item-img">
            <div class="wish-item-info">
                <h3 class="wish-item-title">${p.nombre}</h3>
                <span class="wish-item-price">$${p.precio.toFixed(2)}</span>
                <button class="btn-wish-to-cart" data-id="${p.id}">+ AÑADIR AL CARRITO</button>
            </div>
            <button class="btn-remove-wish" data-id="${p.id}" aria-label="Eliminar">
                <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="3" fill="none"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
        </div>
    `).join('');
}

function updateWishlistBadge(count) {
    const badge = document.querySelector('.wishlist-badge');
    if (!badge) return;
    
    const finalCount = count !== undefined ? count : getWishlistCount();
    badge.textContent = finalCount;
    
    // Subtle pop effect if count > 0
    if (finalCount > 0) {
        badge.style.transform = 'scale(1.2)';
        setTimeout(() => badge.style.transform = 'scale(1)', 200);
    }
}

/**
 * Permite girar el logo manualmente y añade efecto 3D tilt
 */
function setupLogoRotation() {
    const logoLink = document.querySelector('.logo-link');
    const logoImg = logoLink?.querySelector('img');
    if (!logoImg) return;

    let isDragging = false;
    let startX = 0;
    let currentRotation = 0;

    // Efecto 3D Tilt al mover el mouse
    logoLink.addEventListener('mousemove', (e) => {
        if (isDragging) return;
        
        const rect = logoLink.getBoundingClientRect();
        const x = e.clientX - rect.left; // x position within the element
        const y = e.clientY - rect.top;  // y position within the element
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 8; // Sensibilidad vertical
        const rotateY = (centerX - x) / 5; // Sensibilidad horizontal
        
        gsap.to(logoImg, { 
            rotateX: rotateY, // Toco invertido para efecto natural
            rotateY: -rotateX, 
            scale: 1.1,
            duration: 0.5, 
            ease: 'power2.out',
            transformPerspective: 1000
        });
    });

    logoLink.addEventListener('mouseleave', () => {
        if (isDragging) return;
        gsap.to(logoImg, { 
            rotateX: 0, 
            rotateY: 0, 
            scale: 1,
            duration: 0.8, 
            ease: 'back.out(1.7)' 
        });
    });

    // Giro manual de 360 grados al hacer clic o arrastrar
    logoImg.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX;
        logoImg.style.cursor = 'grabbing';
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const deltaX = e.clientX - startX;
        const rotationJump = deltaX * 1.5; 
        gsap.set(logoImg, { rotation: currentRotation + rotationJump });
    });

    window.addEventListener('mouseup', (e) => {
        if (!isDragging) return;
        isDragging = false;
        logoImg.style.cursor = 'grab';
        
        const deltaX = e.clientX - startX;
        currentRotation += deltaX * 1.5;
        
        if (Math.abs(deltaX) > 20) {
            gsap.to(logoImg, { 
                rotation: currentRotation + (deltaX * 2), 
                duration: 1.5, 
                ease: 'power2.out'
            });
        }
    });

    // Touch support para móviles
    logoImg.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        isDragging = true;
    }, {passive: true});

    window.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        const deltaX = e.touches[0].clientX - startX;
        gsap.set(logoImg, { rotation: currentRotation + (deltaX * 1.5) });
    }, {passive: true});

    window.addEventListener('touchend', (e) => {
        if (!isDragging) return;
        isDragging = false;
        const deltaX = e.changedTouches[0].clientX - startX;
        currentRotation += deltaX * 1.5;
    });
}

function setupQuickAddParams() {
    const quickAddBtns = document.querySelectorAll('.add-to-cart-hidden');
    
    quickAddBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); 
            const card = e.target.closest('.product-card');
            if(card) {
               const imgEl = card.querySelector('.product-img');
               const titleEl = card.querySelector('.product-title');
               const priceStr = card.querySelector('.product-price').textContent;
               const price = parseFloat(priceStr.replace(/[^0-9.-]+/g,""));
               const id = e.target.getAttribute('data-id');
 
               addToCart({
                   id: id || Math.random().toString(),
                   name: titleEl ? titleEl.textContent : "Producto Genérico",
                   price: price || 0,
                   qty: 1,
                   img: imgEl ? imgEl.src : "./src/assets/img/logo-square.png",
                   size: "L",
                   color: "Negro"
               });
            } else {
               openCart();
            }
        });
    });
}

function setupCarousel() {
    if (!document.querySelector('.mySwiper')) return;

    const swiper = new Swiper(".mySwiper", {
        // 1. Efecto Coverflow (Apple 3D Style)
        effect: "coverflow",
        coverflowEffect: {
            rotate: 10,     /* Ligera inclinación 3D profesional */
            stretch: 0,     /* Espaciado natural */
            depth: 250,     /* Profundidad en el eje Z */
            modifier: 1,    /* Escala de intensidad */
            slideShadows: false, /* Sin sombras negras agresivas */
        },
        
        grabCursor: true, 
        centeredSlides: true, 
        slidesPerView: "auto", 
        loop: true, 
        speed: 800, 
        
        // 3. Reproducción Automática
        autoplay: {
            delay: 4000, 
            disableOnInteraction: false, 
        },
        
        // 4. Controles de Navegación
        navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
        },
        
        // 5. Controles de Paginación
        pagination: {
            el: ".swiper-pagination",
            clickable: true, 
            dynamicBullets: false, 
        },

        // Optimización de rendimiento
        watchSlidesProgress: true,
    });
}
