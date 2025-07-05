// Global polyfills for browser compatibility with Node.js modules
import { Buffer } from 'buffer';

// Extend window interface for polyfills
declare global {
  // eslint-disable-next-line no-var
  var global: typeof globalThis;
  // eslint-disable-next-line no-var
  var Buffer: typeof Buffer;
}

// Make Buffer and global available
globalThis.global = globalThis;
globalThis.Buffer = Buffer;

export {};
