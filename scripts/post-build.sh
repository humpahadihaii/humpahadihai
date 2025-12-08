#!/bin/bash
# Post-build script to support GitHub Pages and ensure SPA routing

# Copy index.html to 404.html for GitHub Pages SPA support
if [ -f "dist/index.html" ]; then
  cp dist/index.html dist/404.html
  echo "Created 404.html for GitHub Pages SPA support"
fi

# Ensure .htaccess is in dist folder
if [ -f "public/.htaccess" ]; then
  cp public/.htaccess dist/.htaccess
  echo "Copied .htaccess to dist folder"
fi

echo "Post-build completed successfully"
