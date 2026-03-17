/**
 * HistoryManager.js
 * Centralized utility to handle browser history for modals and drawers.
 * This allows the hardware/swipe back button on mobile to close overlays
 * instead of navigating away from the page.
 */

class HistoryManager {
    constructor() {
        this.modals = new Map(); // Store open modals: id -> closeCallback
        this.isHandlingPop = false;
        
        // Listen for history back/forward
        window.addEventListener('popstate', (event) => {
            this.handlePopState(event);
        });
    }

    /**
     * Registers a modal as open and pushes a state to history.
     * @param {string} id Unique identifier for the modal
     * @param {function} closeFn Callback function to close the modal
     */
    pushState(id, closeFn) {
        if (this.modals.has(id)) return; // Already tracked

        this.modals.set(id, closeFn);
        
        // Push a state into history
        // We use a prefix to identify our modal states
        const stateName = `modal_${id}`;
        window.history.pushState({ modalId: id }, '', '');
        console.log(`[HistoryManager] Pushed state for: ${id}`);
    }

    /**
     * Handles manual close (via X button or overlay click).
     * If the modal was opened via history, we go back.
     * @param {string} id Unique identifier for the modal
     */
    closeManual(id) {
        if (this.modals.has(id)) {
            this.modals.delete(id);
            // Go back in history to remove the pushed state
            // This will trigger popstate, but our handlePopState will see it's already gone
            window.history.back();
            console.log(`[HistoryManager] Manual close, history.back() called for: ${id}`);
        }
    }

    /**
     * Internal handler for popstate events (Back button/swipe)
     */
    handlePopState(event) {
        if (this.isHandlingPop) return;

        console.log(`[HistoryManager] PopState detected. State:`, event.state);

        // If we have open modals, and the new state is NOT a modal state for the current top modal,
        // it means the user went BACK.
        if (this.modals.size > 0) {
            const entries = Array.from(this.modals.entries());
            const [currentId, closeFn] = entries[entries.length - 1];

            // If the popped state's modalId is NOT the current one, we should close current
            if (!event.state || event.state.modalId !== currentId) {
                console.log(`[HistoryManager] Back detected. Closing modal: ${currentId}`);
                
                this.isHandlingPop = true;
                this.modals.delete(currentId);
                
                if (typeof closeFn === 'function') {
                    try { closeFn(true); } // Pass true to indicate it was a history back
                    catch (e) { console.error('Error in closeFn', e); }
                }
                
                this.isHandlingPop = false;
            }
        }
    }
}

// Singleton instance
const instance = new HistoryManager();
export default instance;
