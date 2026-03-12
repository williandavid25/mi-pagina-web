const STORAGE_KEY = 'ellel_wishlist';

/**
 * Gets the current wishlist from localStorage (array of IDs)
 */
export const getWishlist = () => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        console.error('Error reading wishlist from localStorage', e);
        return [];
    }
};

/**
 * Saves the wishlist to localStorage
 */
const saveWishlist = (wishlist) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlist));
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('wishlistUpdated', { detail: { count: wishlist.length } }));
};

/**
 * Toggles a product in the wishlist
 */
export const toggleWishlist = (productId) => {
    let wishlist = getWishlist();
    const index = wishlist.indexOf(String(productId));
    const isAdding = index === -1;

    if (isAdding) {
        wishlist.push(String(productId));
    } else {
        wishlist.splice(index, 1);
    }

    saveWishlist(wishlist);
    return isAdding; // Returns new state
};

/**
 * Checks if a product is in the wishlist
 */
export const isInWishlist = (productId) => {
    return getWishlist().includes(String(productId));
};

/**
 * Returns total items in wishlist
 */
export const getWishlistCount = () => {
    return getWishlist().length;
};
