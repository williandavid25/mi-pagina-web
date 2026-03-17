/**
 * global.js
 * handles global UI initialization for all pages.
 */

import { MiniCart } from '../components/cart/MiniCart.js';
import { CheckoutModal } from '../components/forms/CheckoutForm.js';
import { AuthModal } from '../components/auth/AuthModal.js';
import { WishlistDrawer } from '../components/wishlist/WishlistDrawer.js';
import { initCart, signOut } from './cartState.js';
import { initWishlist, openWishlist } from './wishlistState.js';
import { initGoogleAuth, openAuthModal, closeAuthModal } from './auth.js';
import { initSearch } from './search.js';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Inject common containers if they exist
    const cartContainer = document.getElementById('cart-container');
    if (cartContainer) cartContainer.innerHTML = MiniCart();

    const checkoutContainer = document.getElementById('checkout-container');
    if (checkoutContainer) checkoutContainer.innerHTML = CheckoutModal();

    const authContainer = document.getElementById('auth-container');
    if (authContainer) authContainer.innerHTML = AuthModal();

    const wishlistContainer = document.getElementById('wishlist-container');
    if (wishlistContainer) wishlistContainer.innerHTML = WishlistDrawer();

    // 2. Initialize states
    initCart();
    initWishlist();
    initGoogleAuth();
    initSearch();

    // 3. Setup global UI interactions (Header Auth & Mobile Menu)
    setupGlobalInteractions();
});

function setupGlobalInteractions() {
    document.addEventListener('click', (e) => {
        // Auth buttons
        if (e.target.closest('#header-login-btn') || e.target.closest('#cart-login-trigger')) {
            openAuthModal();
        }
        if (e.target.closest('#header-user-avatar') || e.target.closest('#cart-signout-btn')) {
            if (e.target.closest('#header-user-avatar')) {
                if (confirm('¿Cerrar sesión?')) signOut();
            } else {
                signOut();
            }
        }
        if (e.target.closest('#auth-close-btn') || e.target.id === 'auth-modal-overlay') {
            closeAuthModal();
        }

        // Mobile Menu
        const openMenuBtn = document.getElementById('open-menu-btn');
        const closeMenuBtn = document.getElementById('close-menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');

        if (e.target.closest('#open-menu-btn')) {
            mobileMenu?.classList.add('active');
        }
        if (e.target.closest('#close-menu-btn') || e.target.closest('.mobile-menu-overlay')) {
            mobileMenu?.classList.remove('active');
        }
    });

    // Special case for scroll-driven header (present on all pages)
    window.addEventListener('scroll', () => {
        const header = document.getElementById('main-header');
        if (window.scrollY > 50) {
            header?.classList.add('scrolled');
        } else {
            header?.classList.remove('scrolled');
        }
    }, { passive: true });
}
