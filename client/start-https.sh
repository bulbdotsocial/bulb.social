#!/bin/bash

# Alternative way to run with HTTPS using a different approach
echo "Starting development server with HTTPS..."

# Option 1: Use mkcert for local HTTPS (if available)
if command -v mkcert &> /dev/null; then
    echo "Using mkcert for HTTPS certificates..."
    mkcert -install
    mkcert localhost 127.0.0.1 ::1
    npm run dev -- --https --cert localhost+2.pem --key localhost+2-key.pem
else
    echo "mkcert not found. Using basic HTTPS..."
    # Option 2: Use browser with insecure flags for testing
    echo "To test camera functionality, you can:"
    echo "1. Install mkcert: https://github.com/FiloSottile/mkcert"
    echo "2. Or use Chrome with --allow-running-insecure-content --disable-web-security flags"
    echo "3. Or test on localhost (which is considered secure)"
    npm run dev
fi
