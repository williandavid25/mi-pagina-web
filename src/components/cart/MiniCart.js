export const MiniCart = () => {
    return `
        <div class="mini-cart-overlay" id="cart-overlay">
            <aside class="mini-cart" id="mini-cart">
                <div class="cart-header-empty">
                    <button class="close-btn-minimal" id="close-cart-btn" aria-label="Cerrar carrito">
                        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>
                
                <div class="cart-body-scrollable">
                    <!-- CONTENEDOR CARRITO VACÍO -->
                    <div class="cart-empty-state" id="cart-empty-state">
                        <h2 class="empty-title">TU CARRITO ESTA VACÍO</h2>
                        <p class="empty-subtitle">¿Tienes una cuenta? Inicia sesión para pagar más rápido.</p>
                        
                        <button class="btn-keep-shopping" id="btn-keep-shopping">SEGUIR COMPRANDO</button>
                        
                        <button class="btn-get-offer vibrate-anim" id="btn-get-offer">
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M19 6h-4c0-1.66-1.34-3-3-3s-3 1.34-3 3H5c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-1c.55 0 1 .45 1 1h-2c0-.55.45-1 1-1zm7 14H5V8h14v11z"/><circle cx="12" cy="12" r="2"/></svg>
                            Obtener Oferta!
                        </button>
                    </div>

                    <!-- CONTENEDOR ITEMS CARRITO -->
                    <div class="cart-filled-state" id="cart-filled-state" style="display: none;">
                        <div id="cart-items-wrapper"></div>
                        
                        <div class="cart-footer">
                            <div class="cart-summary-row total">
                                <span>Subtotal</span>
                                <span id="cart-subtotal">$0.00</span>
                            </div>
                            <button class="btn btn-black pag-btn" id="open-checkout-btn">PASAR POR CAJA</button>
                        </div>
                    </div>
                </div>
            </aside>
        </div>
    `;
};
