import { initAnimations, animateProductCards } from './animations.js';
import { ProductGrid } from '../components/product/ProductGrid.js';
import { MiniCart } from '../components/cart/MiniCart.js';
import { CheckoutModal } from '../components/forms/CheckoutForm.js';
import { initCart, addToCart, openCart } from './cartState.js';
// ParticleCursor se ejecuta de forma global ahora desde su propio script

document.addEventListener('DOMContentLoaded', async () => {
    console.log('Aplicación iniciada');
    
    // Iniciar animaciones globales de GSAP
    initAnimations();
    
    // 1. Renderizar componentes estáticos (Modales) MODO SINCRONO ANTES DE FETCH!
    const cartContainer = document.getElementById('cart-container');
    if (cartContainer) cartContainer.innerHTML = MiniCart();
    
    const checkoutContainer = document.getElementById('checkout-container');
    if (checkoutContainer) checkoutContainer.innerHTML = CheckoutModal();

    // 2. Inicializar Estado del Carrito y Lógica DOM
    initCart();
    setupUIInteractions();
    
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

function setupUIInteractions() {
    const checkoutBtn = document.getElementById('open-checkout-btn');
    const checkoutOverlay = document.getElementById('checkout-overlay');
    const closeCheckoutBtn = document.getElementById('close-checkout-btn');
    const cartOverlay = document.getElementById('cart-overlay');
    
    // Header cart button is handled in cartState (openCart)
    // Close button handles in cartState (closeCart)

    // Checkout actions
    if (checkoutBtn && checkoutOverlay && cartOverlay) {
        checkoutBtn.addEventListener('click', () => {
            cartOverlay.classList.remove('active'); 
            checkoutOverlay.classList.add('active'); 
        });
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

    // Search button popup logic
    const searchBtn = document.querySelector('.search-btn');
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
             const query = prompt('¿Qué estás buscando?');
             if(query) {
                 alert('Has buscado: ' + query + '. (La función de búsqueda se activará con la base de datos final).');
             }
        });
    }

    // Simple Filter UI Toggle
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
             filterBtns.forEach(b => b.classList.remove('active'));
             e.target.classList.add('active');
             
             // Animates the grid to simulate "filtering" loading state
             gsap.fromTo('.product-card', 
                 { y: 20, autoAlpha: 0 }, 
                 { y: 0, autoAlpha: 1, duration: 0.5, stagger: 0.05, ease: 'back.out' }
             );
        });
    });

    // Bind Quick Add functionality
    setupQuickAddParams();
    
    // Interactive 360 Logo Rotation
    setupLogoRotation();
}

/**
 * Permite girar el logo manualmente interactuando con el mouse
 */
function setupLogoRotation() {
    const logoImg = document.querySelector('.logo-link img');
    if (!logoImg) return;

    let isDragging = false;
    let startX = 0;
    let currentRotation = 0;

    // Efecto de imán / seguimiento ligero al mover el mouse
    logoImg.addEventListener('mousemove', (e) => {
        if (isDragging) return;
        const rect = logoImg.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const deltaX = e.clientX - centerX;
        const rotation = deltaX * 0.2; // Sensibilidad ligera
        gsap.to(logoImg, { rotation: rotation, duration: 0.5, ease: 'power2.out' });
    });

    logoImg.addEventListener('mouseleave', () => {
        if (isDragging) return;
        gsap.to(logoImg, { rotation: 0, duration: 0.8, ease: 'back.out(1.7)' });
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
        const rotationJump = deltaX * 1.5; // Rapidez del giro
        gsap.set(logoImg, { rotation: currentRotation + rotationJump });
    });

    window.addEventListener('mouseup', (e) => {
        if (!isDragging) return;
        isDragging = false;
        logoImg.style.cursor = 'grab';
        
        const deltaX = e.clientX - startX;
        currentRotation += deltaX * 1.5;
        
        // Animación de inercia si el giro fue rápido
        if (Math.abs(deltaX) > 20) {
            gsap.to(logoImg, { 
                rotation: currentRotation + (deltaX * 2), 
                duration: 1.5, 
                ease: 'power2.out',
                onComplete: () => {
                    // Opcional: Volver a 0 o quedarse ahí
                    // gsap.to(logoImg, { rotation: 0, delay: 2, duration: 1 });
                }
            });
        }
    });

    // Touch support para móviles
    logoImg.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        isDragging = true;
    });

    window.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        const deltaX = e.touches[0].clientX - startX;
        gsap.set(logoImg, { rotation: currentRotation + (deltaX * 1.5) });
    });

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
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.querySelector('.prev-nav');
    const nextBtn = document.querySelector('.next-nav');
    
    if (slides.length === 0) return;
    
    let currentSlide = 0;
    
    function goToSlide(n) {
        slides[currentSlide].classList.remove('active');
        dots[currentSlide].classList.remove('active');
        slides[currentSlide].style.transform = `translateX(${-100 * n}%)`; // Ensure proper direction hidden
        slides[currentSlide].style.opacity = '0';
        
        currentSlide = (n + slides.length) % slides.length;
        
        slides[currentSlide].classList.add('active');
        dots[currentSlide].classList.add('active');
        
        // Arrange items physically
        slides.forEach((slide, index) => {
             slide.style.transform = `translateX(${-100 * currentSlide}%)`;
             slide.style.opacity = index === currentSlide ? '1' : '0';
        });
    }
    
    // Initialize 
    goToSlide(0);
    
    if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => goToSlide(currentSlide - 1));
        nextBtn.addEventListener('click', () => goToSlide(currentSlide + 1));
    }
    
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => goToSlide(index));
    });
    
    // Auto advance
    setInterval(() => goToSlide(currentSlide + 1), 5000);
}
