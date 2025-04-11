/**
 * This script modifies the build process to create a static site compatible with GitHub Pages.
 * Run it with "node gh-pages.js" before building.
 */

// Since we can't directly modify vite.config.ts, we'll use environment variables
// to signal our build process

process.env.GITHUB_PAGES = "true";

console.log("GitHub Pages environment configured!");
console.log("Building static site for deployment...");

// Execute the build command
require('child_process').execSync('vite build --outDir dist', {
  cwd: process.cwd(),
  stdio: 'inherit'
});

console.log("Build completed successfully!");