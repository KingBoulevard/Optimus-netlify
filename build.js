/**
 * Build script for Netlify deployment
 * Copies Images and Profile folders from root into static/ directory
 * This allows the GitHub structure to have Images and Profile at root,
 * while Netlify serves them from the static/ publish directory.
 */

const fs = require("fs");
const path = require("path");

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();

  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      );
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

// Copy Images folder from root to static/Images
const imagesSrc = path.join(__dirname, "Images");
const imagesDest = path.join(__dirname, "static", "Images");

if (fs.existsSync(imagesSrc)) {
  console.log("Copying Images folder to static/Images...");
  copyRecursiveSync(imagesSrc, imagesDest);
  console.log("✓ Images folder copied successfully");
} else {
  console.log("⚠ Images folder not found at root, skipping...");
}

// Copy Profile folder from root to static/Profile
const profileSrc = path.join(__dirname, "Profile");
const profileDest = path.join(__dirname, "static", "Profile");

if (fs.existsSync(profileSrc)) {
  console.log("Copying Profile folder to static/Profile...");
  copyRecursiveSync(profileSrc, profileDest);
  console.log("✓ Profile folder copied successfully");
} else {
  console.log("⚠ Profile folder not found at root, skipping...");
}

console.log("Build script completed!");

