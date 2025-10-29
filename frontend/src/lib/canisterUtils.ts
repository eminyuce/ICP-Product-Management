// Utility functions for canister ID management

/**
 * Get the backend canister ID from various sources
 * This function tries multiple methods to determine the canister ID
 * and works for both authenticated and unauthenticated users
 */
export function getBackendCanisterId(): string | null {
    try {
        console.log('[getBackendCanisterId] Starting canister ID detection...');
        
        // Method 1: Check window object (set by dfx)
        if (typeof window !== 'undefined') {
            const win = window as any;
            
            if (win.canisterId) {
                console.log('[getBackendCanisterId] Found canister ID in window.canisterId:', win.canisterId);
                return win.canisterId;
            }
            
            if (win.ic?.canisterId) {
                console.log('[getBackendCanisterId] Found canister ID in window.ic.canisterId:', win.ic.canisterId);
                return win.ic.canisterId;
            }
            
            // Try to read from canister_ids.json if available
            // This is typically set by dfx during development
            if (win.__CANISTER_IDS__?.backend) {
                console.log('[getBackendCanisterId] Found canister ID in window.__CANISTER_IDS__.backend:', win.__CANISTER_IDS__.backend);
                return win.__CANISTER_IDS__.backend;
            }
        }

        // Method 2: Check environment variables (Vite)
        if (import.meta.env.VITE_CANISTER_ID_BACKEND) {
            console.log('[getBackendCanisterId] Found canister ID in VITE_CANISTER_ID_BACKEND:', import.meta.env.VITE_CANISTER_ID_BACKEND);
            return import.meta.env.VITE_CANISTER_ID_BACKEND;
        }

        // Method 3: Extract from current URL if on IC network
        const hostname = window.location.hostname;
        console.log('[getBackendCanisterId] Checking hostname:', hostname);
        
        // Check for IC domains
        if (hostname.includes('.ic0.app') || 
            hostname.includes('.raw.ic0.app') || 
            hostname.includes('.icp0.io') || 
            hostname.includes('.raw.icp0.io')) {
            const parts = hostname.split('.');
            if (parts.length > 0 && parts[0]) {
                console.log('[getBackendCanisterId] Extracted canister ID from IC domain:', parts[0]);
                return parts[0];
            }
        }

        // Method 4: For localhost, try to get from storage
        if (hostname.includes('localhost') || hostname === '127.0.0.1') {
            const stored = localStorage.getItem('backendCanisterId') || 
                          sessionStorage.getItem('backendCanisterId');
            if (stored) {
                console.log('[getBackendCanisterId] Found canister ID in storage:', stored);
                return stored;
            }
        }

        console.warn('[getBackendCanisterId] Could not determine backend canister ID from any source');
        return null;
    } catch (error) {
        console.error('[getBackendCanisterId] Error getting backend canister ID:', error);
        return null;
    }
}

/**
 * Store the canister ID for later retrieval
 * Useful for caching the canister ID once it's determined
 */
export function storeBackendCanisterId(canisterId: string): void {
    try {
        if (typeof window !== 'undefined') {
            localStorage.setItem('backendCanisterId', canisterId);
            sessionStorage.setItem('backendCanisterId', canisterId);
            console.log('[storeBackendCanisterId] Stored canister ID:', canisterId);
        }
    } catch (error) {
        console.error('[storeBackendCanisterId] Error storing backend canister ID:', error);
    }
}

/**
 * Construct a public file URL for blob storage
 * Works for both local development and production
 */
export function constructPublicFileUrl(path: string, canisterId: string): string {
    console.log('[constructPublicFileUrl] Starting - path:', path, 'canisterId:', canisterId);
    
    const isLocalhost = window.location.hostname.includes('localhost') || 
                       window.location.hostname === '127.0.0.1';
    
    console.log('[constructPublicFileUrl] Is localhost:', isLocalhost);
    
    let url: string;
    
    if (isLocalhost) {
        // Local development: use localhost with port
        const port = window.location.port || '4943';
        url = `http://${canisterId}.localhost:${port}/files/${encodeURIComponent(path)}`;
        console.log('[constructPublicFileUrl] Constructed localhost URL:', url);
    } else {
        // Production: use raw.icp0.io for direct file access without authentication
        const protocol = window.location.protocol;
        url = `${protocol}//${canisterId}.raw.icp0.io/files/${encodeURIComponent(path)}`;
        console.log('[constructPublicFileUrl] Constructed production URL:', url);
    }
    
    console.log('[constructPublicFileUrl] Final URL:', url);
    return url;
}
