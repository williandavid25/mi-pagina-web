export const WishlistDrawer = () => {
    return `
        <div class="wishlist-overlay" id="wishlist-overlay">
            <aside class="wishlist-drawer" id="wishlist-drawer">
                <div class="wishlist-header">
                    <h2>MIS FAVORITOS</h2>
                    <button class="close-wishlist-btn" id="close-wishlist-btn" aria-label="Cerrar favoritos">
                        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>
                
                <div class="wishlist-body">
                    <!-- Empty state -->
                    <div class="wishlist-empty-state" id="wishlist-empty-state">
                        <div class="empty-heart-icon">
                            <svg viewBox="0 0 24 24" width="60" height="60" fill="none" stroke="#ddd" stroke-width="1.5"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
                        </div>
                        <p>TU LISTA DE DESEOS ESTÁ VACÍA</p>
                        <button class="btn-wishlist-explore" id="wishlist-explore-btn">VER CATÁLOGO</button>
                    </div>

                    <!-- List of items -->
                    <div class="wishlist-items-container" id="wishlist-items-container" style="display: none;">
                        <!-- Favorite items injected here -->
                    </div>
                </div>
            </aside>
        </div>
    `;
};
