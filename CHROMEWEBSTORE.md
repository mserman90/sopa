# Chrome Web Store Metadata (Placeholder)

**Project Name:** TÜİK İl Bazlı Girdi Analizi

**Description:**
A lightweight web application that visualizes regional agricultural input prices based on TÜİK data. The app provides search, report building, Excel export, and PDF generation (via jsPDF). It is built with Tailwind CSS and vanilla JavaScript and runs entirely client‑side.

**Version:** 1.0.0

**Manifest (v3) – Minimal example** (for future conversion to a Chrome Extension):
```json
{
  "manifest_version": 3,
  "name": "TÜİK İl‑Bazlı Girdi Analizi",
  "description": "Interactive analysis of regional agricultural input prices.",
  "version": "1.0",
  "icons": {
    "48": "assets/icons/icon48.png",
    "128": "assets/icons/icon128.png"
  },
  "action": {
    "default_popup": "index.html",
    "default_title": "TÜİK Girdi Analizi"
  },
  "permissions": [],
  "host_permissions": [],
  "web_accessible_resources": [{
    "resources": ["assets/**"],
    "matches": ["<all_urls>"]
  }]
}
```

**Key notes for publishing:**
- The app currently uses CDN‑loaded libraries (Tailwind, SheetJS, jsPDF). For Chrome Web Store submission, consider bundling these locally to avoid external scripts.
- Ensure all assets (icons, CSS, JS) are included in the extension package.
- Review the Chrome Web Store policy for data handling and privacy; the app only uses client‑side mock data, no personal info is collected.

**Next steps:**
1. Add the `assets/icons/` folder with appropriate icons (48 × 48 px and 128 × 128 px).
2. Replace CDN scripts with local copies or bundle them via a build step.
3. Update the manifest version if additional permissions are needed.

---
*Generated on 2026‑11‑01 by Antigravity (AGY).*