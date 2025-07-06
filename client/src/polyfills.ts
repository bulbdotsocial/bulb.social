// Polyfills pour les modules Node.js dans le navigateur
import { Buffer } from 'buffer';

// Rendre Buffer disponible globalement
if (typeof globalThis !== 'undefined') {
    globalThis.Buffer = Buffer;
} else if (typeof window !== 'undefined') {
    (window as any).Buffer = Buffer;
} else if (typeof global !== 'undefined') {
    (global as any).Buffer = Buffer;
}

export { Buffer };
