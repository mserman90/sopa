# TÜİK İl Bazlı Girdi Analizi

A single‑page web application that lets users query and export regional agricultural input price data (mocked for demo purposes). The UI is built with **Tailwind CSS** (via CDN) and vanilla JavaScript.

## Project structure
```
tuik_analysis/
├─ index.html                # Main page – loads external CSS/JS
├─ assets/
│  ├─ css/
│  │   └─ main.css          # Custom Tailwind overrides & utilities
│  ├─ js/
│  │   └─ app.js            # All UI logic, search, report, export, PDF
│  └─ data/
│      └─ mock.json         # (Future) mock database for lazy loading
├─ CHROMEWEBSTORE.md         # Metadata for a future Chrome Extension
└─ README.md                # This file
```

## How to run locally
1. Open `index.html` in a modern browser (Chrome/Edge/Firefox). No server is required – everything runs client‑side.
2. The app loads two external libraries via CDN:
   - **SheetJS** (`xlsx.full.min.js`) for Excel export.
   - **jsPDF** (`jspdf.umd.min.js`) for PDF generation.
3. Interact with the UI:
   - Choose a city, main group, sub‑category, and period, then click **İl Bazlı Sorgula**.
   - Use the free‑text AI search box (mocked) for quick queries.
   - Add rows to the report with **+ Rapora Ekle** and export the report via the **Yazdır / PDF** button.
   - Export the current result table to Excel using the **Excel** button.

## Accessibility notes
- All interactive controls now have explicit `aria-label` attributes.
- Toast notifications use `role="alert"` and `aria-live="assertive"` for screen‑reader announcements.
- Buttons are keyboard‑focusable and provide clear visual focus via Tailwind defaults.

## Future improvements (roadmap)
- **Lazy‑load mock data**: move the generated dataset to `assets/data/mock.json` and load it with `fetch()` to reduce the initial script size.
- **Tailwind JIT build**: replace the CDN import with a locally compiled CSS file to trim unused utilities.
- **Full Chrome Extension packaging**: see `CHROMEWEBSTORE.md` for the required manifest and publishing checklist.
- **Unit tests**: add a simple test harness (e.g., Jest) for the data‑filtering logic.

---
*Generated on 2026‑11‑01 by Antigravity (AGY).*