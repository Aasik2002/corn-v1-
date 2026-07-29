# Implementation Plan - CornAI Frontend

This document outlines the step-by-step plan to initialize, build, and configure the React frontend for the CornAI agricultural application, matching the dark premium glassmorphic UI design shown in the reference screenshots.

## Design Alignment & Theme (From Screenshots)
- **Background**: Deep forest charcoal-green (`#0E1612` or `#111E15`).
- **Cards**: Translucent dark green glassmorphic panels (`bg-white/5` or `bg-[#1a2b20]/40` with `backdrop-blur-lg border border-white/10` or `border-[#263e2e]/60`).
- **Text**: Off-white for primary headings (`#E2E8F0` or `#FFFFFF`), mint/light gray for descriptions (`#94A3B8` or `#8CA394`), and bright brand green for highlights (`#10B981` or `#16A34A`).
- **Interactive Elements**:
  - Buttons: Solid vibrant green (`#008A2E` or `#16A34A`) with glowing hover states.
  - Alerts/Badges: Lime Green (`#84CC16`) and Crimson Red (`#EF4444`).

---

## Proposed Changes

### Phase 1: Git Workflow & Project Initialization
We will clear the existing files in the `frontend` folder (excluding `node_modules` to preserve cached installations where possible, or doing a full clean) and run the commands exactly as requested:
1. Initialize Vite React project: `npm create vite@latest frontend -- --template react` (we can clear the folder beforehand to make it fully non-interactive).
2. Change directory: `cd frontend`
3. Initialize Git: `git init`
4. Create initial commit: `git commit --allow-empty -m "Initial commit - Project Setup"`
5. Switch to feature branch: `git checkout -b feature/ui-foundation`

### Phase 2: Dependencies Installation
In `frontend/`, install the required libraries:
- `react-router-dom` for application routing
- `lucide-react` for premium icon sets
- `recharts` for the Disease Trend line chart
- `axios` for centralized API connections

### Phase 3: Configuration & Styles Setup
1. **[vite.config.js](file:///d:/1.project/corn_disease_v1/frontend/vite.config.js)**: Configure Vite with the `@tailwindcss/vite` plugin for Tailwind CSS v4.
2. **[src/index.css](file:///d:/1.project/corn_disease_v1/frontend/src/index.css)**: Set up the global CSS variables and base rules:
   - Root variables for colors (`--bg-primary`, `--bg-card`, `--color-primary`, `--color-accent`).
   - Deep charcoal background on body.
   - Glassmorphic card custom utility classes.
   - CSS scanning animation utility (moving horizontal scanning bar).
   - Google Font import (Inter or Outfit) for clean typography.

### Phase 4: Shared State & Services
1. **[src/services/api.js](file:///d:/1.project/corn_disease_v1/frontend/src/services/api.js)**: Axios instance configured for Express backend (`http://localhost:4000/api` or `http://localhost:5000/api` depending on `.env`).
2. **[src/services/mlApi.js](file:///d:/1.project/corn_disease_v1/frontend/src/services/mlApi.js)**: Axios instance for FastAPI (`http://localhost:5000/predict` or `http://localhost:8000/predict`).
3. **[src/context/AuthContext.jsx](file:///d:/1.project/corn_disease_v1/frontend/src/context/AuthContext.jsx)**: Authentication state manager supplying currentUser, registration, login, and profile update actions.

### Phase 5: UI Pages & Components (matching design screenshots)
We will build all pages with high-fidelity Tailwind styling:
1. **Top Navbar / Sidebar Navigation ([src/components/Navbar.jsx](file:///d:/1.project/corn_disease_v1/frontend/src/components/Navbar.jsx))**:
   - Header style Navbar with Logo, links (Dashboard, New Scan, History, About), search bar, notifications icon, settings gear, and user avatar.
2. **Login Page ([src/pages/Login.jsx](file:///d:/1.project/corn_disease_v1/frontend/src/pages/Login.jsx))**:
   - Centered login card containing a beautiful corn plant graphic inside the translucent panel, text inputs with icons, and a solid green "Login ->" button.
3. **Register Page ([src/pages/Register.jsx](file:///d:/1.project/corn_disease_v1/frontend/src/pages/Register.jsx))**:
   - Background featuring the custom illustration of a farmer walking through cornfields, and a registration panel with "Create your account".
4. **Dashboard Page ([src/pages/Dashboard.jsx](file:///d:/1.project/corn_disease_v1/frontend/src/pages/Dashboard.jsx))**:
   - "Field Overview" layout with the 3 top metrics cards (Crop Vitality Score with progress bar, Weekly Scans, and Monthly Scans with CR/GR/HT breakdowns).
   - Recharts "Disease Trend Analysis" Line Chart.
   - Smiley-face "Your Farm is Safe zone" card with a cartoon corn illustration.
   - Optimized Harvest Prediction panel with "Update Schedule" and "Next Analyze" buttons.
5. **New Scan Page ([src/pages/NewScan.jsx](file:///d:/1.project/corn_disease_v1/frontend/src/pages/NewScan.jsx))**:
   - Left side: Large dashed drag & drop area with camera icon.
   - Right side: Scan Tips panel with an illustrative potted corn plant at the top.
   - Action bar with "Start ML Analysis" and "Take Photo" buttons.
6. **Real-Time Scanning Page ([src/pages/ScanningHUD.jsx](file:///d:/1.project/corn_disease_v1/frontend/src/pages/ScanningHUD.jsx))**:
   - Close-up leaf camera feed with overlay text HUD showing coordinates, chlorophyll density, and AI confidence loading bar.
   - Left tips card containing the farmer vector illustration.
   - Right visual preview of spots with a rotating circular loading ring.
7. **Scan History ([src/pages/ScanHistory.jsx](file:///d:/1.project/corn_disease_v1/frontend/src/pages/ScanHistory.jsx))**:
   - Searchable table for review of previous scans with color-coded status badges.
8. **Profile Page ([src/pages/Profile.jsx](file:///d:/1.project/corn_disease_v1/frontend/src/pages/Profile.jsx))**:
   - User profile info forms, edit avatar icon, Save Changes, and Logout.

---

## Backend Adjustments
1. **[backend/controllers/authController.js](file:///d:/1.project/corn_disease_v1/backend/controllers/authController.js)**: Implement profile update logic.
2. **[backend/routes/authRoutes.js](file:///d:/1.project/corn_disease_v1/backend/routes/authRoutes.js)**: Link the `PUT /profile` route to authController.

---

## Verification Plan

### Automated Tests
- Build verification: Run `npm run build` in the `frontend` folder.

### Manual Verification
- Verify the dev server runs and rendering matches the dark glassmorphic scheme.
- Verify the routing redirects unauthenticated users to the Login page.
- Test login, registration, dashboard data rendering, image upload scanning state, and profile editing.
